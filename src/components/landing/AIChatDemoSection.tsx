import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, Send, User, FileText, ListChecks, Clock } from "lucide-react";

type Turn = {
  role: "user" | "ai";
  text: string;
  tag?: { icon: typeof FileText; label: string; color: string };
};

const DEMO: Turn[] = [
  {
    role: "user",
    text: "Summarize the Q4 planning meeting in one paragraph.",
  },
  {
    role: "ai",
    text:
      "The Q4 planning session focused on prioritizing the mobile app launch. Marcus proposed shipping mobile first, with Sarah agreeing and setting end-of-February as the target. Elena committed to delivering design specs by Friday so the beta can kick off next week.",
    tag: { icon: FileText, label: "Summary · Q4 Planning", color: "#8b5cf6" },
  },
  {
    role: "user",
    text: "What action items did Marcus take?",
  },
  {
    role: "ai",
    text:
      "Marcus owns two items: 1) Kick off the mobile beta next week, and 2) Commit to an end-of-February ship date contingent on the beta starting on time. Both are tagged to the Mobile Launch workstream.",
    tag: { icon: ListChecks, label: "2 action items", color: "#06b6d4" },
  },
  {
    role: "user",
    text: "When did they discuss the beta timeline?",
  },
  {
    role: "ai",
    text:
      "The beta timeline came up at 14:27 — about 13 minutes into the meeting. Marcus proposed next-week kickoff, Sarah confirmed, and Elena's Friday design deadline was set as the dependency.",
    tag: { icon: Clock, label: "Jump to 14:27", color: "#10b981" },
  },
];

const SUGGESTIONS = [
  "What did we decide about pricing?",
  "Who owns the launch checklist?",
  "Show risks mentioned by engineering",
  "Draft a follow-up email to the team",
];

const TYPE_MS = 18;
const USER_HOLD_MS = 900;
const AI_HOLD_MS = 2400;

type ChatState = {
  turns: Turn[];
  typingIdx: number | null;
  typingShown: number;
};

