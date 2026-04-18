import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Bell,
  Fingerprint,
  WifiOff,
  Sparkles,
  Check,
  ArrowRight,
  Mail,
  Apple,
  Play as PlayIcon,
} from "lucide-react";

const FEATURES = [
  { icon: Bell, label: "Push Notifications", desc: "Instant alerts when summaries are ready" },
  { icon: WifiOff, label: "Offline Mode", desc: "Review transcripts without internet" },
  { icon: Fingerprint, label: "Biometric Security", desc: "Face ID & fingerprint unlock" },
  { icon: Sparkles, label: "Voice Q&A", desc: "Ask questions about meetings hands-free" },
];

const AVATARS = [
  { initial: "S", color: "#8b5cf6" },
  { initial: "M", color: "#06b6d4" },
  { initial: "E", color: "#f59e0b" },
  { initial: "R", color: "#ec4899" },
  { initial: "J", color: "#10b981" },
];

const BASE_WAITLIST_COUNT = 2847;

function MobilePreview() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 3), 1700);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative mx-auto w-[260px] sm:w-[280px]">
      {/* Outer phone frame */}
      <div className="relative rounded-[42px] bg-gradient-to-b from-white/10 to-white/5 p-2 border border-white/[0.12] shadow-[0_40px_80px_-20px_rgba(139,92,246,0.35)]">
        <div className="relative rounded-[34px] bg-black overflow-hidden aspect-[9/19]">
          {/* Dynamic island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-black border border-white/[0.15] z-20" />

          {/* Screen */}
          <div className="absolute inset-0 cinema-gradient flex flex-col">
            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pt-3.5 pb-2 text-[10px] text-white/80 font-semibold">
              <span>9:41</span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm bg-white/60" />
              </span>
            </div>

            {/* App header */}
            <div className="px-5 pt-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-lg shadow-primary/30">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">WrapUp</p>
              </div>
              <h4 className="text-lg font-bold text-foreground leading-tight">Today's Meetings</h4>
            </div>

            {/* Cards */}
            <div className="px-5 mt-4 space-y-2 flex-1">
              <motion.div
                animate={{ scale: tick === 0 ? 1.02 : 1, opacity: tick === 0 ? 1 : 0.85 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl p-3 border"
                style={{
                  background: tick === 0 ? "hsl(260, 90%, 55%, 0.18)" : "rgba(255,255,255,0.04)",
                  borderColor: tick === 0 ? "hsl(260, 90%, 55%, 0.4)" : "rgba(255,255,255,0.08)",
                  boxShadow: tick === 0 ? "0 0 24px -6px hsl(260, 90%, 55%, 0.5)" : "none",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-[9px] uppercase tracking-wider text-red-400 font-bold">Live Now</p>
                </div>
                <p className="text-[11px] font-bold text-foreground">Q4 Planning</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">42 min · 4 speakers</p>
              </motion.div>

              <motion.div
                animate={{ scale: tick === 1 ? 1.02 : 1, opacity: tick === 1 ? 1 : 0.85 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl p-3 border"
                style={{
                  background: tick === 1 ? "hsl(190, 90%, 50%, 0.15)" : "rgba(255,255,255,0.04)",
                  borderColor: tick === 1 ? "hsl(190, 90%, 50%, 0.35)" : "rgba(255,255,255,0.08)",
                  boxShadow: tick === 1 ? "0 0 24px -6px hsl(190, 90%, 50%, 0.45)" : "none",
                }}
              >
                <p className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold mb-1">AI Summary Ready</p>
                <p className="text-[11px] font-bold text-foreground">Design Review</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">3 key decisions · 5 action items</p>
              </motion.div>

              <motion.div
                animate={{ scale: tick === 2 ? 1.02 : 1, opacity: tick === 2 ? 1 : 0.85 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl p-3 border"
                style={{
                  background: tick === 2 ? "hsl(160, 70%, 45%, 0.15)" : "rgba(255,255,255,0.04)",
                  borderColor: tick === 2 ? "hsl(160, 70%, 45%, 0.35)" : "rgba(255,255,255,0.08)",
                  boxShadow: tick === 2 ? "0 0 24px -6px hsl(160, 70%, 45%, 0.45)" : "none",
                }}
              >
                <p className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold mb-1">Completed</p>
                <p className="text-[11px] font-bold text-foreground">Client Standup</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Today, 9:00 AM</p>
              </motion.div>
            </div>

            {/* Tab bar */}
            <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-around">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-1 h-1 rounded-full bg-primary" />
                <Smartphone className="w-3.5 h-3.5 text-primary" />
              </div>
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground/60" />
              <Bell className="w-3.5 h-3.5 text-muted-foreground/60" />
            </div>
          </div>

          {/* Screen glare */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none rounded-[34px]" />
        </div>
      </div>

      {/* Floating notification */}
      <motion.div
        initial={{ opacity: 0, x: 40, y: 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="hidden sm:flex absolute -right-6 top-16 w-48 rounded-2xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-xl p-3 shadow-[0_20px_50px_-10px_rgba(139,92,246,0.3)]"
      >
        <div className="flex items-start gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-foreground">WrapUp</p>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
              Your Q4 summary is ready — 4 action items.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function MobileWaitlistSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [count, setCount] = useState(BASE_WAITLIST_COUNT);

  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 2)), 4000);
    return () => clearInterval(id);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubmitted(true);
    setCount((c) => c + 1);
  };

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: "hsl(260, 90%, 55%, 0.08)" }} />
        <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: "hsl(190, 90%, 50%, 0.05)" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Phone mock */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-2 lg:order-1"
          >
            <MobilePreview />
          </motion.div>

          {/* Waitlist content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 lg:order-2"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 text-primary mb-6 backdrop-blur-sm bg-primary/5 tracking-wider uppercase">
              <Smartphone className="w-3 h-3" />
              Coming Soon · iOS & Android
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-[1.1]">
              WrapUp in your <span className="gradient-text">pocket.</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-body mb-8 max-w-lg">
              Meeting intelligence, everywhere you go. Be first to try the native mobile app — launching Q2 2026.
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.label}
                    className="flex items-start gap-2.5 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-primary/20 transition-all duration-500"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground leading-tight">{f.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Waitlist form */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-white/[0.02] to-transparent p-5 backdrop-blur-sm shadow-[0_0_60px_-20px_hsl(var(--primary)/0.35)]">
              {!submitted ? (
                <>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Join the Waitlist</p>
                  <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@work.com"
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all duration-300"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="group relative inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary/15 border border-primary/30 text-foreground font-semibold text-sm shadow-lg shadow-primary/25 backdrop-blur-md transition-all duration-300 hover:bg-primary/25 hover:border-primary/50 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.6)] hover:scale-[1.02]"
                    >
                      Notify me
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </button>
                  </form>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">You're on the list!</p>
                    <p className="text-xs text-muted-foreground mt-0.5">We'll email you the moment the app lands on the App Store.</p>
                  </div>
                </motion.div>
              )}

              {/* Social proof */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06] flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {AVATARS.map((a, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white"
                        style={{
                          background: `linear-gradient(135deg, ${a.color}, ${a.color}80)`,
                        }}
                      >
                        {a.initial}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-foreground font-bold tabular-nums">{count.toLocaleString()}</span> already joined
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08]">
                    <Apple className="w-3 h-3 text-white/70" />
                    <span className="text-[10px] font-semibold text-white/70">iOS</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08]">
                    <PlayIcon className="w-3 h-3 text-white/70" />
                    <span className="text-[10px] font-semibold text-white/70">Android</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
