import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CheckoutPlanType } from "@/lib/stripe";
import { openExternalUrl } from "@/lib/app-shell";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "per user / month",
    desc: "For individuals getting started with meeting notes.",
    cta: "Sign Up",
    ctaVariant: "outline" as const,
    popular: false,
    aiSection: {
      title: "WrapUp AI",
      features: ["Basic transcription & AI summaries", "30-min session limit"],
    },
    featureGroups: [
      {
        label: null,
        features: [
          "5 meetings per month",
          "Basic search",
          "Email support",
          "7-day transcript history",
          "1 workspace",
        ],
      },
    ],
  },
  {
    name: "Plus",
    price: "$4.99",
    period: "per user / month",
    desc: "For professionals who need more from every meeting.",
    cta: "Get Started",
    ctaVariant: "outline" as const,
    popular: false,
    aiSection: {
      title: "WrapUp AI",
      features: ["AI summaries & action items", "Speaker identification"],
    },
    featureGroups: [
      {
        label: "Everything in Free",
        features: [
          "50 meetings per month",
          "Unlimited session length",
          "60-day transcript history",
          "PDF & text export",
          "Basic integrations",
          "Priority email support",
        ],
      },
    ],
    integrations: ["slack", "google", "zoom"],
  },
  {
    name: "Business",
    price: "$11.99",
    period: "per user / month",
    desc: "For growing teams to streamline collaboration.",
    cta: "Get Started",
    ctaVariant: "default" as const,
    popular: true,
    aiSection: {
      title: "WrapUp AI Pro",
      features: ["Advanced AI summaries", "Sentiment analysis", "Custom vocabulary"],
    },
    featureGroups: [
      {
        label: "Everything in Plus",
        features: [
          "Unlimited meetings",
          "Unlimited transcript history",
          "Analytics dashboard",
          "Team workspaces",
          "Shared meeting libraries",
          "Real-time collaboration",
          "Premium integrations",
          "Calendar sync",
          "Custom branding",
        ],
      },
    ],
    integrations: ["slack", "notion", "figma", "linear", "zoom"],
  },
  {
    name: "Enterprise Custom",
    price: "Custom",
    period: null,
    desc: "For organizations needing security, scale & control.",
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    popular: false,
    aiSection: {
      title: "WrapUp AI Pro",
      features: ["Zero data retention with LLM", "Private AI deployment"],
    },
    featureGroups: [
      {
        label: "Everything in Business",
        features: [
          "SSO & SAML authentication",
          "Advanced security & controls",
          "Audit log",
          "User provisioning (SCIM)",
          "Dedicated success manager",
          "SLA guarantee",
          "Custom integrations & API",
        ],
      },
    ],
  },
];

interface PricingSectionProps {
  heading?: string;
  subheading?: string;
  sectionClassName?: string;
}

export default function PricingSection({ heading, subheading, sectionClassName }: PricingSectionProps = {}) {
  const { user } = useAuth();

  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const planTypeMap: Record<string, CheckoutPlanType> = {
    Plus: "plus",
    Business: "business",
  };

  const getCheckoutErrorMessage = async (error: unknown, planName: string) => {
    let rawMessage =
      error instanceof Error && error.message
        ? error.message
        : typeof error === "string"
          ? error
          : "";

    if (typeof error === "object" && error !== null && "context" in error) {
      const context = (error as { context?: unknown }).context;
      if (context instanceof Response) {
        try {
          const payload = await context.clone().json() as { error?: string };
          if (payload?.error) {
            rawMessage = payload.error;
          }
        } catch {
          // Ignore JSON parsing issues and fall back to the raw error message.
        }
      }
    }

    const normalizedMessage = rawMessage.toLowerCase();
    if (
      normalizedMessage.includes("failed to send a request to the edge function") ||
      normalizedMessage.includes("failed to fetch")
    ) {
      return `Could not start ${planName} checkout because the Supabase Edge Function create-checkout-session could not be reached from this app.`;
    }

    if (normalizedMessage.includes("unauthorized")) {
      return `Could not start ${planName} checkout because the Supabase Edge Function create-checkout-session rejected the current session. Please sign in again and retry.`;
    }

    if (rawMessage) {
      return `Could not start ${planName} checkout through the Supabase Edge Function create-checkout-session. ${rawMessage}`;
    }

    return `Could not start ${planName} checkout because the Supabase Edge Function create-checkout-session did not return a usable response.`;
  };

  const handlePlanClick = async (planName: string) => {
    if (planName === "Free") {
      navigate(user ? "/dashboard/profile" : "/signup");
      return;
    }
    if (planName === "Enterprise Custom") {
      navigate("/contact");
      return;
    }
    if (!user) {
      navigate("/login?redirect=/dashboard/pricing");
      return;
    }

    // Logged-in user → initiate Stripe checkout
    const planType = planTypeMap[planName];
    if (!planType) return;

    setLoadingPlan(planName);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { planType },
      });
      if (error) throw error;
      if (data?.url) {
        await openExternalUrl(data.url);
      } else {
        throw new Error("No checkout URL was returned.");
      }
    } catch (err: any) {
      toast.error(await getCheckoutErrorMessage(err, planName));
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className={sectionClassName ?? "py-32 relative"}>
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp} custom={0}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 text-primary mb-6 tracking-wider uppercase">
            Pricing
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">{heading ?? "Simple, transparent pricing"}</h2>
          <p className="text-muted-foreground text-lg font-body">{subheading ?? "Start free. Upgrade when your team needs more."}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 max-w-6xl mx-auto items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp} custom={i}
              className={`rounded-2xl relative flex flex-col ${
                plan.popular
                  ? "border-2 border-primary shadow-lg shadow-primary/10"
                  : "border border-border"
              } bg-card`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold bg-primary text-primary-foreground rounded-full px-4 py-1 shadow-md">
                  Recommended
                </span>
              )}

              {/* Header */}
              <div className="p-6 pb-0">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{plan.desc}</p>

                <div className="mt-5">
                  <Button
                    className={`w-full rounded-xl font-semibold ${
                      plan.popular
                        ? "gradient-bg text-primary-foreground"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    disabled={loadingPlan === plan.name}
                    onClick={() => handlePlanClick(plan.name)}
                  >
                    {loadingPlan === plan.name ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {plan.cta}
                  </Button>
                </div>
              </div>

              {/* AI section */}
              <div className="mx-6 mt-6 rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">{plan.aiSection.title}</span>
                </div>
                <ul className="space-y-1.5">
                  {plan.aiSection.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 mt-0.5 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Feature groups */}
              <div className="p-6 flex-1 flex flex-col gap-4">
                {plan.featureGroups.map((group, gi) => (
                  <div key={gi}>
                    {group.label && (
                      <p className="text-xs font-medium text-muted-foreground mb-3">{group.label}</p>
                    )}
                    <ul className="space-y-2.5">
                      {group.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                          <Check className="h-3.5 w-3.5 mt-0.5 text-primary flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
