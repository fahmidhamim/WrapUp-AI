import { useEffect } from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroScene from "@/components/landing/HeroScene";
import StarfieldBackground from "@/components/landing/StarfieldBackground";
import TrustedBySection from "@/components/landing/TrustedBySection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import DeviceShowcaseSection from "@/components/landing/DeviceShowcaseSection";
import DemoSection from "@/components/landing/DemoSection";
import ProToolsSection from "@/components/landing/ProToolsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import ContactSection from "@/components/landing/ContactSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <div className="dark cinema-gradient text-foreground min-h-screen overflow-x-hidden relative">
      <StarfieldBackground />
      <LandingNavbar />
      <HeroScene />
      <TrustedBySection />
      <FeaturesSection />
      <HowItWorksSection />
      <DeviceShowcaseSection />
      <DemoSection />
      <ProToolsSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <CTASection />
      <Footer />
    </div>
  );
}
