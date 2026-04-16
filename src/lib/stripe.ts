import type { SubscriptionTier } from "./subscription";

export const STRIPE_TIERS = {
  plus: {
    price_id: "price_1TLn8lFeOJEhyHTsFEaqKdDn",
    product_id: "prod_UKS29aq6k17Xr8",
  },
  business: {
    price_id: "price_1TLnS7FeOJEhyHTsGZvKhi7r",
    product_id: "prod_UKSMdrzwwqOx3y",
  },
} as const;

export type CheckoutPlanType = keyof typeof STRIPE_TIERS;

export function getTierByProductId(productId: string): CheckoutPlanType | null {
  for (const [tier, config] of Object.entries(STRIPE_TIERS)) {
    if (config.product_id === productId) return tier as CheckoutPlanType;
  }
  return null;
}

export function getSubscriptionTierFromProductId(productId: string | null | undefined): SubscriptionTier {
  if (!productId) return "free";
  return getTierByProductId(productId) ?? "free";
}
