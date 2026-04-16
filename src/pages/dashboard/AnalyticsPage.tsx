import { BarChart3 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { PremiumGate } from "@/components/dashboard/PremiumGate";

export default function AnalyticsPage() {
  const { tier } = useSubscription();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <PremiumGate tier={tier} minimumTier="business" featureName="Advanced Analytics">
        <div className="glass rounded-xl p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Meeting analytics including engagement scores, talk-time ratios, sentiment analysis, and trend tracking will be available here.
          </p>
        </div>
      </PremiumGate>
    </div>
  );
}
