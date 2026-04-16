import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import LandingNavbar from "@/components/landing/LandingNavbar";
import StarfieldBackground from "@/components/landing/StarfieldBackground";
import Footer from "@/components/landing/Footer";

const faqCategories = [
  {
    title: "General",
    faqs: [
      { q: "What is WrapUp?", a: "WrapUp is an AI-powered meeting intelligence platform that automatically records, transcribes, summarizes, and extracts action items from your meetings — saving your team hours every week." },
      { q: "How accurate is the AI transcription?", a: "Our AI achieves 99.2% accuracy across 40+ languages, powered by state-of-the-art speech recognition models. It handles accents, overlapping speech, and technical jargon with ease." },
      { q: "Can I use WrapUp with my existing tools?", a: "Absolutely. WrapUp integrates with Slack, Notion, Google Calendar, Microsoft Teams, Zoom, and more. Export summaries and action items directly to your workflow." },
      { q: "Does WrapUp work with pre-recorded audio?", a: "Yes! Upload any audio or video file (MP3, MP4, WAV, WebM, and 30+ more formats) and get the same AI-powered transcription, summaries, and insights." },
      { q: "What platforms does WrapUp support?", a: "WrapUp works on Windows, macOS, Linux (via browser), iOS, and Android. Our desktop apps offer native recording capabilities, while the web app provides full functionality from any modern browser." },
      { q: "Is there a browser extension?", a: "Yes, we offer Chrome and Firefox extensions that allow you to capture meetings directly from your browser, including Google Meet, Zoom Web, and Microsoft Teams web sessions." },
      { q: "Can I try WrapUp for free?", a: "Yes! We offer a 14-day free trial with full access to all features. No credit card required to start." },
    ],
  },
  {
    title: "Transcription & Languages",
    faqs: [
      { q: "How does speaker identification work?", a: "Our AI uses voice fingerprinting to distinguish between speakers automatically. You can also label speakers manually, and the system learns over time for better accuracy." },
      { q: "What languages are supported?", a: "WrapUp supports 90+ languages and dialects, including English, Bangla, Spanish, French, German, Japanese, Chinese (Mandarin & Cantonese), Hindi, Arabic, Portuguese, Korean, and many more." },
      { q: "Can WrapUp handle multiple languages in one meeting?", a: "Yes! Our multi-language detection automatically identifies and transcribes when speakers switch between languages within the same meeting, providing accurate transcription for each language." },
      { q: "How does real-time transcription work?", a: "WrapUp processes audio in real-time with less than 2 seconds of latency. As speakers talk, their words appear on screen, allowing participants to follow along and search through the conversation live." },
      { q: "Can I edit the transcription after a meeting?", a: "Yes, you can manually edit any part of the transcription. Corrections also help train the AI to improve accuracy for future meetings with similar vocabulary." },
      { q: "Does it handle technical jargon?", a: "WrapUp includes a custom vocabulary feature where you can add industry-specific terms, product names, and acronyms. The AI learns your team's terminology for better accuracy." },
      { q: "What audio quality is required?", a: "WrapUp works best with clear audio but can handle various quality levels. We recommend using a good microphone, but our AI can enhance and process even lower-quality recordings." },
    ],
  },
  {
    title: "AI Features",
    faqs: [
      { q: "How does the AI summary work?", a: "After each meeting, our AI generates a structured summary with key discussion points, decisions made, action items with assignees, and follow-up tasks — all within minutes." },
      { q: "Can I customize the summary format?", a: "Yes! You can create custom templates for different meeting types (standups, client calls, brainstorms) and configure what the AI focuses on in each summary." },
      { q: "What is the AI Chat Assistant?", a: "The AI Chat lets you ask questions about your meetings in natural language. For example, 'What did Sarah say about the Q3 budget?' and get instant, sourced answers from your meeting transcripts." },
      { q: "Can the AI identify action items automatically?", a: "Yes, our AI detects commitments, deadlines, and task assignments from natural conversation and creates structured action items that can be exported to your project management tools." },
      { q: "Does WrapUp provide meeting analytics?", a: "Yes! Get insights into speaking time distribution, meeting frequency, topic trends, sentiment analysis, and team engagement metrics across all your meetings." },
      { q: "Can AI generate follow-up emails?", a: "Absolutely. After any meeting, you can use the AI to draft follow-up emails summarizing key points, decisions, and next steps — ready to send with one click." },
      { q: "How does sentiment analysis work?", a: "Our AI analyzes tone, word choice, and speaking patterns to gauge meeting sentiment. This helps identify potential concerns, excitement, or disagreements that may need attention." },
    ],
  },
  {
    title: "Security & Privacy",
    faqs: [
      { q: "Is my meeting data secure?", a: "Yes. All data is encrypted end-to-end with AES-256. We offer a Privacy Vault feature and are SOC 2 Type II compliant. Your recordings never leave your control." },
      { q: "Where is my data stored?", a: "Data is stored in SOC 2 compliant data centers. Enterprise customers can choose their preferred region (US, EU, APAC) for data residency compliance." },
      { q: "Does WrapUp comply with GDPR?", a: "Yes, WrapUp is fully GDPR compliant. We provide data processing agreements, support data subject access requests, and offer tools for data deletion and export." },
      { q: "Can I delete my meeting recordings?", a: "Yes, you can delete any recording at any time. Deleted data is permanently removed from our servers within 30 days. Enterprise plans offer immediate deletion options." },
      { q: "Who can access my meeting data?", a: "Only you and team members you explicitly grant access to can view your meeting data. Admins can configure granular access controls, and all access is logged for audit purposes." },
      { q: "Is WrapUp HIPAA compliant?", a: "Yes, our Enterprise plan includes HIPAA compliance with Business Associate Agreements (BAAs), making WrapUp suitable for healthcare organizations handling PHI." },
      { q: "Does WrapUp sell my data?", a: "Never. Your data is yours. We do not sell, share, or use your meeting data for advertising. Our AI models are trained on anonymized, consented datasets only." },
    ],
  },
  {
    title: "Pricing & Plans",
    faqs: [
      { q: "What happens after my free trial?", a: "After the 14-day trial, you can choose a plan that fits your team. Your data is preserved, and you can upgrade or downgrade at any time. No lock-in contracts." },
      { q: "Can I change my plan at any time?", a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated for the remainder of your cycle." },
      { q: "Do you offer discounts for annual billing?", a: "Yes, annual billing saves you 20% compared to monthly plans. We also offer special pricing for startups, nonprofits, and educational institutions." },
      { q: "Is there a limit on meeting duration?", a: "Free plans support meetings up to 60 minutes. Pro plans support up to 4-hour meetings, and Enterprise plans have no duration limits." },
      { q: "How many team members can I add?", a: "The Starter plan supports up to 5 members, Pro up to 50, and Enterprise has unlimited seats. All plans include admin controls and role management." },
      { q: "Do you offer refunds?", a: "Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact our support team for a full refund." },
      { q: "Are there any hidden fees?", a: "No hidden fees. The price you see is what you pay. Storage, integrations, and standard support are included in all plans." },
    ],
  },
  {
    title: "Integrations & Workflow",
    faqs: [
      { q: "Which calendar apps does WrapUp support?", a: "WrapUp integrates with Google Calendar, Microsoft Outlook, Apple Calendar, and any CalDAV-compatible calendar. Meetings are automatically detected and recorded." },
      { q: "Can I export transcripts to other apps?", a: "Yes! Export to Notion, Google Docs, Microsoft Word, Slack, Confluence, and more. You can also download transcripts as TXT, PDF, SRT, or VTT files." },
      { q: "Does WrapUp integrate with CRM tools?", a: "Yes, we integrate with Salesforce, HubSpot, and Pipedrive. Meeting notes and action items can automatically sync to relevant deals and contacts." },
      { q: "Can I use WrapUp with project management tools?", a: "Absolutely. Action items can be sent directly to Jira, Asana, Trello, Linear, Monday.com, and ClickUp as tasks with due dates and assignees." },
      { q: "Is there an API available?", a: "Yes, we offer a RESTful API and webhooks for custom integrations. API documentation is available for Pro and Enterprise plans." },
      { q: "Can WrapUp join meetings automatically?", a: "Yes! Once connected to your calendar, WrapUp can automatically join and record scheduled meetings. You can configure which meetings to record based on rules." },
      { q: "Does WrapUp work with virtual backgrounds?", a: "Yes, WrapUp works perfectly regardless of virtual backgrounds or video settings since it primarily processes audio for transcription and analysis." },
    ],
  },
];

export default function FAQsPage() {
  const [openItems, setOpenItems] = useState<Record<string, number | null>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleItem = (category: string, index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [category]: prev[category] === index ? null : index,
    }));
  };

  const totalFaqs = faqCategories.reduce((sum, cat) => sum + cat.faqs.length, 0);

  return (
    <div className="dark cinema-gradient text-foreground min-h-screen overflow-x-hidden relative">
      <StarfieldBackground />
      <LandingNavbar />

      <section className="relative pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 text-primary mb-6 backdrop-blur-sm bg-primary/5">
              {totalFaqs}+ Questions Answered
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              All Frequently <span className="gradient-text">Asked Questions</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to know about WrapUp — from features and pricing to security and integrations.
            </p>
          </motion.div>

          {faqCategories.map((category, catIdx) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.08, duration: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  {catIdx + 1}
                </span>
                {category.title}
              </h2>
              <div className="space-y-2">
                {category.faqs.map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => toggleItem(category.title, i)}
                    className="w-full text-left rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 hover:border-emerald-400/30 hover:bg-emerald-400/[0.06] transition-all duration-300 group backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-foreground group-hover:text-emerald-200 transition-colors">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 ${
                          openItems[category.title] === i ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </div>
                    <motion.div
                      initial={false}
                      animate={{
                        height: openItems[category.title] === i ? "auto" : 0,
                        opacity: openItems[category.title] === i ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed pt-3">{faq.a}</p>
                    </motion.div>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
