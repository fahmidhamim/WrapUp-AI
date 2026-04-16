import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRODUCT_TIER_MAP: Record<string, "plus" | "business"> = {
  prod_UKS29aq6k17Xr8: "plus",
  prod_UKSMdrzwwqOx3y: "business",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    // Use anon key to authenticate the user
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await anonClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    // Use service role to write to DB
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      // No Stripe customer — ensure DB row is free
      await adminClient.from("subscriptions").upsert(
        {
          user_id: user.id,
          plan_type: "free",
          status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let productId: string | null = null;
    let tier: "free" | "plus" | "business" = "free";
    let subscriptionEnd: string | null = null;
    let stripeSubscriptionId: string | null = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      stripeSubscriptionId = subscription.id;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      productId = String(subscription.items.data[0].price.product);
      tier = PRODUCT_TIER_MAP[productId] ?? "free";

      // Sync subscription into DB using service role key
      await adminClient.from("subscriptions").upsert(
        {
          user_id: user.id,
          plan_type: tier,
          status: "active",
          stripe_customer_id: customerId,
          stripe_subscription_id: stripeSubscriptionId,
          current_period_end: subscriptionEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      // Also update profiles.role so feature gates work
      await adminClient
        .from("profiles")
        .update({ role: "premium", updated_at: new Date().toISOString() })
        .eq("id", user.id);
    } else {
      // No active subscription — revert to free in DB
      await adminClient.from("subscriptions").upsert(
        {
          user_id: user.id,
          plan_type: "free",
          status: "active",
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      await adminClient
        .from("profiles")
        .update({ role: "free", updated_at: new Date().toISOString() })
        .eq("id", user.id);
    }

    return new Response(
      JSON.stringify({ subscribed: hasActiveSub, product_id: productId, tier, subscription_end: subscriptionEnd }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