export default function AIChatDemoSection() {
  const [state, setState] = useState<ChatState>({ turns: [], typingIdx: null, typingShown: 0 });
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let t: ReturnType<typeof setTimeout> | null = null;
    const wait = (ms: number) =>
      new Promise<void>((r) => {
        t = setTimeout(r, ms);
      });

    async function run() {
      while (!cancelled) {
        // reset
        setState({ turns: [], typingIdx: null, typingShown: 0 });
        await wait(400);

        for (let i = 0; i < DEMO.length; i++) {
          if (cancelled) return;
          const turn = DEMO[i];
          if (turn.role === "user") {
            setState((prev) => ({ turns: [...prev.turns, turn], typingIdx: null, typingShown: 0 }));
            await wait(USER_HOLD_MS);
          } else {
            setState((prev) => ({ turns: [...prev.turns, { ...turn, text: "" }], typingIdx: prev.turns.length, typingShown: 0 }));
            await wait(480);
            for (let c = 1; c <= turn.text.length; c++) {
              if (cancelled) return;
              setState((prev) => ({ ...prev, typingShown: c }));
              await wait(TYPE_MS);
            }
            setState((prev) => ({ ...prev, typingIdx: null }));
            await wait(AI_HOLD_MS);
          }
        }

        await wait(2700);
      }
    }

    run();
    return () => {
      cancelled = true;
      if (t) clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.turns.length, state.typingShown]);

  return (
    <section className="relative py-28 overflow-hidden">
      <style>{`
        @keyframes wu-chat-typing {
          0%, 100% { opacity: 0.35; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: "hsl(260, 90%, 55%, 0.06)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: "hsl(190, 90%, 50%, 0.04)" }} />
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
            <MessageSquare className="w-3 h-3" />
            Chat with your meetings
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Ask anything. Get <span className="gradient-text">answers in seconds.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg font-body">
            Every meeting becomes a searchable knowledge base. Ask follow-up questions, extract decisions, or draft emails — grounded in what was actually said.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto"
        >
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl overflow-hidden shadow-[0_0_60px_-20px_hsl(var(--primary)/0.3)]">
            {/* Header bar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] text-muted-foreground font-medium">
                  WrapUp AI · Q4 Planning
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                Online
              </span>
            </div>

            {/* Chat area */}
            <div ref={scrollRef} className="px-5 sm:px-8 py-6 min-h-[440px] max-h-[520px] overflow-y-auto space-y-5 scroll-smooth">
              <AnimatePresence initial={false}>
                {state.turns.map((turn, i) => {
                  const isTypingHere = state.typingIdx === i && turn.role === "ai";
                  const displayedText = isTypingHere ? DEMO[i].text.slice(0, state.typingShown) : turn.text;
                  const isDone = !isTypingHere && turn.role === "ai";

                  if (turn.role === "user") {
                    return (
                      <motion.div
                        key={`u-${i}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="flex gap-3 justify-end"
                      >
                        <div className="max-w-[78%] rounded-2xl rounded-tr-md px-4 py-2.5 bg-gradient-to-br from-primary/25 to-primary/15 border border-primary/30 shadow-[0_4px_20px_-6px_hsl(var(--primary)/0.35)]">
                          <p className="text-sm text-foreground leading-snug">{turn.text}</p>
                        </div>
                        <div className="shrink-0 w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      </motion.div>
                    );
                  }

                  const Tag = DEMO[i].tag;
                  return (
                    <motion.div
                      key={`a-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="flex gap-3"
                    >
                      <div className="shrink-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.6)]">
                        <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0 max-w-[78%]">
                        <div className="rounded-2xl rounded-tl-md px-4 py-3 bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">WrapUp AI</span>
                            {isDone && Tag && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide"
                                style={{
                                  color: Tag.color,
                                  background: `${Tag.color}15`,
                                  border: `1px solid ${Tag.color}33`,
                                }}
                              >
                                <Tag.icon className="w-2.5 h-2.5" />
                                {Tag.label}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {displayedText}
                            {isTypingHere && (
                              <span className="inline-block w-[2px] h-3.5 bg-primary ml-0.5 align-middle animate-pulse" />
                            )}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Thinking indicator between user message and AI */}
                {state.turns.length > 0 &&
                  state.turns[state.turns.length - 1].role === "user" &&
                  state.typingIdx === null && (
                    <motion.div
                      key="thinking"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-3"
                    >
                      <div className="shrink-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                      <div className="rounded-2xl rounded-tl-md px-4 py-3 bg-white/[0.03] border border-white/[0.08] flex items-center gap-1.5">
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className="w-1.5 h-1.5 rounded-full bg-primary/70"
                            style={{ animation: `wu-chat-typing 1s ease-in-out ${d * 0.15}s infinite` }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>

            {/* Suggestion chips */}
            <div className="px-5 sm:px-8 pt-1 pb-3 border-t border-white/[0.06]">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Try asking</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors duration-200 cursor-default"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Input bar (visual only) */}
            <div className="px-5 sm:px-8 pb-5 pt-2">
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] backdrop-blur-sm px-3 py-2.5 focus-within:border-primary/40 transition-colors duration-200">
                <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm text-muted-foreground/70 truncate">
                  Ask anything about this meeting…
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded border border-white/[0.08] bg-white/[0.02]">
                  ⌘K
                </span>
                <button
                  className="shrink-0 w-8 h-8 rounded-lg gradient-bg flex items-center justify-center hover:scale-105 transition-transform duration-200"
                  aria-label="Send"
                  type="button"
                >
                  <Send className="w-3.5 h-3.5 text-primary-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer stats */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Avg response", value: "< 2s" },
              { label: "Grounded in", value: "Your meetings" },
              { label: "Context window", value: "All-time" },
              { label: "Source citations", value: "Every answer" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</p>
                <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
