import {
  Mic,
  FileText,
  BarChart3,
  Brain,
  Users,
  Calendar,
  Upload,
  Zap,
  Sparkles,
  CheckCircle2,
  Globe,
  Monitor,
  Smartphone,
  Link2,
  Eye,
  Copy,
  FileAudio,
  FileVideo,
  Clock,
  Radio,
  Languages,
  ListChecks,
  TrendingUp,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import avatar1 from "@/assets/avatars/avatar-1.jpg";
import avatar2 from "@/assets/avatars/avatar-2.jpg";
import avatar3 from "@/assets/avatars/avatar-3.jpg";
import avatar4 from "@/assets/avatars/avatar-4.jpg";

/**
 * InteractiveBentoCard — main card stays stable, shows hover glow.
 */
function InteractiveBentoCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`group relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6 overflow-hidden transition-all duration-500 hover:border-primary/20 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.15),0_0_60px_-10px_hsl(var(--primary)/0.08)] ${className}`}
    >
      <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </div>
  );
}

/**
 * SubCard — shifts once on parent hover with a colored left accent border.
 */
function SubCard({
  children,
  className = "",
  direction = "right",
  accentColor = "border-l-primary",
  hoverColor = "group-hover:bg-primary/[0.08]",
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
  accentColor?: string;
  hoverColor?: string;
}) {
  const translateMap = {
    left: "group-hover:-translate-x-2",
    right: "group-hover:translate-x-2",
    up: "group-hover:-translate-y-2",
    down: "group-hover:translate-y-2",
  };

  return (
    <div
      className={`relative rounded-xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm p-3 overflow-hidden transition-all duration-500 ease-out ${translateMap[direction]} ${hoverColor} group-hover:border-white/[0.12] border-l-2 ${accentColor} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * PlatformBadges — compact row indicating Web / Desktop / Mobile availability.
 */
function PlatformBadges({
  web = true,
  desktop = true,
  mobile = true,
  className = "",
}: {
  web?: boolean;
  desktop?: boolean;
  mobile?: boolean;
  className?: string;
}) {
  const items = [
    { on: web, Icon: Globe, label: "Web" },
    { on: desktop, Icon: Monitor, label: "Desktop" },
    { on: mobile, Icon: Smartphone, label: "Mobile" },
  ];
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {items.map(({ on, Icon, label }) => (
        <span
          key={label}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium border ${
            on
              ? "border-primary/25 bg-primary/10 text-primary/90"
              : "border-white/5 bg-white/[0.02] text-muted-foreground/40"
          }`}
        >
          <Icon className="w-2.5 h-2.5" />
          {label}
        </span>
      ))}
    </div>
  );
}

