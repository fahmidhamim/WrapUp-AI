import LandingNavbar from "@/components/landing/LandingNavbar";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />
      <div className="pt-20">
        <PricingSection />
      </div>
      <Footer />
    </div>
  );
}
