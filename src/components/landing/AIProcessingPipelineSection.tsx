import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Type, Users, Heart, Tag, Sparkles, Zap, ArrowRight } from "lucide-react";

type Stage = {
  icon: typeof Mic;
  label: string;
  desc: string;
  color: string;
  metric: string;
  latency: string;
};

const STAGES: Stage[] = [
  { icon: Mic, label: "Audio Input", desc: "Capture", color: "#8b5cf6", metric: "16 kHz stream", latency: "0 ms" },
  { icon: Type, label: "Speech-to-Text", desc: "Transcribe", color: "#06b6d4", metric: "99.1% accuracy", latency: "120 ms" },
  { icon: Users, label: "Speaker ID", desc: "Diarize", color: "#f59e0b", metric: "Up to 20 voices", latency: "85 ms" },
  { icon: Heart, label: "Sentiment", desc: "Analyze tone", color: "#ec4899", metric: "Per sentence", latency: "40 ms" },
  { icon: Tag, label: "Topic Extraction", desc: "Classify", color: "#10b981", metric: "Auto-tagged", latency: "65 ms" },
  { icon: Sparkles, label: "Summary", desc: "Synthesize", color: "#3b82f6", metric: "Structured", latency: "210 ms" },
];

const SAMPLE_TRANSCRIPT = [
  { text: "Let's kick off with the Q4 roadmap priorities.", speaker: "Sarah", sentiment: "neutral", topics: ["Q4 Roadmap"] },
  { text: "I think we should ship the mobile app first.", speaker: "Marcus", sentiment: "positive", topics: ["Mobile Launch"] },
  { text: "Agreed. What's a realistic target date?", speaker: "Sarah", sentiment: "positive", topics: ["Timeline"] },
];

const STAGE_MS = 1400;

function Waveform({ color, active }: { color: string; active: boolean }) {
  return (
    <div className="flex items-end justify-center gap-0.5 h-8">
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="w-0.5 rounded-full"
          style={{
            height: `${Math.abs(Math.sin(i * 0.55)) * 60 + 20}%`,
            background: color,
            opacity: active ? 0.9 : 0.35,
            animation: active ? `wu-pipe-wave 0.6s ease-in-out ${i * 0.05}s infinite alternate` : "none",
          }}
        />
      ))}
    </div>
  );
}

function TypewriterLine({ text, active }: { text: string; active: boolean }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!active) {
      setShown(0);
      return;
    }
    const id = setInterval(() => {
      setShown((s) => (s >= text.length ? s : s + 2));
    }, 24);
    return () => clearInterval(id);
  }, [active, text]);
  return (
    <span>
      {text.slice(0, shown)}
      {active && shown < text.length && (
        <span className="inline-block w-[2px] h-3 bg-cyan-400 ml-0.5 align-middle animate-pulse" />
      )}
    </span>
  );
}

