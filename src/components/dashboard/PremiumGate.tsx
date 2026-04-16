import { Lock, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { isTierAtLeast, type SubscriptionTier } from "@/lib/subscription";

interface PremiumGateProps {
  children: React.ReactNode;
  tier: SubscriptionTier;
  minimumTier?: SubscriptionTier;
  featureName?: string;
}

export function PremiumGate({
  children,
  tier,
  minimumTier = "plus",
  featureName = "This feature",
}: PremiumGateProps) {
  if (isTierAtLeast(tier, minimumTier)) return <>{children}</>;

  return (
    <div className="relative">
      <div className="opacity-30 pointer-events-none select-none blur-[2px]">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
        <Lock className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm font-semibold mb-1">{featureName} is {minimumTier[0].toUpperCase() + minimumTier.slice(1)}+</p>
        <p className="text-xs text-muted-foreground mb-4 max-w-xs text-center">
          Upgrade your plan to unlock advanced features and remove limits.
        </p>
        <Button asChild size="sm" className="gradient-bg text-primary-foreground">
          <Link to="/pricing">
            <Crown className="h-3.5 w-3.5 mr-1" /> Upgrade
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function PlanBadge({ tier }: { tier: SubscriptionTier }) {
  const label = tier[0].toUpperCase() + tier.slice(1);
  const isPaid = tier !== "free";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
        isPaid ? "bg-amber-500/15 text-amber-600 border-amber-500/20" : "bg-muted text-muted-foreground border-border"
      }`}
    >
      {isPaid ? <Crown className="h-3 w-3" /> : null}
      {label}
    </span>
  );
}

export function MeetingLimitBanner({ used, limit }: { used: number; limit: number }) {
  const remaining = Math.max(0, limit - used);
  const pct = Math.min(100, Math.round((used / limit) * 100));

  if (remaining > 3) return null;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium">
          {remaining === 0
            ? "Monthly meeting limit reached"
            : `${remaining} meeting${remaining === 1 ? "" : "s"} remaining this month`}
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{used} / {limit} meetings used</p>
      </div>
      <Button asChild size="sm" variant="outline" className="shrink-0">
        <Link to="/pricing">
          <Crown className="h-3.5 w-3.5 mr-1" /> Upgrade
        </Link>
      </Button>
    </div>
  );
}
