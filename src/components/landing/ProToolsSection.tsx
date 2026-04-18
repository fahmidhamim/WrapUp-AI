import { motion } from "framer-motion";
import { Brain, LineChart, Layers, Sparkles, Target, Wand2 } from "lucide-react";

const tools = [
  {
    icon: Brain,
    title: "Deep Context Analysis",
    desc: "AI understands meeting context, detects decisions vs. discussions, and highlights commitments automatically.",
    // Donut / Pie chart — content-type breakdown
    visual: (
      <div className="mt-4 flex items-center gap-4">
        <div className="relative w-[72px] h-[72px] flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <defs>
              <linearGradient id="dcSegA" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#c4b5fd" />
              </linearGradient>
              <linearGradient id="dcSegB" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <linearGradient id="dcSegC" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#67e8f9" />
              </linearGradient>
            </defs>
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="url(#dcSegA)" strokeWidth="3.5" strokeDasharray="48 100" strokeDashoffset="0" strokeLinecap="round" />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="url(#dcSegB)" strokeWidth="3.5" strokeDasharray="32 100" strokeDashoffset="-50" strokeLinecap="round" />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="url(#dcSegC)" strokeWidth="3.5" strokeDasharray="18 100" strokeDashoffset="-84" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-foreground tabular-nums leading-none">128</span>
            <span className="text-[7px] text-muted-foreground uppercase tracking-wider mt-0.5">events</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-gradient-to-br from-[#8b5cf6] to-[#c4b5fd]" />
            <span className="text-[9px] text-foreground/80 font-medium">Decisions</span>
            <span className="ml-auto text-[9px] text-primary font-semibold tabular-nums">48%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-gradient-to-br from-[#f59e0b] to-[#fbbf24]" />
            <span className="text-[9px] text-foreground/80 font-medium">Actions</span>
            <span className="ml-auto text-[9px] text-amber-400 font-semibold tabular-nums">32%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-gradient-to-br from-[#06b6d4] to-[#67e8f9]" />
            <span className="text-[9px] text-foreground/80 font-medium">Discussion</span>
            <span className="ml-auto text-[9px] text-cyan-400 font-semibold tabular-nums">18%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-white/10" />
            <span className="text-[9px] text-muted-foreground/70 font-medium">Noise</span>
            <span className="ml-auto text-[9px] text-muted-foreground tabular-nums">2%</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: LineChart,
    title: "Engagement Heatmaps",
    desc: "Visualize who spoke when, track participation rates, and identify meeting dynamics at a glance.",
    // Premium multi-line chart with area fills and data points
    visual: (
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[9px] text-muted-foreground font-medium">Last 7 meetings</p>
          <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 font-semibold">
            <svg width="8" height="8" viewBox="0 0 10 10"><path d="M1 7 L5 3 L9 7" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            +18%
          </span>
        </div>
        <div className="relative">
          <svg viewBox="0 0 240 70" className="w-full h-[70px]" preserveAspectRatio="none">
            <defs>
              <linearGradient id="ehFillA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="ehFillB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f472b6" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="ehStrokeA" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--glow))" />
              </linearGradient>
            </defs>

            <line x1="0" y1="17" x2="240" y2="17" stroke="white" strokeOpacity="0.05" strokeDasharray="2 3" />
            <line x1="0" y1="35" x2="240" y2="35" stroke="white" strokeOpacity="0.05" strokeDasharray="2 3" />
            <line x1="0" y1="53" x2="240" y2="53" stroke="white" strokeOpacity="0.05" strokeDasharray="2 3" />

            <path d="M 0 48 C 13 44 27 40 40 38 C 53 37 67 32 80 30 C 93 28 107 22 120 20 C 133 18 147 25 160 28 C 173 27 187 16 200 14 C 213 13 227 18 240 22 L 240 70 L 0 70 Z" fill="url(#ehFillA)" />
            <path d="M 0 48 C 13 44 27 40 40 38 C 53 37 67 32 80 30 C 93 28 107 22 120 20 C 133 18 147 25 160 28 C 173 27 187 16 200 14 C 213 13 227 18 240 22" stroke="url(#ehStrokeA)" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            <path d="M 0 58 C 13 56 27 54 40 52 C 53 51 67 50 80 48 C 93 46 107 38 120 36 C 133 36 147 38 160 40 C 173 39 187 34 200 32 C 213 32 227 34 240 36 L 240 70 L 0 70 Z" fill="url(#ehFillB)" />
            <path d="M 0 58 C 13 56 27 54 40 52 C 53 51 67 50 80 48 C 93 46 107 38 120 36 C 133 36 147 38 160 40 C 173 39 187 34 200 32 C 213 32 227 34 240 36" stroke="#f472b6" strokeOpacity="0.8" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            <circle cx="40" cy="38" r="1.5" fill="hsl(var(--primary))" />
            <circle cx="80" cy="30" r="1.5" fill="hsl(var(--primary))" />
            <circle cx="120" cy="20" r="1.5" fill="hsl(var(--primary))" />
            <circle cx="160" cy="28" r="1.5" fill="hsl(var(--primary))" />
            <circle cx="200" cy="14" r="2.5" fill="hsl(var(--primary))" stroke="white" strokeOpacity="0.8" strokeWidth="1" />
            <circle cx="200" cy="14" r="5" fill="hsl(var(--primary))" fillOpacity="0.15" />

            <line x1="200" y1="14" x2="200" y2="2" stroke="hsl(var(--primary))" strokeOpacity="0.35" strokeDasharray="1 2" />
          </svg>
        </div>
        <div className="flex justify-between text-[8px] text-muted-foreground/60 mt-1 tabular-nums">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
        <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-white/[0.05]">
          <span className="inline-flex items-center gap-1 text-[8px] text-primary/90">
            <span className="w-2 h-0.5 rounded-full bg-primary" /> Speakers
          </span>
          <span className="inline-flex items-center gap-1 text-[8px] text-[#f9a8d4]">
            <span className="w-2 h-0.5 rounded-full bg-[#f472b6]" /> Listeners
          </span>
        </div>
      </div>
    ),
  },
  {
    icon: Layers,
    title: "Multi-Meeting Insights",
    desc: "Track topics and action items across multiple meetings. See trends, follow-ups, and recurring themes.",
    // Premium vertical bar chart with gradient bars and peak highlight
    visual: (
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] text-muted-foreground font-medium">Action items · last 6 weeks</p>
          <span className="text-[9px] text-emerald-400 font-semibold tabular-nums">+24%</span>
        </div>
        <div className="relative h-[68px] flex items-end gap-1.5">
          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-white/[0.08] pointer-events-none" />
          <div className="absolute left-0 top-0 text-[7px] text-muted-foreground/40 tabular-nums">40</div>
          <div className="absolute left-0 bottom-[38%] text-[7px] text-muted-foreground/40 tabular-nums">20</div>

          {[
            { w: "W1", h: 42, v: 12, peak: false },
            { w: "W2", h: 62, v: 18, peak: false },
            { w: "W3", h: 48, v: 14, peak: false },
            { w: "W4", h: 78, v: 23, peak: false },
            { w: "W5", h: 66, v: 19, peak: false },
            { w: "W6", h: 95, v: 28, peak: true },
          ].map((b) => (
            <div key={b.w} className="flex-1 flex flex-col items-center justify-end h-full group/bar relative">
              {b.peak && (
                <span className="absolute -top-1 text-[7px] font-bold text-primary tabular-nums bg-primary/10 px-1 py-0.5 rounded border border-primary/20">
                  {b.v}
                </span>
              )}
              <div
                className={
                  b.peak
                    ? "w-full rounded-t bg-gradient-to-t from-primary to-glow shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
                    : "w-full rounded-t bg-gradient-to-t from-primary/35 to-primary/15 group-hover/bar:from-primary/50 group-hover/bar:to-primary/25 transition-colors"
                }
                style={{ height: `${b.h}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5 text-[8px] text-muted-foreground/60 tabular-nums">
          <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span>
        </div>
        <div className="flex items-center justify-between text-[9px] mt-2 pt-1.5 border-t border-white/[0.05]">
          <span className="text-muted-foreground">Tracked <span className="text-foreground font-semibold tabular-nums">127</span></span>
          <span className="text-muted-foreground">Completed <span className="text-emerald-400 font-semibold tabular-nums">89%</span></span>
        </div>
      </div>
    ),
  },
  {
    icon: Sparkles,
    title: "AI Follow-Up Drafts",
    desc: "Automatically generate follow-up emails, Slack messages, and task descriptions from meeting outcomes.",
    // Email mock with premium sparkline footer
    visual: (
      <div className="mt-3 space-y-2">
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-white/[0.05]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            <span className="ml-auto text-[7px] text-muted-foreground/60 uppercase tracking-wider">Draft</span>
          </div>
          <p className="text-[9px] leading-relaxed">
            <span className="text-primary font-semibold">To:</span> <span className="text-foreground/60">team@company.com</span><br />
            <span className="text-primary font-semibold">Subject:</span> <span className="text-foreground/80">Sprint Planning · Key Takeaways</span>
          </p>
          <p className="text-[9px] text-foreground/50 leading-relaxed mt-1 italic">"Hi team, here are the action items and owners from today's sync…"</p>
        </div>
        <div className="flex items-center gap-2 px-1">
          <div className="flex-1">
            <svg viewBox="0 0 120 20" className="w-full h-4" preserveAspectRatio="none">
              <defs>
                <linearGradient id="followSpark" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="hsl(var(--glow))" />
                </linearGradient>
              </defs>
              <path d="M 0 14 L 15 12 L 30 13 L 45 8 L 60 10 L 75 6 L 90 8 L 105 3 L 120 5" stroke="url(#followSpark)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="105" cy="3" r="2" fill="hsl(var(--glow))" stroke="white" strokeOpacity="0.6" strokeWidth="0.5" />
            </svg>
          </div>
          <span className="text-[9px] text-foreground/70 font-semibold tabular-nums">24</span>
          <span className="text-[8px] text-muted-foreground">drafts · 7d</span>
        </div>
      </div>
    ),
  },
  {
    icon: Target,
    title: "Goal Tracking",
    desc: "Set meeting goals beforehand and let AI measure whether they were achieved during the conversation.",
    // Premium radial percentage rings
    visual: (
      <div className="mt-3">
        <div className="flex items-center justify-around gap-2">
          {[
            { label: "Alignment", pct: 92, color: "#a78bfa", glow: "#c4b5fd" },
            { label: "Decisions", pct: 75, color: "#60a5fa", glow: "#93c5fd" },
            { label: "Coverage", pct: 88, color: "#34d399", glow: "#6ee7b7" },
          ].map((g, i) => {
            const circumference = 2 * Math.PI * 14;
            const dash = (g.pct / 100) * circumference;
            return (
              <div key={g.label} className="flex flex-col items-center gap-1">
                <div className="relative w-[52px] h-[52px]">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <defs>
                      <linearGradient id={`ringGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={g.color} />
                        <stop offset="100%" stopColor={g.glow} />
                      </linearGradient>
                    </defs>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="2.5" />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke={`url(#ringGrad${i})`}
                      strokeWidth="2.5"
                      strokeDasharray={`${dash} ${circumference}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] font-bold tabular-nums" style={{ color: g.color }}>
                      {g.pct}
                      <span className="text-[7px] align-top ml-[1px] opacity-70">%</span>
                    </span>
                  </div>
                </div>
                <span className="text-[8px] text-muted-foreground uppercase tracking-wider">{g.label}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2 pt-1.5 border-t border-white/[0.05]">
          <span className="inline-flex items-center gap-1 text-[8px] text-emerald-400">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            Goals on track
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="text-[8px] text-muted-foreground">avg 85%</span>
        </div>
      </div>
    ),
  },
  {
    icon: Wand2,
    title: "Smart Highlights",
    desc: "AI detects the most impactful moments — key quotes, turning points, and critical decisions — so you never miss what matters.",
    // Premium quote list with impact scores
    visual: (
      <div className="mt-3 space-y-1.5">
        {[
          { q: "Let's ship v2 next Friday", score: 98, type: "Decision", color: "bg-primary/40", text: "text-primary" },
          { q: "Budget approved for Q3", score: 92, type: "Commit", color: "bg-amber-400/40", text: "text-amber-400" },
          { q: "Hire 2 more engineers", score: 85, type: "Action", color: "bg-emerald-400/40", text: "text-emerald-400" },
        ].map((h, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.05] border-l-2 hover:bg-white/[0.05] transition-colors" style={{ borderLeftColor: i === 0 ? "hsl(var(--primary) / 0.6)" : i === 1 ? "rgb(251 191 36 / 0.6)" : "rgb(52 211 153 / 0.6)" }}>
            <span className="flex-1 text-[9px] text-foreground/70 italic truncate">"{h.q}"</span>
            <span className={`text-[8px] font-semibold uppercase tracking-wider ${h.text}`}>{h.type}</span>
            <div className="flex items-center gap-1">
              <div className="w-8 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                <div className={`h-full rounded-full ${h.color}`} style={{ width: `${h.score}%` }} />
              </div>
              <span className="text-[8px] text-muted-foreground tabular-nums">{h.score}</span>
            </div>
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