export default function AIProcessingPipelineSection() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % STAGES.length;
        if (next === 0) setCycle((c) => c + 1);
        return next;
      });
    }, STAGE_MS);
    return () => clearInterval(id);
  }, []);

  const sample = SAMPLE_TRANSCRIPT[cycle % SAMPLE_TRANSCRIPT.length];

  return (
    <section className="relative py-28 overflow-hidden">
      <style>{`
        @keyframes wu-pipe-wave { 0% { transform: scaleY(0.4); } 100% { transform: scaleY(1); } }
        @keyframes wu-pipe-pulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.15); } }
        @keyframes wu-pipe-flow { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-[10%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: "hsl(260, 90%, 55%, 0.06)" }} />
        <div className="absolute bottom-1/4 right-[10%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: "hsl(190, 90%, 50%, 0.05)" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 text-primary mb-6 backdrop-blur-sm bg-primary/5 tracking-wider uppercase">
            <Zap className="w-3 h-3" />
            AI Processing Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            From Audio to <span className="gradient-text">Insight</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg font-body">
            Every word flows through six specialized AI stages in under a second — watch it happen in real time.
          </p>
        </motion.div>

        {/* Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto"
        >
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8 relative overflow-hidden">
            {/* Top shimmer line */}
            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            {/* Stages grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-2 relative">
              {STAGES.map((stage, i) => {
                const isActive = i === active;
                const isDone = i < active;
                const Icon = stage.icon;
                return (
                  <div key={stage.label} className="relative">
                    <motion.div
                      animate={{
                        scale: isActive ? 1.03 : 1,
                      }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="relative rounded-2xl p-4 border transition-all duration-500 h-full"
                      style={{
                        background: isActive ? `${stage.color}18` : "rgba(255,255,255,0.02)",
                        borderColor: isActive ? `${stage.color}66` : "rgba(255,255,255,0.06)",
                        boxShadow: isActive ? `0 0 40px -8px ${stage.color}55` : "none",
                      }}
                    >
                      {/* Pulse halo */}
                      {isActive && (
                        <span
                          className="absolute inset-0 rounded-2xl pointer-events-none"
                          style={{
                            background: `radial-gradient(circle at 50% 0%, ${stage.color}22, transparent 70%)`,
                          }}
                        />
                      )}

                      <div className="relative flex flex-col items-center text-center gap-2">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center relative"
                          style={{
                            background: isActive ? `${stage.color}25` : "rgba(255,255,255,0.04)",
                            boxShadow: isActive ? `0 0 20px -4px ${stage.color}88` : "none",
                          }}
                        >
                          <Icon className="h-5 w-5" style={{ color: isActive || isDone ? stage.color : "rgba(255,255,255,0.45)" }} />
                          {isActive && (
                            <span
                              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                              style={{
                                background: stage.color,
                                boxShadow: `0 0 10px ${stage.color}`,
                                animation: "wu-pipe-pulse 1.2s ease-in-out infinite",
                              }}
                            />
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isActive ? stage.color : "rgba(255,255,255,0.45)" }}>
                            Stage {String(i + 1).padStart(2, "0")}
                          </p>
                          <h3 className="text-sm font-bold text-foreground leading-tight mt-1">{stage.label}</h3>
                          <p className="text-[10px] text-muted-foreground mt-1">{stage.metric}</p>
                        </div>

                        <div
                          className="mt-1 text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-md border"
                          style={{
                            borderColor: isActive ? `${stage.color}55` : "rgba(255,255,255,0.08)",
                            color: isActive ? stage.color : "rgba(255,255,255,0.45)",
                            background: isActive ? `${stage.color}10` : "transparent",
                          }}
                        >
                          {stage.latency}
                        </div>
                      </div>
                    </motion.div>

                    {/* Connector arrow (desktop only, not on last) */}
                    {i < STAGES.length - 1 && (
                      <div className="hidden lg:flex absolute top-1/2 -right-1 -translate-y-1/2 translate-x-1/2 z-10 items-center justify-center w-3 h-3">
                        <ArrowRight
                          className="w-3 h-3 transition-colors duration-300"
                          style={{ color: i < active ? stage.color : "rgba(255,255,255,0.2)" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Live output panel */}
            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Live Output</p>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
                  cycle #{cycle + 1} · processing "{sample.text.slice(0, 34)}..."
                </p>
              </div>

              <div className="rounded-xl bg-black/30 border border-white/[0.06] p-4 min-h-[120px] relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${active}-${cycle}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-3"
                  >
                    {active === 0 && (
                      <div className="flex items-center gap-4">
                        <Waveform color="#8b5cf6" active />
                        <div className="flex-1 text-xs text-muted-foreground">
                          <span className="text-violet-400 font-semibold">Receiving audio stream</span> · 16 kHz · mono
                        </div>
                      </div>
                    )}
                    {active === 1 && (
                      <div className="text-xs text-foreground leading-relaxed font-mono">
                        <span className="text-cyan-400">→</span>{" "}
                        <TypewriterLine text={sample.text} active />
                      </div>
                    )}
                    {active === 2 && (
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, #f59e0b, #f59e0b80)`,
                            boxShadow: `0 0 12px -2px #f59e0b88`,
                          }}
                        >
                          {sample.speaker[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-amber-400">{sample.speaker}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{sample.text}</p>
                        </div>
                      </div>
                    )}
                    {active === 3 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Sentiment:</span>
                        <span className="text-xs px-2.5 py-1 rounded-md bg-pink-500/15 border border-pink-500/30 text-pink-300 font-semibold capitalize flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                          {sample.sentiment}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">confidence 0.94</span>
                      </div>
                    )}
                    {active === 4 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Topics:</span>
                        {sample.topics.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold"
                          >
                            #{t.replace(/\s/g, "")}
                          </span>
                        ))}
                      </div>
                    )}
                    {active === 5 && (
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground leading-relaxed">
                          Key point: <span className="text-blue-300">Q4 roadmap priorities discussed — mobile launch is the top candidate</span>
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Scanning line */}
                <div
                  className="absolute inset-y-0 w-24 pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${STAGES[active].color}22, transparent)`,
                    animation: "wu-pipe-flow 2.4s linear infinite",
                  }}
                />
              </div>

              {/* Throughput stats */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Total Latency</p>
                  <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">520 ms</p>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Throughput</p>
                  <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">1.8k words/min</p>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">GPU Models</p>
                  <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">6 specialized</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
