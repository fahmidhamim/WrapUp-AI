from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException, Request

from backend.core.security import get_current_user
from backend.models.domain import UserContext
from backend.routers.deps import get_container
from backend.schemas.stripe import (
    CheckSubscriptionResponse,
    CreateCheckoutSessionRequest,
    CreateCheckoutSessionResponse,
    CustomerPortalRequest,
    CustomerPortalResponse,
    StripeWebhookResponse,
)
from backend.services.container import ServiceContainer

router = APIRouter(prefix="/stripe", tags=["stripe"])


@router.post("/webhook", response_model=StripeWebhookResponse)
async def stripe_webhook(
    request: Request,
    stripe_signature: str | None = Header(default=None, alias="Stripe-Signature"),
    container: ServiceContainer = Depends(get_container),
) -> StripeWebhookResponse:
    payload = await request.body()
    try:
        await container.stripe.handle_webhook(payload=payload, signature_header=stripe_signature)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return StripeWebhookResponse(received=True)


@router.post("/create-checkout-session", response_model=CreateCheckoutSessionResponse)
async def create_checkout_session(
    request: CreateCheckoutSessionRequest,
    container: ServiceContainer = Depends(get_container),
    user: UserContext = Depends(get_current_user),
) -> CreateCheckoutSessionResponse:
    if not user.email:
        raise HTTPException(status_code=400, detail="Authenticated user has no email")
    try:
        url = await container.stripe.create_checkout_session(
            user_id=user.id,
            user_email=user.email,
            plan_type=request.plan_type,
            origin=request.origin,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return CreateCheckoutSessionResponse(url=url)


@router.get("/check-subscription", response_model=CheckSubscriptionResponse)
async def check_subscription(
    container: ServiceContainer = Depends(get_container),
    user: UserContext = Depends(get_current_user),
) -> CheckSubscriptionResponse:
    if not user.email:
        raise HTTPException(status_code=400, detail="Authenticated user has no email")
    try:
        payload = await container.stripe.check_subscription(user_email=user.email)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return CheckSubscriptionResponse(**payload)


@router.post("/customer-portal", response_model=CustomerPortalResponse)
async def customer_portal(
    request: CustomerPortalRequest,
    container: ServiceContainer = Depends(get_container),
    user: UserContext = Depends(get_current_user),
) -> CustomerPortalResponse:
    if not user.email:
        raise HTTPException(status_code=400, detail="Authenticated user has no email")
    try:
        url = await container.stripe.create_customer_portal(
            user_email=user.email,
            return_url=request.return_url,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return CustomerPortalResponse(url=url)
