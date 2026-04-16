import { motion } from "framer-motion";
import { Upload, Cpu, FileText, Share2 } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Record or Upload",
    desc: "Start a live meeting or upload an existing audio/video file. We support 40+ formats.",
    accent: "from-primary to-glow",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Processes",
    desc: "Our AI transcribes, identifies speakers, detects sentiment, and extracts key topics in real-time.",
    accent: "from-violet-500 to-purple-400",
  },
  {
    icon: FileText,
    step: "03",
    title: "Get Smart Summary",
    desc: "Receive structured summaries with action items, decisions, and follow-ups — instantly.",
    accent: "from-cyan-500 to-blue-400",
  },
  {
    icon: Share2,
    step: "04",
    title: "Share & Collaborate",
    desc: "Share insights with your team, export to Notion or Slack, and track action items.",
    accent: "from-emerald-500 to-teal-400",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function HowItWorksSection() {
  return (
    <section className="relative py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 text-primary mb-6 backdrop-blur-sm bg-primary/5">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From recording to actionable insights in four simple steps.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="relative group"
            >
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 hover:border-primary/20 hover:bg-white/[0.04] transition-all duration-500 h-full">
                {/* Step number */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.accent} flex items-center justify-center shadow-lg`}>
                    <step.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground/50 tracking-wider">STEP {step.step}</span>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
