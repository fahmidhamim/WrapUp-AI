import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, Hash } from "lucide-react";

type Line = {
  speaker: string;
  role: string;
  color: string;
  text: string;
};

const TRANSCRIPT: Line[] = [
  { speaker: "Sarah Chen", role: "PM", color: "#8b5cf6", text: "Let's kick off with the Q4 roadmap priorities." },
  { speaker: "Marcus Lee", role: "Engineering", color: "#06b6d4", text: "I think we should ship the mobile app first." },
  { speaker: "Sarah Chen", role: "PM", color: "#8b5cf6", text: "Agreed. What's a realistic target date?" },
  { speaker: "Marcus Lee", role: "Engineering", color: "#06b6d4", text: "End of February if we start the beta next week." },
  { speaker: "Elena Ruiz", role: "Design", color: "#f59e0b", text: "I'll have the design specs ready by Friday." },
];

const SUMMARY_ITEMS = [
  "Mobile launch prioritized for Q4",
  "Beta kickoff scheduled for next week",
  "Design specs due Friday",
  "Target ship date: end of February",
];

const TOPICS = ["Q4 Roadmap", "Mobile Launch", "Beta Timeline", "Design Spec"];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function LiveTranscriptSection() {
  const [progress, setProgress] = useState<number[]>(() => Array(TRANSCRIPT.length).fill(0));
  const [summaryCount, setSummaryCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const waveformHeights = useMemo(
    () =>
      Array.from(
        { length: 48 },
        (_, i) => 25 + Math.abs(Math.sin(i * 0.45)) * 55 + Math.abs(Math.sin(i * 1.8)) * 18,
      ),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    async function run() {
      while (!cancelled) {
        setProgress(Array(TRANSCRIPT.length).fill(0));
        setSummaryCount(0);
        setElapsed(0);

        const startAt = Date.now();
        const timerId = setInterval(() => {
          if (!cancelled) setElapsed(Math.floor((Date.now() - startAt) / 1000));
        }, 1000);

        for (let i = 0; i < TRANSCRIPT.length; i++) {
          if (cancelled) break;
          const line = TRANSCRIPT[i];
          for (let c = 1; c <= line.text.length; c++) {
            if (cancelled) break;
            setProgress((prev) => {
              const next = [...prev];
              next[i] = c;
              return next;
            });
            await sleep(28);
          }
          if (i === 1) setSummaryCount(1);
          if (i === 2) setSummaryCount(2);
          if (i === 3) setSummaryCount(3);
          if (i === 4) setSummaryCount(4);
          await sleep(550);
        }

        clearInterval(timerId);
        await sleep(3000);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="live-transcript" className="py-28 relative overflow-hidden">
      <div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none"
        style={{ background: "hsl(250, 90%, 50%, 0.06)" }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none"
        style={{ background: "hsl(190, 90%, 50%, 0.04)" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-primary/15 text-primary mb-6 tracking-wider uppercase backdrop-blur-sm bg-primary/5">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-red-500 opacity-75 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-red-500" />
            </span>
            Live Demo
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            See words appear
            <br />
            <span className="gradient-text">as they&apos;re spoken.</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Watch WrapUp turn a live conversation into a searchable transcript and action items — in real time.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid lg:grid-cols-[1.6fr_1fr] gap-5 max-w-6xl mx-auto"
        >
          {/* Meeting window */}
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl overflow-hidden shadow-[0_0_60px_-20px_hsl(var(--primary)/0.25)]">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-[11px] text-muted-foreground font-medium">
                  Q4 Planning &middot; Meeting Room
                </span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inset-0 rounded-full bg-red-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-red-500" />
                </span>
                <span className="text-[10px] font-bold text-red-400 tabular-nums tracking-wider">
                  REC {formatTime(elapsed)}
                </span>
              </div>
            </div>

            <div className="p-6 min-h-[380px] max-h-[420px] overflow-hidden space-y-5">
              <AnimatePresence initial={false}>
                {TRANSCRIPT.map((line, i) => {
                  const shown = progress[i];
                  if (shown === 0) return null;
                  const isTyping = shown < line.text.length;
                  return (
                    <motion.div
                      key={`${i}-${line.speaker}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="flex gap-3"
                    >
                      <div
                        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${line.color}, ${line.color}80)`,
                          boxShadow: `0 4px 20px -6px ${line.color}80`,
                        }}
                      >
                        {initials(line.speaker)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-sm font-semibold text-foreground">{line.speaker}</span>
                          <span
                            className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                            style={{ color: line.color, background: `${line.color}15` }}
                          >
                            {line.role}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground/80">
                          {line.text.slice(0, shown)}
                          {isTyping && (
                            <span className="inline-block w-[2px] h-3.5 bg-primary ml-0.5 align-middle animate-pulse" />
                          )}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="px-5 py-4 border-t border-white/[0.06] bg-white/[0.015]">
              <div className="flex items-center gap-3">
                <div className="flex items-end gap-[3px] h-6 flex-1">
                  {waveformHeights.map((h, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-full bg-gradient-to-t from-primary/40 to-primary/90"
                      style={{
                        height: `${h}%`,
                        animation: `wu-waveform 1.2s ease-in-out ${(i % 12) * 0.05}s infinite alternate`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Transcribing
                </span>
              </div>
            </div>
          </div>

          {/* AI Summary card */}
          <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.1] via-white/[0.02] to-transparent p-6 backdrop-blur-xl relative overflow-hidden shadow-[0_0_60px_-20px_hsl(var(--primary)/0.35)]">
            <div className="absolute -top-24 -right-20 w-60 h-60 rounded-full bg-primary/15 blur-[100px] pointer-events-none" />
            <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-bold text-foreground">AI Summary</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-primary font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Generating
                </span>
              </div>

              <div className="mb-5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Key Points
                </p>
                <div className="space-y-2 min-h-[180px]">
                  {summaryCount === 0 ? (
                    <div className="space-y-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-10 rounded-lg bg-white/[0.02] border border-white/[0.04] overflow-hidden relative"
                        >
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
                            style={{ animation: `wu-shimmer 1.6s ease-in-out ${i * 0.2}s infinite` }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {SUMMARY_ITEMS.slice(0, summaryCount).map((item) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: -8, scale: 0.97 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="text-xs text-foreground/85 leading-snug">{item}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2.5 flex items-center gap-1.5">
                  <Hash className="w-3 h-3" />
                  Topics
                </p>
                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  <AnimatePresence initial={false}>
                    {TOPICS.slice(0, summaryCount).map((topic) => (
                      <motion.span
                        key={topic}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border border-primary/20 text-primary bg-primary/5 backdrop-blur-sm"
                      >
                        {topic}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes wu-waveform {
          0% { transform: scaleY(0.35); opacity: 0.7; }
          100% { transform: scaleY(1); opacity: 1; }
        }
        @keyframes wu-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
}
