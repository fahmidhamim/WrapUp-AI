from pydantic import BaseModel


class StripeWebhookResponse(BaseModel):
    received: bool


class CreateCheckoutSessionRequest(BaseModel):
    plan_type: str
    origin: str


class CreateCheckoutSessionResponse(BaseModel):
    url: str


class CheckSubscriptionResponse(BaseModel):
    subscribed: bool
    product_id: str | None = None
    tier: str = "free"
    subscription_end: str | None = None


class CustomerPortalRequest(BaseModel):
    return_url: str


class CustomerPortalResponse(BaseModel):
    url: str
