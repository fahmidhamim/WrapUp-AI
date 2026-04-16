import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Cpu, FileText, Share2, Zap, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import LandingNavbar from "@/components/landing/LandingNavbar";
import StarfieldBackground from "@/components/landing/StarfieldBackground";
import Footer from "@/components/landing/Footer";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Record or Upload",
    desc: "Start a live meeting or upload an existing audio/video file. We support 40+ formats including MP3, MP4, WAV, WebM, and more.",
    details: [
      "One-click recording from your browser",
      "Drag-and-drop file upload",
      "Supports 40+ audio/video formats",
      "Automatic calendar integration for scheduled meetings",
    ],
    accent: "from-primary to-glow",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Processes Your Meeting",
    desc: "Our AI transcribes, identifies speakers, detects sentiment, and extracts key topics — all in real-time with under 2 seconds latency.",
    details: [
      "99.2% transcription accuracy",
      "Speaker identification via voice fingerprinting",
      "Real-time sentiment analysis",
      "90+ languages and dialects supported",
    ],
    accent: "from-violet-500 to-purple-400",
  },
  {
    icon: FileText,
    step: "03",
    title: "Get Smart Summaries",
    desc: "Receive structured summaries with action items, decisions, and follow-ups — instantly after your meeting ends.",
    details: [
      "Auto-generated action items with assignees",
      "Key decisions highlighted",
      "Custom summary templates",
      "AI Chat to ask questions about your meetings",
    ],
    accent: "from-cyan-500 to-blue-400",
  },
  {
    icon: Share2,
    step: "04",
    title: "Share & Collaborate",
    desc: "Share insights with your team, export to your favorite tools, and track action items to completion.",
    details: [
      "Export to Notion, Slack, Google Docs & more",
      "Share meeting insights with teammates",
      "Track action items to completion",
      "Integrate with Jira, Asana, Linear & more",
    ],
    accent: "from-emerald-500 to-teal-400",
  },
];

const benefits = [
  { icon: Zap, title: "Save 90% of Follow-up Time", desc: "No more manual note-taking or writing follow-up emails." },
  { icon: Clock, title: "Under 2s Latency", desc: "Real-time transcription keeps up with your conversation." },
  { icon: CheckCircle, title: "Never Miss Action Items", desc: "AI automatically detects commitments and deadlines." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function HowItWorksPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="dark cinema-gradient text-foreground min-h-screen overflow-x-hidden relative">
      <StarfieldBackground />
      <LandingNavbar />

      <section className="relative pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 text-primary mb-6 backdrop-blur-sm bg-primary/5">
              Simple 4-Step Process
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              How WrapUp <span className="gradient-text">Works</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From recording to actionable insights — here's exactly how WrapUp transforms your meetings.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="space-y-8 mb-24">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i}
                className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-8 hover:border-primary/20 hover:bg-white/[0.04] transition-all duration-500"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.accent} flex items-center justify-center shadow-lg shrink-0`}>
                    <step.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-muted-foreground/50 tracking-wider">STEP {step.step}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.desc}</p>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Benefits */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
              Why Teams <span className="gradient-text">Love It</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {benefits.map((b, i) => (
                <motion.div key={b.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-6 text-center hover:border-primary/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <b.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <Link to="/signup" className="inline-flex items-center gap-2 gradient-bg text-primary-foreground px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
