import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Upload, Radio, BarChart3, Calendar, PhoneCall, Settings, X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOUR_KEY = "wrapup_onboarding_complete";

const steps = [
  {
    icon: Sparkles,
    title: "Welcome to WrapUp! 🎙️",
    description: "Let's take a quick tour of your dashboard. We'll show you the key features to help you get the most out of your meetings.",
    color: "from-primary to-glow",
  },
  {
    icon: Video,
    title: "Meetings",
    description: "View, manage, and revisit all your meetings in one place. Access transcripts, summaries, and AI-powered insights.",
    color: "from-primary to-glow",
  },
  {
    icon: Upload,
    title: "Upload",
    description: "Upload audio or video recordings of your meetings. WrapUp will automatically transcribe and summarize them for you.",
    color: "from-emerald-500 to-teal-400",
  },
  {
    icon: Radio,
    title: "Instant Meeting",
    description: "Start a live meeting instantly with real-time transcription and AI-powered note-taking running in the background.",
    color: "from-rose-500 to-pink-400",
  },
  {
    icon: PhoneCall,
    title: "Join Meeting",
    description: "Join an existing meeting session using a meeting code. Collaborate with your team in real time.",
    color: "from-sky-500 to-blue-400",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track engagement, participation trends, and meeting efficiency with detailed visual analytics.",
    color: "from-violet-500 to-purple-400",
  },
  {
    icon: Calendar,
    title: "Calendar",
    description: "Stay organized with a calendar view of all your scheduled and past meetings.",
    color: "from-amber-500 to-orange-400",
  },
  {
    icon: Settings,
    title: "Settings",
    description: "Customize your preferences, manage your account, and configure integrations to fit your workflow.",
    color: "from-slate-500 to-gray-400",
  },
];

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setVisible(false);
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-md glass rounded-2xl border border-border/50 p-6 shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={finish}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Step indicator */}
            <div className="flex items-center gap-1.5 mb-5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === step ? "w-6 bg-primary" : i < step ? "w-3 bg-primary/50" : "w-3 bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Icon */}
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${current.color} flex items-center justify-center mb-4`}>
              <Icon className="h-7 w-7 text-primary-foreground" />
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold mb-2">{current.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{current.description}</p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <Button variant="ghost" size="sm" onClick={prev}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                )}
                {isFirst && (
                  <Button variant="ghost" size="sm" onClick={finish} className="text-muted-foreground">
                    Skip tour
                  </Button>
                )}
              </div>
              <Button size="sm" className="gradient-bg text-primary-foreground font-semibold" onClick={next}>
                {isLast ? "Get Started" : "Next"}
                {!isLast && <ArrowRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
