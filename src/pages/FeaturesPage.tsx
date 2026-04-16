import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Brain, BarChart3, Users, Zap, Calendar, MessageSquare, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import Footer from "@/components/landing/Footer";
import CTASection from "@/components/landing/CTASection";
import mockSummary from "@/assets/mock-summary.png";
import mockAiChat from "@/assets/mock-ai-chat.png";
import mockDashboard from "@/assets/mock-dashboard.png";
import mockRecording from "@/assets/mock-recording.png";
import mockTranscript from "@/assets/mock-transcript.png";
import mockTeam from "@/assets/mock-team.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const features = [
  {
    id: "live-recording",
    icon: Mic,
    title: "Live Recording",
    tagline: "Capture every word, every nuance",
    description: "WrapUp's live recording engine captures crystal-clear audio from any meeting — whether it's in-person, a video call, or a phone conversation. Our intelligent noise reduction ensures you never miss a detail.",
    bullets: [
      "One-click recording from any device",
      "Automatic noise cancellation & echo removal",
      "Support for 90+ languages with auto-detection",
      "Speaker diarization — know who said what",
      "Cloud storage with unlimited retention",
    ],
    image: mockRecording,
    reversed: false,
  },
  {
    id: "ai-summaries",
    icon: Brain,
    title: "AI Summaries",
    tagline: "From hours of talk to minutes of insight",
    description: "Our advanced AI distills lengthy meetings into concise, actionable summaries. Get key takeaways, decisions made, action items with owners, and follow-up deadlines — all generated within seconds.",
    bullets: [
      "Executive summaries with key decisions",
      "Auto-extracted action items & deadlines",
      "Sentiment analysis for each discussion topic",
      "Custom summary templates per meeting type",
      "Export to Notion, Slack, email & more",
    ],
    image: mockSummary,
    reversed: true,
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Meeting Analytics",
    tagline: "Data-driven insights for better meetings",
    description: "Understand your meeting culture with deep analytics. Track talk-time distribution, engagement scores, meeting frequency, and cost analysis. Identify patterns and optimize how your team collaborates.",
    bullets: [
      "Talk-time ratio per participant",
      "Meeting cost calculator based on attendee roles",
      "Engagement scoring & trend tracking",
      "Weekly/monthly meeting health reports",
      "Benchmarks against industry standards",
    ],
    image: mockDashboard,
    reversed: false,
  },
  {
    id: "team-collaboration",
    icon: Users,
    title: "Team Collaboration",
    tagline: "Share knowledge, align faster",
    description: "Break down silos by making meeting insights accessible to your entire team. Share summaries, tag colleagues, assign tasks, and create a searchable knowledge base from every conversation.",
    bullets: [
      "Shared meeting workspace per team",
      "Tag & mention teammates in notes",
      "Task assignment with due dates",
      "Searchable meeting knowledge base",
      "Role-based access controls",
    ],
    image: mockTeam,
    reversed: true,
  },
  {
    id: "real-time",
    icon: Zap,
    title: "Real-Time Processing",
    tagline: "Insights while you're still talking",
    description: "Don't wait until the meeting ends. WrapUp processes your audio in real-time, providing live transcription, instant topic detection, and on-the-fly summaries so you can stay focused on the conversation.",
    bullets: [
      "Live transcription with <2s latency",
      "Real-time topic & keyword detection",
      "Instant action item flagging",
      "Live sentiment indicators",
      "In-meeting AI suggestions & prompts",
    ],
    image: mockTranscript,
    reversed: false,
  },
  {
    id: "calendar-sync",
    icon: Calendar,
    title: "Calendar Sync",
    tagline: "Seamless integration with your schedule",
    description: "Connect your Google Calendar, Outlook, or any CalDAV calendar. WrapUp automatically detects upcoming meetings, reminds you to record, and attaches summaries to the right calendar event.",
    bullets: [
      "Google Calendar & Outlook integration",
      "Auto-join & record scheduled meetings",
      "Pre-meeting briefs from past conversations",
      "Post-meeting summary attached to events",
      "Smart scheduling conflict detection",
    ],
    image: mockDashboard,
    reversed: true,
  },
  {
    id: "ai-chat",
    icon: MessageSquare,
    title: "AI Chat Assistant",
    tagline: "Your personal meeting memory",
    description: "Ask WrapUp anything about your past meetings. 'What did Sarah say about the budget?' or 'Show me all action items from last week.' Our AI assistant has perfect recall across all your conversations.",
    bullets: [
      "Natural language queries across all meetings",
      "Cross-meeting search & correlation",
      "Context-aware follow-up suggestions",
      "Citation links to exact transcript moments",
      "Multi-language query support",
    ],
    image: mockAiChat,
    reversed: false,
  },
  {
    id: "security",
    icon: Shield,
    title: "Enterprise Security",
    tagline: "Your data, fully protected",
    description: "WrapUp is built with enterprise-grade security from the ground up. End-to-end encryption, SOC 2 compliance, GDPR readiness, and granular admin controls ensure your sensitive meeting data stays safe.",
    bullets: [
      "End-to-end encryption at rest & in transit",
      "SOC 2 Type II certified",
      "GDPR & CCPA compliant",
      "SSO with SAML & OIDC support",
      "Granular admin dashboard & audit logs",
    ],
    image: mockSummary,
    reversed: true,
  },
];

export default function FeaturesPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace("#", ""));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="dark bg-background text-foreground min-h-screen overflow-x-hidden">
      <LandingNavbar />

      {/* Hero */}
      <section className="pt-32 pb-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/8 blur-[150px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 text-primary mb-6 tracking-wider uppercase">
              All Features
            </span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Everything you need to
            <br />
            <span className="gradient-text">master your meetings</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-muted-foreground max-w-2xl mx-auto text-lg font-body">
            Explore the full suite of tools that make WrapUp the most powerful meeting intelligence platform on the market.
          </motion.p>
        </div>
      </section>

      {/* Feature Sections */}
      {features.map((feature, idx) => (
        <section
          key={feature.id}
          id={feature.id}
          className="py-24 relative scroll-mt-24"
        >
          {idx % 2 === 0 && (
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
          )}
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp} custom={0}
              className={`flex flex-col ${feature.reversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-12 lg:gap-20 items-center`}
            >
              {/* Text */}
              <div className="flex-1 max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-medium text-primary tracking-wider uppercase">{feature.tagline}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">{feature.title}</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-8">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.bullets.map((bullet) => (
                    <motion.li key={bullet} variants={fadeUp} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground/80 font-body">{bullet}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Image */}
              <motion.div variants={fadeUp} custom={2} className="flex-1 max-w-lg w-full">
                <div className="glass-card rounded-2xl overflow-hidden p-2 hover:glow-sm transition-all duration-500">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      ))}

      <CTASection />
      <Footer />
    </div>
  );
}
