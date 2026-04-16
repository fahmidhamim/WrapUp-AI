import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const faqs = [
  {
    q: "How accurate is the AI transcription?",
    a: "Our AI achieves 99.2% accuracy across 40+ languages, powered by state-of-the-art speech recognition models. It handles accents, overlapping speech, and technical jargon with ease.",
  },
  {
    q: "Can I use WrapUp with my existing tools?",
    a: "Absolutely. WrapUp integrates with Slack, Notion, Google Calendar, Microsoft Teams, Zoom, and more. Export summaries and action items directly to your workflow.",
  },
  {
    q: "Is my meeting data secure?",
    a: "Yes. All data is encrypted end-to-end with AES-256. We offer a Privacy Vault feature and are SOC 2 Type II compliant. Your recordings never leave your control.",
  },
  {
    q: "What happens after my free trial?",
    a: "After the 14-day trial, you can choose a plan that fits your team. Your data is preserved, and you can upgrade or downgrade at any time. No lock-in contracts.",
  },
  {
    q: "Does WrapUp work with pre-recorded audio?",
    a: "Yes! Upload any audio or video file (MP3, MP4, WAV, WebM, and 30+ more formats) and get the same AI-powered transcription, summaries, and insights.",
  },
  {
    q: "How does speaker identification work?",
    a: "Our AI uses voice fingerprinting to distinguish between speakers automatically. You can also label speakers manually, and the system learns over time for better accuracy.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="relative py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 text-primary mb-6 backdrop-blur-sm bg-primary/5">
            Common Questions
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Frequently <span className="gradient-text">Asked</span>
          </h2>
          <p className="text-muted-foreground">Everything you need to know about WrapUp.</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 hover:border-emerald-400/30 hover:bg-emerald-400/[0.06] transition-all duration-300 group backdrop-blur-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-foreground group-hover:text-emerald-200 transition-colors">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 ${
                      open === i ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </div>
                <motion.div
                  initial={false}
                  animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed pt-3">{faq.a}</p>
                </motion.div>
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mt-10"
        >
          <Link
            to="/faqs"
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-white/[0.06] border border-white/[0.10] backdrop-blur-xl text-foreground font-semibold text-sm transition-all duration-300 hover:bg-emerald-400/[0.12] hover:border-emerald-400/30 hover:text-emerald-300 shadow-lg shadow-black/10"
          >
            <BookOpen className="h-4 w-4" />
            View All 50+ FAQs
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
