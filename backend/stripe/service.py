from __future__ import annotations

import hashlib
import hmac
import json
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from backend.core.config import Settings
from backend.db.supabase import SupabaseClient

try:
    import stripe
except Exception:  # pragma: no cover
    stripe = None

def verify_stripe_signature(payload: bytes, signature_header: str, webhook_secret: str, tolerance_seconds: int = 300) -> bool:
    pairs = signature_header.split(",")
    signed_values: dict[str, str] = {}
    for pair in pairs:
        key, _, value = pair.partition("=")
        if key and value:
            signed_values[key] = value
    timestamp = signed_values.get("t")
    signature = signed_values.get("v1")
    if not timestamp or not signature:
        return False
    signed_payload = f"{timestamp}.{payload.decode('utf-8')}".encode("utf-8")
    expected = hmac.new(webhook_secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        return False
    if abs(time.time() - int(timestamp)) > tolerance_seconds:
        return False
    return True


@dataclass(slots=True)
class StripeService:
    settings: Settings
    db: SupabaseClient

    async def handle_webhook(self, payload: bytes, signature_header: str | None) -> dict[str, Any]:
        if not self.settings.stripe_webhook_secret:
            raise ValueError("STRIPE_WEBHOOK_SECRET is not configured")
        if not signature_header:
            raise ValueError("Missing Stripe-Signature header")
        event = self._construct_event(payload=payload, signature_header=signature_header)
        event_id = event.get("id")
        event_type = event.get("type", "")

        if not event_id:
            raise ValueError("Missing event id")
        if await self._is_event_processed(event_id):
            return {"received": True, "deduplicated": True}

        await self._mark_event_processed(event_id, event_type, payload)

        event_type = event.get("type", "")
        data_object = event.get("data", {}).get("object", {})

        if event_type.startswith("customer.subscription."):
            await self._sync_subscription(data_object, event_type)
        elif event_type in {"invoice.paid", "invoice.payment_failed"}:
            await self._sync_invoice_event(data_object, event_type)
        return {"received": True}

    def _stripe_client(self):
        if stripe is None:
            raise RuntimeError("Stripe SDK is not installed")
        if not self.settings.stripe_secret_key:
            raise RuntimeError("STRIPE_SECRET_KEY is not configured")
        stripe.api_key = self.settings.stripe_secret_key
        return stripe

    def _get_price_id(self, plan_type: str) -> str:
        plan = plan_type.lower().strip()
        if plan == "plus" and self.settings.stripe_price_plus:
            return self.settings.stripe_price_plus
        if plan == "business" and self.settings.stripe_price_business:
            return self.settings.stripe_price_business
        raise ValueError("Invalid or unconfigured plan type. Expected plus or business.")

    async def create_checkout_session(self, *, user_id: str, user_email: str, plan_type: str, origin: str) -> str:
        client = self._stripe_client()
        price_id = self._get_price_id(plan_type)
        customers = client.Customer.list(email=user_email, limit=1)
        customer_id = customers.data[0].id if customers.data else None
        checkout = client.checkout.Session.create(
            customer=customer_id,
            customer_email=None if customer_id else user_email,
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=f"{origin}/dashboard/profile?checkout=success",
            cancel_url=f"{origin}/pricing",
            metadata={"user_id": user_id, "plan_type": plan_type},
        )
        if not checkout.url:
            raise RuntimeError("Stripe checkout session did not include URL")
        return checkout.url

    async def check_subscription(self, *, user_email: str) -> dict[str, Any]:
        client = self._stripe_client()
        customers = client.Customer.list(email=user_email, limit=1)
        if not customers.data:
            return {"subscribed": False, "product_id": None, "tier": "free", "subscription_end": None}

        customer_id = customers.data[0].id
        subscriptions = client.Subscription.list(customer=customer_id, status="active", limit=1)
        if not subscriptions.data:
            return {"subscribed": False, "product_id": None, "tier": "free", "subscription_end": None}

        subscription = subscriptions.data[0]
        product_id = None
        tier = "free"
        if subscription.items and subscription.items.data:
            item = subscription.items.data[0]
            product_id = item.price.product
            tier = self._map_plan_type(getattr(item.price, "id", None))
        period_end = self._safe_dt(subscription.current_period_end)
        return {"subscribed": True, "product_id": product_id, "tier": tier, "subscription_end": period_end}

    async def create_customer_portal(self, *, user_email: str, return_url: str) -> str:
        client = self._stripe_client()
        customers = client.Customer.list(email=user_email, limit=1)
        if not customers.data:
            raise ValueError("No Stripe customer found")
        session = client.billing_portal.Session.create(customer=customers.data[0].id, return_url=return_url)
        if not session.url:
            raise RuntimeError("Stripe portal session did not include URL")
        return session.url

    async def reconcile_expired_subscriptions(self) -> int:
        now_iso = datetime.now(timezone.utc).isoformat()
        rows = await self.db.fetch_many(
            "subscriptions",
            filters={
                "status": "active",
                "cancel_at_period_end": True,
                "current_period_end": ("lt", now_iso),
            },
        )
        updated = 0
        for row in rows:
            user_id = row.get("user_id")
            sub_id = row.get("id")
            if not sub_id:
                continue
            await self.db.update_rows(
                "subscriptions",
                filters={"id": sub_id},
                values={"status": "cancelled"},
            )
            await self._sync_user_role(
                user_id=user_id,
                subscription_status="cancelled",
                event_type="internal.period_expired",
            )
            updated += 1
        return updated

    def _construct_event(self, *, payload: bytes, signature_header: str) -> dict[str, Any]:
        if stripe is not None and self.settings.stripe_webhook_secret:
            try:
                event = stripe.Webhook.construct_event(
                    payload=payload,
                    sig_header=signature_header,
                    secret=self.settings.stripe_webhook_secret,
                )
                return event if isinstance(event, dict) else event.to_dict_recursive()
            except Exception as exc:
                raise ValueError(f"Invalid Stripe signature: {exc}") from exc

        if not verify_stripe_signature(payload, signature_header, self.settings.stripe_webhook_secret or ""):
            raise ValueError("Invalid Stripe signature")
        return json.loads(payload.decode("utf-8"))

    async def _is_event_processed(self, event_id: str) -> bool:
        rows = await self.db.fetch_many("stripe_webhook_events", filters={"event_id": event_id})
        return bool(rows)

    async def _mark_event_processed(self, event_id: str, event_type: str, payload: bytes) -> None:
        row = {
            "event_id": event_id,
            "event_type": event_type,
            "processed_at": datetime.now(timezone.utc).isoformat(),
            "payload": json.loads(payload.decode("utf-8")),
        }
        try:
            await self.db.upsert_rows(
                "stripe_webhook_events",
                [row],
                on_conflict="event_id",
                ignore_duplicates=True,
            )
        except Exception:
            # Keep webhook processing available even if migration not yet applied.
            return

    async def _sync_subscription(self, subscription: dict[str, Any], event_type: str) -> None:
        customer_id = subscription.get("customer")
        status = subscription.get("status")
        current_period_end = subscription.get("current_period_end")
        price_id = None
        items = subscription.get("items", {}).get("data", [])
        if items:
            price_id = items[0].get("price", {}).get("id")
        metadata = subscription.get("metadata", {}) or {}
        user_id = metadata.get("user_id")
        metadata_plan_type = metadata.get("plan_type")

        update_data = {
            "stripe_customer_id": customer_id,
            "stripe_subscription_id": subscription.get("id"),
            "status": self._map_subscription_status(status),
            "plan_type": self._map_plan_type(price_id, metadata_plan_type),
            "current_period_start": self._safe_dt(subscription.get("current_period_start")),
            "current_period_end": self._safe_dt(current_period_end),
            "cancel_at_period_end": bool(subscription.get("cancel_at_period_end", False)),
        }

        subscription_id = subscription.get("id")
        if customer_id:
            filters = {"stripe_customer_id": customer_id}
        elif subscription_id:
            filters = {"stripe_subscription_id": subscription_id}
        else:
            filters = {}

        rows = await self.db.update_rows("subscriptions", filters=filters, values=update_data) if filters else []
        if not rows and user_id:
            create_row = update_data | {"user_id": user_id}
            await self.db.insert_rows("subscriptions", [create_row])

        await self._sync_user_role(user_id=user_id, subscription_status=status, event_type=event_type)

    async def _sync_invoice_event(self, invoice: dict[str, Any], event_type: str) -> None:
        customer_id = invoice.get("customer")
        status = "active" if event_type == "invoice.paid" else "inactive"
        await self.db.update_rows(
            "subscriptions",
            filters={"stripe_customer_id": customer_id},
            values={"status": status},
        )

    async def _sync_user_role(self, *, user_id: str | None, subscription_status: str | None, event_type: str) -> None:
        if not user_id:
            return
        profile_role = "premium" if subscription_status in {"active"} and event_type != "customer.subscription.deleted" else "free"
        await self.db.update_rows("profiles", filters={"id": user_id}, values={"role": profile_role})

    @staticmethod
    def _map_subscription_status(status: str | None) -> str:
        if status in {"active", "trialing"}:
            return "active"
        if status in {"canceled", "cancelled", "unpaid", "incomplete_expired"}:
            return "cancelled"
        return "inactive"

    def _map_plan_type(self, price_id: str | None, fallback_plan: str | None = None) -> str:
        normalized_fallback = (fallback_plan or "").lower().strip()
        if normalized_fallback in {"plus", "business", "enterprise"}:
            return normalized_fallback
        if not price_id:
            return "free"
        if self.settings.stripe_price_plus and price_id == self.settings.stripe_price_plus:
            return "plus"
        if self.settings.stripe_price_business and price_id == self.settings.stripe_price_business:
            return "business"
        return "free"

    @staticmethod
    def _safe_dt(epoch_value: Any) -> str | None:
        if epoch_value in (None, ""):
            return None
        try:
            return datetime.fromtimestamp(int(epoch_value), tz=timezone.utc).isoformat()
        except Exception:
            return None
