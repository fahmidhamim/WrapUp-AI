import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Check,
  Clock,
  AlertTriangle,
  FileQuestion,
  Mail,
  Sparkles,
  ListChecks,
  Zap,
  ArrowRightLeft,
} from "lucide-react";

const BEFORE_PAIN = [
  { icon: Clock, text: "3+ hrs/wk writing notes" },
  { icon: AlertTriangle, text: "Action items lost in Slack" },
  { icon: FileQuestion, text: "\"What did we decide?\"" },
];

const AFTER_WINS = [
  { icon: Zap, text: "Summaries in 60 seconds" },
  { icon: ListChecks, text: "Action items auto-assigned" },
  { icon: Sparkles, text: "Ask AI anything, instantly" },
];

const BEFORE_NOTE = `2:14pm — Q4 roadmap...
Sarah — mobile??
Marcus — beta?
specs??? when??
@elena follow up
ship date?????`;

export default function BeforeAfterSection() {
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSliderPos(Math.max(8, Math.min(92, pct)));
    };
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging]);

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-[8%] w-[450px] h-[450px] rounded-full blur-[160px]" style={{ background: "hsl(0, 75%, 55%, 0.05)" }} />
        <div className="absolute bottom-1/3 right-[8%] w-[450px] h-[450px] rounded-full blur-[160px]" style={{ background: "hsl(150, 70%, 50%, 0.05)" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 text-primary mb-6 backdrop-blur-sm bg-primary/5 tracking-wider uppercase">
            <ArrowRightLeft className="w-3 h-3" />
            Before & After
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            The difference is <span className="gradient-text">night and day.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg font-body">
            Drag the slider to see how WrapUp transforms your meeting workflow.
          </p>
        </motion.div>

        {/* Interactive slider comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto"
        >
          <div
            ref={containerRef}
            className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/9] select-none touch-none"
          >
            {/* BEFORE pane (clipped to left of slider) */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-black/60 to-zinc-900/40"
              style={{
                clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
              }}
            >
              {/* Grit texture */}
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0 2px, transparent 2px 8px)",
                }}
              />

              {/* Content locked to LEFT half */}
              <div className="absolute left-0 top-0 bottom-0 w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-red-400 font-bold truncate">Without WrapUp</p>
                      <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-muted-foreground line-through decoration-red-500/50 truncate">
                        Manual chaos
                      </h3>
                    </div>
                  </div>

                  <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-2.5 sm:p-3 lg:p-4 mb-3 relative">
                    <div className="flex items-center gap-1.5 mb-2">
                      <FileQuestion className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <p className="text-[9px] sm:text-[10px] font-bold text-red-400 uppercase tracking-wider">Your notes</p>
                      <span className="ml-auto text-[8px] sm:text-[9px] text-muted-foreground/60 font-mono italic hidden sm:inline">illegible</span>
                    </div>
                    <pre className="text-[9px] sm:text-[10px] lg:text-[11px] text-muted-foreground/80 leading-snug font-mono whitespace-pre-wrap italic break-words">
                      {BEFORE_NOTE}
                    </pre>
                  </div>

                  <div className="space-y-1.5">
                    {BEFORE_PAIN.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-red-500/15 border border-red-500/25 flex items-center justify-center flex-shrink-0">
                            <X className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-red-400" strokeWidth={3} />
                          </div>
                          <Icon className="w-3 h-3 text-red-400/70 flex-shrink-0" />
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06] flex-wrap">
                  <div>
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-red-400 font-bold">Time lost</p>
                    <p className="text-sm sm:text-lg lg:text-2xl font-extrabold text-muted-foreground tabular-nums">3.5 hrs/wk</p>
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-red-400 font-bold">Clarity</p>
                    <p className="text-sm sm:text-lg lg:text-2xl font-extrabold text-muted-foreground">Foggy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AFTER pane (clipped to right of slider) */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-emerald-500/[0.06]"
              style={{
                clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
              }}
            >
              {/* Content locked to RIGHT half */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-emerald-400 font-bold truncate">With WrapUp</p>
                      <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-foreground truncate">AI-powered clarity</h3>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-2.5 sm:p-3 lg:p-4 mb-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <p className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wider">AI Summary</p>
                      <span className="ml-auto text-[8px] sm:text-[9px] text-muted-foreground font-mono hidden sm:inline">58s</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] lg:text-sm text-foreground leading-snug sm:leading-relaxed">
                      <span className="font-semibold">Q4 roadmap aligned.</span> Mobile launch prioritized — beta kickoff next week, specs due Friday. Ship: end of Feb.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {AFTER_WINS.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                            <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-emerald-400" strokeWidth={3} />
                          </div>
                          <Icon className="w-3 h-3 text-emerald-400/70 flex-shrink-0" />
                          <p className="text-[10px] sm:text-xs text-foreground truncate">{item.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06] flex-wrap">
                  <div>
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Time saved</p>
                    <p className="text-sm sm:text-lg lg:text-2xl font-extrabold text-foreground tabular-nums">3.2 hrs/wk</p>
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Clarity</p>
                    <p className="text-sm sm:text-lg lg:text-2xl font-extrabold text-foreground">Total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed corner labels — always visible regardless of slider */}
            <div className="absolute top-3 left-3 pointer-events-none z-[5]">
              <span className="text-[9px] sm:text-[10px] font-bold text-red-400 uppercase tracking-wider px-2 py-1 rounded-md bg-black/60 border border-red-500/30 backdrop-blur-sm">
                Before
              </span>
            </div>
            <div className="absolute top-3 right-3 pointer-events-none z-[5]">
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-1 rounded-md bg-black/60 border border-emerald-500/30 backdrop-blur-sm">
                After
              </span>
            </div>

            {/* Divider line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary to-transparent pointer-events-none z-[8]"
              style={{ left: `${sliderPos}%` }}
            />

            {/* Slider handle */}
            <div
              className="absolute top-0 bottom-0 flex items-center justify-center cursor-ew-resize z-10"
              style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
              onPointerDown={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
            >
              <div className="relative">
                <div className="absolute inset-y-0 -left-4 -right-4 pointer-events-none" />
                <div className="w-10 h-10 rounded-full bg-background border-2 border-primary shadow-[0_0_30px_-4px_hsl(var(--primary)/0.8)] flex items-center justify-center backdrop-blur-sm hover:scale-110 transition-transform duration-200">
                  <ArrowRightLeft className="w-4 h-4 text-primary" />
                </div>
                <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
              </div>
            </div>
          </div>

          {/* Hint */}
          <p className="text-center text-[11px] text-muted-foreground mt-4">
            👉 Drag the slider left or right to compare
          </p>
        </motion.div>

        {/* Summary stat row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto mt-10"
        >
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Before</p>
            <p className="text-2xl font-extrabold text-muted-foreground line-through decoration-red-500/50 tabular-nums">3.5 hrs</p>
            <p className="text-xs text-muted-foreground mt-1">per week on meeting admin</p>
          </div>
          <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.1] via-white/[0.02] to-transparent p-5 backdrop-blur-sm shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]">
            <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">Savings</p>
            <p className="text-2xl font-extrabold gradient-text tabular-nums">91%</p>
            <p className="text-xs text-foreground mt-1">of time reclaimed instantly</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold mb-1">After</p>
            <p className="text-2xl font-extrabold text-foreground tabular-nums">~18 min</p>
            <p className="text-xs text-muted-foreground mt-1">per week reviewing summaries</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
