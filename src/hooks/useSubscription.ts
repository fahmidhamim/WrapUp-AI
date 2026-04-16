import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getTierDefinition, normalizeTier, type SubscriptionTier } from "@/lib/subscription";

export const FREE_MEETING_LIMIT = 5; // per month

export function useSubscription() {
  const { user } = useAuth();

  const subscriptionQuery = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const tier: SubscriptionTier = normalizeTier(subscriptionQuery.data?.plan_type);
  const tierDefinition = getTierDefinition(tier);
  const plan = tier;
  const isPremium = tier !== "free";
  const features = tierDefinition.features;

  return {
    subscriptionQuery,
    plan,
    tier,
    tierDefinition,
    features,
    isPremium,
    isLoading: subscriptionQuery.isLoading,
  };
}