export default function DemoSection() {
  return (
    <section className="py-28 relative" style={{ opacity: 1, visibility: "visible" }}>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-primary/15 text-primary mb-6 tracking-wider uppercase backdrop-blur-sm bg-primary/5">
            <Sparkles className="w-3 h-3" />
            What You Can Do
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            Everything you need, <span className="gradient-text">in one place</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Powerful AI tools for every part of your meeting workflow.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* ───────────── CARD 1 · AI ASSISTANT (large) ───────────── */}
          <InteractiveBentoCard className="md:col-span-2 min-h-[380px]">
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/20">
                    <Brain className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-[0.15em]">AI Meeting Assistant</span>
                    <h3 className="text-lg font-bold leading-tight">Ask anything about your meetings</h3>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium border border-[#a78bfa]/30 bg-[#a78bfa]/10 text-[#c4b5fd]">
                  <Sparkles className="w-2.5 h-2.5" />
                  RAG · Groq LLM
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Natural-language Q&amp;A powered by a FAISS index over every meeting you've ever recorded — cited answers in seconds.
              </p>

              {/* Chat mock */}
              <div className="flex-1 flex flex-col gap-2 mb-3">
                <SubCard direction="right" accentColor="border-l-[#6366f1]" hoverColor="group-hover:bg-[#6366f1]/[0.08]" className="self-start max-w-[85%] !py-2">
                  <p className="text-[10px] text-[#a5b4fc] font-medium mb-0.5">You</p>
                  <p className="text-[11px] text-foreground/80 leading-snug">What were the top 3 decisions in last week's product sync?</p>
                </SubCard>

                <SubCard direction="left" accentColor="border-l-[#a78bfa]" hoverColor="group-hover:bg-[#a78bfa]/[0.08]" className="self-end max-w-[90%] !py-2">
                  <p className="text-[10px] text-[#c4b5fd] font-medium mb-1 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> WrapUp AI
                  </p>
                  <p className="text-[11px] text-foreground/80 leading-snug mb-1.5">
                    <span className="text-foreground font-semibold">1.</span> Approved Q2 budget ($240K).{" "}
                    <span className="text-foreground font-semibold">2.</span> Greenlit 2 engineering hires.{" "}
                    <span className="text-foreground font-semibold">3.</span> Ship v2.0 by April 30<span className="inline-block w-1 h-2.5 bg-primary/70 ml-0.5 animate-pulse align-middle" />
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/70">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Cited from Product Sync · Apr 10 · 14:23, 31:08, 42:55</span>
                  </div>
                </SubCard>
              </div>

              {/* Suggestion chips */}
              <div className="flex gap-1.5 flex-wrap mb-3">
                <SubCard direction="up" accentColor="border-l-[#f59e0b]" hoverColor="group-hover:bg-[#f59e0b]/[0.08]" className="!py-1 !px-2">
                  <span className="text-[9px] text-[#fcd34d]">Show action items</span>
                </SubCard>
                <SubCard direction="up" accentColor="border-l-[#06b6d4]" hoverColor="group-hover:bg-[#06b6d4]/[0.08]" className="!py-1 !px-2">
                  <span className="text-[9px] text-[#67e8f9]">Summarize Q3</span>
                </SubCard>
                <SubCard direction="up" accentColor="border-l-[#10b981]" hoverColor="group-hover:bg-[#10b981]/[0.08]" className="!py-1 !px-2">
                  <span className="text-[9px] text-[#6ee7b7]">Who owns launch?</span>
                </SubCard>
              </div>

              {/* Footer stats */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-3">
                  {[
                    { label: "60+ languages", dot: "bg-[#10b981]", color: "text-[#6ee7b7]" },
                    { label: "<2s response", dot: "bg-[#3b82f6]", color: "text-[#93c5fd]" },
                    { label: "Context-aware", dot: "bg-[#f59e0b]", color: "text-[#fcd34d]" },
                  ].map((s) => (
                    <span key={s.label} className="inline-flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      <span className={`text-[9px] ${s.color}`}>{s.label}</span>
                    </span>
                  ))}
                </div>
                <PlatformBadges />
              </div>
            </div>
          </InteractiveBentoCard>

          {/* ───────────── CARD 2 · MEETING ANALYTICS ───────────── */}
          <InteractiveBentoCard>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/25 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-[#60a5fa]" />
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-[#93c5fd] uppercase tracking-[0.15em]">Insights</span>
                  <h3 className="font-semibold text-sm leading-tight">Meeting Analytics</h3>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                Sentiment, engagement, and talk-time — auto-computed from every session.
              </p>

              {/* Speaker bars */}
              <SubCard direction="left" accentColor="border-l-[#3b82f6]" hoverColor="group-hover:bg-[#3b82f6]/[0.06]" className="mb-2 !p-2.5">
                <p className="text-[9px] text-muted-foreground mb-2 font-medium">Talk-time distribution</p>
                {[
                  { name: "Sarah", pct: 42, color: "from-[#3b82f6] to-[#60a5fa]" },
                  { name: "Alex", pct: 33, color: "from-[#a78bfa] to-[#c4b5fd]" },
                  { name: "Maya", pct: 25, color: "from-[#f59e0b] to-[#fcd34d]" },
                ].map((s) => (
                  <div key={s.name} className="flex items-center gap-2 mb-1 last:mb-0">
                    <span className="text-[9px] text-foreground/70 w-10">{s.name}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${s.color}`} style={{ width: `${s.pct}%` }} />
                    </div>
                    <span className="text-[9px] text-muted-foreground tabular-nums w-7 text-right">{s.pct}%</span>
                  </div>
                ))}
              </SubCard>

              {/* Premium line chart — engagement over time */}
              <SubCard direction="left" accentColor="border-l-[#60a5fa]" hoverColor="group-hover:bg-[#60a5fa]/[0.06]" className="mb-3 !p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[9px] text-muted-foreground font-medium">Engagement timeline</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <Activity className="h-2.5 w-2.5 text-[#34d399]" />
                      <span className="text-[9px] font-bold text-[#34d399] tabular-nums">87</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <TrendingUp className="h-2.5 w-2.5 text-[#f9a8d4]" />
                      <span className="text-[9px] font-bold text-[#f9a8d4] tabular-nums">+0.72</span>
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <svg viewBox="0 0 240 64" className="w-full h-16" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="engFillA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="engFillB" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="engStrokeA" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#60a5fa" />
                      </linearGradient>
                      <linearGradient id="engStrokeB" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#c4b5fd" />
                      </linearGradient>
                    </defs>

                    <line x1="0" y1="16" x2="240" y2="16" stroke="white" strokeOpacity="0.05" strokeDasharray="2 3" />
                    <line x1="0" y1="32" x2="240" y2="32" stroke="white" strokeOpacity="0.05" strokeDasharray="2 3" />
                    <line x1="0" y1="48" x2="240" y2="48" stroke="white" strokeOpacity="0.05" strokeDasharray="2 3" />

                    <path d="M 0 40 C 13 36 27 32 40 32 C 53 32 67 26 80 24 C 93 22 107 19 120 18 C 133 17 147 25 160 28 C 173 27 187 16 200 14 C 213 14 227 18 240 20 L 240 64 L 0 64 Z" fill="url(#engFillA)" />
                    <path d="M 0 40 C 13 36 27 32 40 32 C 53 32 67 26 80 24 C 93 22 107 19 120 18 C 133 17 147 25 160 28 C 173 27 187 16 200 14 C 213 14 227 18 240 20" stroke="url(#engStrokeA)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                    <path d="M 0 52 C 13 50 27 47 40 45 C 53 44 67 43 80 42 C 93 40 107 33 120 30 C 133 30 147 33 160 35 C 173 34 187 29 200 28 C 213 28 227 30 240 32 L 240 64 L 0 64 Z" fill="url(#engFillB)" />
                    <path d="M 0 52 C 13 50 27 47 40 45 C 53 44 67 43 80 42 C 93 40 107 33 120 30 C 133 30 147 33 160 35 C 173 34 187 29 200 28 C 213 28 227 30 240 32" stroke="url(#engStrokeB)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                    <circle cx="40" cy="32" r="1.5" fill="#60a5fa" />
                    <circle cx="80" cy="24" r="1.5" fill="#60a5fa" />
                    <circle cx="120" cy="18" r="1.5" fill="#60a5fa" />
                    <circle cx="160" cy="28" r="1.5" fill="#60a5fa" />
                    <circle cx="200" cy="14" r="2.5" fill="#60a5fa" stroke="white" strokeOpacity="0.7" strokeWidth="1" />
                    <circle cx="200" cy="14" r="5" fill="#60a5fa" fillOpacity="0.15" />

                    <line x1="200" y1="14" x2="200" y2="2" stroke="#60a5fa" strokeOpacity="0.35" strokeDasharray="1 2" />
                  </svg>
                </div>

                <div className="flex justify-between mt-1 text-[8px] text-muted-foreground/60 tabular-nums">
                  <span>0m</span>
                  <span>15m</span>
                  <span>30m</span>
                  <span>45m</span>
                  <span>60m</span>
                </div>

                <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-white/[0.05]">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-0.5 rounded-full bg-[#60a5fa]" />
                    <span className="text-[8px] text-[#93c5fd]">Speaker</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-0.5 rounded-full bg-[#a78bfa]" />
                    <span className="text-[8px] text-[#c4b5fd]">Team</span>
                  </span>
                  <span className="ml-auto inline-flex items-center gap-0.5 text-[8px] text-muted-foreground/70">
                    <Sparkles className="w-2 h-2" /> Peak · 50 min
                  </span>
                </div>
              </SubCard>

              <PlatformBadges />
            </div>
          </InteractiveBentoCard>

          {/* ───────────── CARD 3 · SMART TRANSCRIPTION ───────────── */}
          <InteractiveBentoCard>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-[#10b981]/15 border border-[#10b981]/25 flex items-center justify-center">
                    <Mic className="h-4 w-4 text-[#34d399]" />
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-[#6ee7b7] uppercase tracking-[0.15em]">Speech → Text</span>
                    <h3 className="font-semibold text-sm leading-tight">Smart Transcription</h3>
                  </div>
                </div>
              </div>

              {/* Waveform + speaker */}
              <SubCard direction="right" accentColor="border-l-[#10b981]" hoverColor="group-hover:bg-[#10b981]/[0.06]" className="mb-2 !p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-[#10b981]/20 text-[#6ee7b7]">
                    <span className="w-1 h-1 rounded-full bg-[#34d399] animate-pulse" /> Speaker 1
                  </span>
                  <span className="text-[9px] text-muted-foreground">0:42 · 98% conf.</span>
                </div>
                <div className="flex items-end gap-[2px] h-6">
                  {[30, 55, 40, 70, 85, 45, 60, 90, 50, 35, 75, 65, 40, 55, 80, 45, 30, 60, 85, 50, 40, 70, 55, 35, 65].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-[#10b981]/30 to-[#34d399]/80"
                      style={{ height: `${h}%`, animation: `pulse ${1.5 + (i % 3) * 0.2}s ease-in-out infinite` }}
                    />
                  ))}
                </div>
              </SubCard>

              {/* Engines */}
              <div className="flex gap-1.5 mb-2.5">
                <SubCard direction="up" accentColor="border-l-[#8b5cf6]" hoverColor="group-hover:bg-[#8b5cf6]/[0.08]" className="flex-1 !p-1.5 text-center">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Primary</p>
                  <p className="text-[10px] font-semibold text-[#c4b5fd]">Deepgram nova-3</p>
                </SubCard>
                <SubCard direction="down" accentColor="border-l-[#06b6d4]" hoverColor="group-hover:bg-[#06b6d4]/[0.08]" className="flex-1 !p-1.5 text-center">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Fallback</p>
                  <p className="text-[10px] font-semibold text-[#67e8f9]">Whisper large-v3</p>
                </SubCard>
              </div>

              <div className="flex items-center gap-1.5 mb-2.5">
                <Languages className="h-3 w-3 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">60+ languages · auto-detect</span>
              </div>

              <div className="flex gap-1 flex-wrap mb-3">
                <SubCard direction="up" accentColor="border-l-[#10b981]" hoverColor="group-hover:bg-[#10b981]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[9px] text-[#6ee7b7]">EN</span>
                </SubCard>
                <SubCard direction="down" accentColor="border-l-[#f59e0b]" hoverColor="group-hover:bg-[#f59e0b]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[9px] text-[#fcd34d]">বাংলা</span>
                </SubCard>
                <SubCard direction="up" accentColor="border-l-[#f43f5e]" hoverColor="group-hover:bg-[#f43f5e]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[9px] text-[#fda4af]">ES</span>
                </SubCard>
                <SubCard direction="down" accentColor="border-l-[#8b5cf6]" hoverColor="group-hover:bg-[#8b5cf6]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[9px] text-[#c4b5fd]">हिं</span>
                </SubCard>
                <SubCard direction="up" accentColor="border-l-[#ef4444]" hoverColor="group-hover:bg-[#ef4444]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[9px] text-[#fca5a5]">日本</span>
                </SubCard>
                <SubCard direction="down" accentColor="border-l-[#06b6d4]" hoverColor="group-hover:bg-[#06b6d4]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[9px] text-[#67e8f9]">+55</span>
                </SubCard>
              </div>

              <PlatformBadges />
            </div>
          </InteractiveBentoCard>

          {/* ───────────── CARD 4 · AI SUMMARIES & MOM ───────────── */}
          <InteractiveBentoCard>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-[#a78bfa]/15 border border-[#a78bfa]/25 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-[#c4b5fd]" />
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-[#c4b5fd] uppercase tracking-[0.15em]">Llama 3.3 70B</span>
                    <h3 className="font-semibold text-sm leading-tight">AI Summaries &amp; MoM</h3>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                Executive summary, decisions, and Minutes of Meeting — generated the instant the transcript finishes.
              </p>

              <SubCard direction="right" accentColor="border-l-[#a78bfa]" hoverColor="group-hover:bg-[#a78bfa]/[0.06]" className="mb-2 !p-2.5">
                <p className="text-[9px] text-[#c4b5fd] font-semibold uppercase tracking-wider mb-1">Executive Summary</p>
                <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                  "Team finalized Q2 roadmap, approved $240K budget, and committed to v2 launch by Apr 30."
                </p>
              </SubCard>

              <div className="space-y-1.5 mb-3">
                <p className="text-[9px] font-semibold text-foreground/60 uppercase tracking-wider flex items-center gap-1">
                  <ListChecks className="w-2.5 h-2.5" /> Action Items
                </p>
                <SubCard direction="right" accentColor="border-l-[#34d399]" hoverColor="group-hover:bg-[#34d399]/[0.08]" className="!p-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-[#34d399] flex-shrink-0" />
                    <span className="text-[10px] text-foreground/75 flex-1 truncate">Finalize hiring reqs</span>
                    <span className="text-[8px] text-muted-foreground">Sarah</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#34d399]/15 text-[#34d399]">Apr 22</span>
                  </div>
                </SubCard>
                <SubCard direction="left" accentColor="border-l-[#fbbf24]" hoverColor="group-hover:bg-[#fbbf24]/[0.08]" className="!p-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-[#fbbf24] flex-shrink-0" />
                    <span className="text-[10px] text-foreground/75 flex-1 truncate">QA v2 release candidate</span>
                    <span className="text-[8px] text-muted-foreground">Alex</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#fbbf24]/15 text-[#fbbf24]">Apr 25</span>
                  </div>
                </SubCard>
              </div>

              <PlatformBadges />
            </div>
          </InteractiveBentoCard>

          {/* ───────────── CARD 5 · SHARE & COLLABORATE ───────────── */}
          <InteractiveBentoCard>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#14b8a6]/15 border border-[#14b8a6]/25 flex items-center justify-center">
                  <Users className="h-4 w-4 text-[#2dd4bf]" />
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-[#5eead4] uppercase tracking-[0.15em]">Collaboration</span>
                  <h3 className="font-semibold text-sm leading-tight">Share &amp; Collaborate</h3>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                One click to share a transcript via signed URL — no account required to view.
              </p>

              <SubCard direction="right" accentColor="border-l-[#14b8a6]" hoverColor="group-hover:bg-[#14b8a6]/[0.08]" className="mb-2 !p-2">
                <div className="flex items-center gap-2">
                  <Link2 className="h-3 w-3 text-[#2dd4bf] flex-shrink-0" />
                  <span className="text-[10px] text-foreground/70 font-mono flex-1 truncate">wrapup.ai/s/x7k2nQ</span>
                  <Copy className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground" />
                </div>
              </SubCard>

              <SubCard direction="left" accentColor="border-l-[#3b82f6]" hoverColor="group-hover:bg-[#3b82f6]/[0.06]" className="mb-3 !p-2.5">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="flex -space-x-1.5">
                    {[avatar1, avatar2, avatar3, avatar4].map((src, i) => (
                      <img key={i} src={src} alt="" className="w-6 h-6 rounded-full border-2 border-background object-cover" />
                    ))}
                    <div className="w-6 h-6 rounded-full border-2 border-background bg-white/[0.08] flex items-center justify-center">
                      <span className="text-[8px] text-muted-foreground font-semibold">+8</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground">12 teammates</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Eye className="w-2.5 h-2.5" /> 47 views</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" /> RLS secured</span>
                </div>
              </SubCard>

              <PlatformBadges />
            </div>
          </InteractiveBentoCard>

          {/* ───────────── CARD 6 · UPLOAD & RECORD ───────────── */}
          <InteractiveBentoCard>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#ec4899]/15 border border-[#ec4899]/25 flex items-center justify-center">
                  <Upload className="h-4 w-4 text-[#f472b6]" />
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-[#f9a8d4] uppercase tracking-[0.15em]">Any Source</span>
                  <h3 className="font-semibold text-sm leading-tight">Upload &amp; Record</h3>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                Drop any audio or video — we auto-extract audio with ffmpeg before processing.
              </p>

              <SubCard direction="down" accentColor="border-l-[#ec4899]" hoverColor="group-hover:bg-[#ec4899]/[0.08]" className="mb-2 !p-3 border-dashed">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <FileAudio className="h-4 w-4 text-[#f472b6]" />
                    <FileVideo className="h-4 w-4 text-[#f472b6]" />
                  </div>
                  <p className="text-[10px] text-foreground/70 font-medium">Drop files · up to 5 GB</p>
                  <p className="text-[8px] text-muted-foreground mt-0.5">5 GB video → ~5 MB audio</p>
                </div>
              </SubCard>

              <div className="flex gap-1 flex-wrap mb-3">
                <SubCard direction="up" accentColor="border-l-[#10b981]" hoverColor="group-hover:bg-[#10b981]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[8px] font-mono text-[#6ee7b7]">MP3</span>
                </SubCard>
                <SubCard direction="down" accentColor="border-l-[#3b82f6]" hoverColor="group-hover:bg-[#3b82f6]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[8px] font-mono text-[#93c5fd]">MP4</span>
                </SubCard>
                <SubCard direction="up" accentColor="border-l-[#f59e0b]" hoverColor="group-hover:bg-[#f59e0b]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[8px] font-mono text-[#fcd34d]">WAV</span>
                </SubCard>
                <SubCard direction="down" accentColor="border-l-[#a78bfa]" hoverColor="group-hover:bg-[#a78bfa]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[8px] font-mono text-[#c4b5fd]">M4A</span>
                </SubCard>
                <SubCard direction="up" accentColor="border-l-[#06b6d4]" hoverColor="group-hover:bg-[#06b6d4]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[8px] font-mono text-[#67e8f9]">OGG</span>
                </SubCard>
                <SubCard direction="down" accentColor="border-l-[#ef4444]" hoverColor="group-hover:bg-[#ef4444]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[8px] font-mono text-[#fca5a5]">WebM</span>
                </SubCard>
                <SubCard direction="up" accentColor="border-l-[#ec4899]" hoverColor="group-hover:bg-[#ec4899]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[8px] font-mono text-[#f9a8d4]">MKV</span>
                </SubCard>
              </div>

              <PlatformBadges />
            </div>
          </InteractiveBentoCard>

          {/* ───────────── CARD 7 · CALENDAR & INTEGRATIONS ───────────── */}
          <InteractiveBentoCard>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/25 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-[#60a5fa]" />
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-[#93c5fd] uppercase tracking-[0.15em]">Auto-Capture</span>
                  <h3 className="font-semibold text-sm leading-tight">Calendar &amp; Integrations</h3>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                Syncs with your calendar and sends summaries to the tools your team already uses.
              </p>

              {/* Integration pills */}
              <div className="flex gap-1 flex-wrap mb-3">
                <SubCard direction="left" accentColor="border-l-[#3b82f6]" hoverColor="group-hover:bg-[#3b82f6]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[8px] text-[#93c5fd]">Google Cal</span>
                </SubCard>
                <SubCard direction="right" accentColor="border-l-[#06b6d4]" hoverColor="group-hover:bg-[#06b6d4]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[8px] text-[#67e8f9]">Zoom</span>
                </SubCard>
                <SubCard direction="left" accentColor="border-l-[#8b5cf6]" hoverColor="group-hover:bg-[#8b5cf6]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[8px] text-[#c4b5fd]">Teams</span>
                </SubCard>
                <SubCard direction="right" accentColor="border-l-[#10b981]" hoverColor="group-hover:bg-[#10b981]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[8px] text-[#6ee7b7]">Slack</span>
                </SubCard>
                <SubCard direction="left" accentColor="border-l-[#ef4444]" hoverColor="group-hover:bg-[#ef4444]/[0.08]" className="!p-1 !px-1.5">
                  <span className="text-[8px] text-[#fca5a5]">Notion</span>
                </SubCard>
              </div>

              {/* Upcoming list */}
              <div className="space-y-1.5 mb-3">
                <SubCard direction="right" accentColor="border-l-[#3b82f6]" hoverColor="group-hover:bg-[#3b82f6]/[0.06]" className="!p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-[#60a5fa] font-mono tabular-nums">9:00 AM</span>
                    <span className="text-[9px] text-foreground/70 flex-1 truncate">Sprint Planning</span>
                    <span className="inline-flex items-center gap-0.5 text-[8px] text-muted-foreground">
                      <Users className="w-2.5 h-2.5" /> 8
                    </span>
                  </div>
                </SubCard>
                <SubCard direction="right" accentColor="border-l-[#f59e0b]" hoverColor="group-hover:bg-[#f59e0b]/[0.06]" className="!p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-[#fbbf24] font-mono tabular-nums">2:00 PM</span>
                    <span className="text-[9px] text-foreground/70 flex-1 truncate">Design Review</span>
                    <span className="inline-flex items-center gap-0.5 text-[8px] text-muted-foreground">
                      <Users className="w-2.5 h-2.5" /> 4
                    </span>
                  </div>
                </SubCard>
              </div>

              <PlatformBadges />
            </div>
          </InteractiveBentoCard>

          {/* ───────────── CARD 8 · REAL-TIME PROCESSING ───────────── */}
          <InteractiveBentoCard>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-[#22c55e]/15 border border-[#22c55e]/25 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-[#4ade80]" />
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-[#86efac] uppercase tracking-[0.15em]">Live Pipeline</span>
                    <h3 className="font-semibold text-sm leading-tight">Real-Time Processing</h3>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#4ade80]">
                  <span className="w-1 h-1 rounded-full bg-[#4ade80] animate-pulse" /> Live
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                Transcribe → diarize → summarize as the meeting is still happening.
              </p>

              {/* Pipeline stages */}
              <div className="space-y-1.5 mb-3">
                <SubCard direction="right" accentColor="border-l-[#22c55e]" hoverColor="group-hover:bg-[#22c55e]/[0.06]" className="!p-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-[#22c55e] flex-shrink-0" />
                    <span className="text-[10px] flex-1 text-foreground/70 line-through decoration-[#22c55e]/40">Record</span>
                  </div>
                </SubCard>
                <SubCard direction="left" accentColor="border-l-[#22c55e]" hoverColor="group-hover:bg-[#22c55e]/[0.06]" className="!p-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-[#22c55e] flex-shrink-0" />
                    <span className="text-[10px] flex-1 text-foreground/70 line-through decoration-[#22c55e]/40">Transcribe</span>
                  </div>
                </SubCard>
                <SubCard direction="right" accentColor="border-l-[#f59e0b]" hoverColor="group-hover:bg-[#f59e0b]/[0.06]" className="!p-1.5">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3 h-3 text-[#f59e0b] flex-shrink-0 animate-pulse" />
                    <span className="text-[10px] flex-1 text-foreground/90 font-medium">Diarize speakers</span>
                    <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] animate-pulse" />
                    </div>
                  </div>
                </SubCard>
                <SubCard direction="left" accentColor="border-l-[#6b7280]" hoverColor="group-hover:bg-[#6b7280]/[0.06]" className="!p-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                    <span className="text-[10px] flex-1 text-muted-foreground/50">Summarize</span>
                  </div>
                </SubCard>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
                  <Clock className="w-2.5 h-2.5" /> ~9.3s avg
                </span>
                <PlatformBadges />
              </div>
            </div>
          </InteractiveBentoCard>
        </div>
      </div>
    </section>
  );
}
