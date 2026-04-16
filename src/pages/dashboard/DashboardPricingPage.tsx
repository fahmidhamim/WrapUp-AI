import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PricingSection from "@/components/landing/PricingSection";

export default function DashboardPricingPage() {
  const navigate = useNavigate();

  return (
    <div className="pb-12 relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-16 left-20 z-10 flex items-center gap-2.5 text-base font-semibold text-muted-foreground hover:text-foreground transition-colors border border-border rounded-xl px-5 py-2.5 hover:bg-muted/40"
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>
      <PricingSection
        heading="Unlock your full potential"
        subheading="Choose a plan that fits your ambition — and take every meeting further with AI."
        sectionClassName="pt-8 pb-16 relative"
      />
    </div>
  );
}
