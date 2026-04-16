import { motion } from "framer-motion";
import { Brain, LineChart, Layers, Sparkles, Target, Wand2 } from "lucide-react";

const tools = [
  {
    icon: Brain,
    title: "Deep Context Analysis",
    desc: "AI understands meeting context, detects decisions vs. discussions, and highlights commitments automatically.",
    visual: (
      <div className="space-y-2 mt-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 rounded-full bg-primary/60 flex-1" />
          <span className="text-[8px] text-primary font-semibold">Decision</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 rounded-full bg-amber-400/50 w-3/4" />
          <span className="text-[8px] text-amber-400 font-semibold">Action</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 rounded-full bg-cyan-400/40 w-1/2" />
          <span className="text-[8px] text-cyan-400 font-semibold">Discussion</span>
        </div>
      </div>
    ),
  },
  {
    icon: LineChart,
    title: "Engagement Heatmaps",
    desc: "Visualize who spoke when, track participation rates, and identify meeting dynamics at a glance.",
    visual: (
      <div className="flex items-end gap-1 mt-3 h-12">
        {[40, 70, 55, 85, 30, 60, 90, 45, 75, 50, 65, 80].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-gradient-to-t from-primary/60 to-primary/20"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    ),
  },
  {
    icon: Layers,
    title: "Multi-Meeting Insights",
    desc: "Track topics and action items across multiple meetings. See trends, follow-ups, and recurring themes.",
    visual: (
      <div className="space-y-1.5 mt-3">
        {["Product Roadmap", "Sprint Planning", "1:1 Check-in"].map((name, i) => (
          <div key={name} className="flex items-center gap-2 px-2 py-1 rounded-md bg-white/[0.04]">
            <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-primary" : i === 1 ? "bg-emerald-400" : "bg-amber-400"}`} />
            <span className="text-[9px] text-foreground/70">{name}</span>
            <span className="text-[8px] text-muted-foreground ml-auto">{3 - i} items</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Sparkles,
    title: "AI Follow-Up Drafts",
    desc: "Automatically generate follow-up emails, Slack messages, and task descriptions from meeting outcomes.",
    visual: (
      <div className="mt-3 rounded-lg bg-white/[0.04] p-2">
        <p className="text-[8px] text-muted-foreground leading-relaxed">
          <span className="text-primary font-semibold">To:</span> team@company.com<br />
          <span className="text-primary font-semibold">Subject:</span> Sprint Planning Summary<br />
          <span className="text-foreground/50">Hi team, here are the key takeaways…</span>
        </p>
      </div>
    ),
  },
  {
    icon: Target,
    title: "Goal Tracking",
    desc: "Set meeting goals beforehand and let AI measure whether they were achieved during the conversation.",
    visual: (
      <div className="space-y-2 mt-3">
        {[
          { label: "Alignment", pct: 92 },
          { label: "Decisions", pct: 75 },
          { label: "Coverage", pct: 88 },
        ].map((g) => (
          <div key={g.label} className="flex items-center gap-2">
            <span className="text-[8px] text-muted-foreground w-14">{g.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-glow" style={{ width: `${g.pct}%` }} />
            </div>
            <span className="text-[8px] font-semibold text-primary">{g.pct}%</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Wand2,
    title: "Smart Highlights",
    desc: "AI detects the most impactful moments — key quotes, turning points, and critical decisions — so you never miss what matters.",
    visual: (
      <div className="space-y-1.5 mt-3">
        {["'Let's ship v2 next Friday'", "'Budget approved for Q3'", "'Hire 2 more engineers'"].map((q, i) => (
          <div key={i} className="px-2 py-1 rounded-md bg-primary/10 border-l-2 border-primary/40">
            <span className="text-[8px] text-foreground/60 italic">{q}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function ProToolsSection() {
  return (
    <section className="relative py-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/4 blur-[180px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full blur-[150px]" style={{ background: "hsl(250 60% 20% / 0.06)" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 text-primary mb-6 backdrop-blur-sm bg-primary/5">
            ✨ Pro Features
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Pro-Level <span className="gradient-text">Tools</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Advanced AI capabilities that transform how your team works with meeting data.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 hover:border-primary/25 transition-all duration-500 overflow-hidden cursor-pointer"
            >
              {/* Blur hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-primary/10 blur-[60px]" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                    <tool.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{tool.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
                {tool.visual}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
