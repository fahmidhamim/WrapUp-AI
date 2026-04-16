import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play, BarChart3, MessageSquare, FileText, Mic, Users, TrendingUp, Zap, Upload, Calendar, Clock, Shield, Globe, Headphones, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function HeroScene() {
  return (
    <section className="relative flex flex-col items-center justify-center pt-28 pb-20" style={{ minHeight: '100vh' }}>
      {/* Deep gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-[200px]" />
        <div className="absolute top-[55%] left-[15%] w-[350px] h-[350px] rounded-full blur-[150px]" style={{ background: "hsl(270, 50%, 15%, 0.08)" }} />
        <div className="absolute top-[35%] right-[10%] w-[300px] h-[300px] rounded-full blur-[130px]" style={{ background: "hsl(250, 60%, 20%, 0.06)" }} />
      </div>

      {/* Hero text */}
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 text-primary mb-8 backdrop-blur-sm bg-primary/5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
            AI-Powered Meeting Intelligence
          </span>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight mb-2 leading-[1.05]">
            Meetings. Wrapped.
            <br />
            <span className="gradient-text">Perfectly.</span>
          </h1>
          <div className="relative h-[2px] max-w-[56rem] mx-auto overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <motion.div
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
              animate={{ x: ['-100%', '400%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Live activity badge */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1.5} className="flex justify-center mb-8 mt-20">
          <div className="group inline-flex items-center gap-4 px-6 py-3 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md transition-all duration-500 cursor-pointer hover:border-[hsl(200,80%,60%)/0.25] relative">
            <div className="absolute -inset-[1px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" style={{ boxShadow: '0 0 18px 2px hsla(200,85%,65%,0.18), 0 0 50px 8px hsla(200,80%,60%,0.08)' }} />
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 120% at center, hsla(200,85%,65%,0.30) 0%, hsla(200,80%,60%,0.08) 35%, transparent 65%)' }} />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[hsl(120,85%,55%)] shadow-[0_0_10px_3px_hsla(120,85%,55%,0.5)] animate-[heartbeat_1.4s_ease-in-out_infinite]" />
              <span className="text-sm font-semibold text-[hsl(120,85%,55%)] tracking-wide">LIVE</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={new URL(`../../assets/avatars/avatar-${i}.jpg`, import.meta.url).href}
                  alt=""
                  className="w-8 h-8 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">35,000</span>
              <p className="text-[11px] text-muted-foreground leading-tight">Users active in the last 24h</p>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial="hidden" animate="visible" variants={fadeUp} custom={2}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-body leading-relaxed"
        >
          AI-powered transcription, speaker insights, and structured summaries — instantly.
        </motion.p>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex justify-center">
          <Link to="/signup" className="group relative">
            {/* Glow backdrop */}
            <div className="absolute -inset-1 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="relative flex items-center gap-3 px-10 py-4 rounded-full bg-card/80 backdrop-blur-md border border-border/50 group-hover:border-primary/40 group-hover:bg-card/90 transition-all duration-500 group-hover:shadow-[0_0_40px_-8px_hsl(var(--primary)/0.5)]">
              <span className="text-lg font-semibold text-foreground">Start for Free</span>
              <ArrowRight className="h-5 w-5 text-foreground group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-16 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground/60 font-body tracking-wider uppercase">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-muted-foreground/20 flex items-start justify-center p-1">
            <motion.div
              className="w-1 h-2 rounded-full bg-primary/60"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>

      {/* ── Dashboard Preview Mockup ── */}
      <div className="container mx-auto px-4 mt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-6xl mx-auto"
        >
          {/* Strong purple backlight glow */}
          <div
            className="absolute -inset-6 rounded-[2rem] pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 50%, hsl(265 90% 55% / 0.55), hsl(250 80% 50% / 0.3) 50%, transparent 75%)",
              filter: "blur(35px)",
            }}
          />
          <div
            className="absolute -inset-3 rounded-3xl pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 50%, hsl(265 90% 60% / 0.4), transparent 70%)",
              filter: "blur(15px)",
            }}
          />
          {/* Gradient border */}
          <div
            className="absolute -inset-[2px] rounded-2xl pointer-events-none"
            style={{
              background: "linear-gradient(135deg, hsl(265 90% 60% / 0.7), hsl(280 85% 55% / 0.5), hsl(265 90% 60% / 0.7))",
            }}
          />

          {/* Card body */}
          <div
            className="relative rounded-2xl bg-[hsl(240,20%,6%)] overflow-hidden"
            style={{
              boxShadow: "0 0 120px -10px hsl(265 90% 55% / 0.45), 0 0 60px -5px hsl(250 90% 60% / 0.3)",
            }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="bg-white/[0.04] rounded-md px-4 py-1 text-[10px] text-muted-foreground">
                  app.wrapup.ai/dashboard
                </div>
              </div>
            </div>

            <div className="flex min-h-[620px]">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col w-56 border-r border-white/[0.06] p-4 shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
                    <Mic className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-foreground/90">WrapUp</span>
                  <span className="text-[9px] text-muted-foreground ml-auto">v2.1</span>
                </div>
                <div className="mt-1 mb-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold bg-primary/20 text-primary">
                    👑 Premium
                  </span>
                </div>
                <nav className="space-y-1">
                  {[
                    { icon: BarChart3, label: "Dashboard", active: true },
                    { icon: Play, label: "Recordings" },
                    { icon: FileText, label: "Transcripts" },
                    { icon: MessageSquare, label: "AI Chat" },
                    { icon: Users, label: "Team" },
                    { icon: TrendingUp, label: "Analytics" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${
                        item.active
                          ? "bg-primary/15 text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground/70"
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </div>
                  ))}
                </nav>

                <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground/70 cursor-pointer">
                    <User className="h-3.5 w-3.5" />
                    Profile
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-400/80 hover:text-rose-400 cursor-pointer">
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 p-5 md:p-6">
                <p className="text-primary font-semibold text-sm mb-0.5">Welcome back, Alex</p>
                <p className="text-[11px] text-muted-foreground mb-5">What would you like to do today?</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  {/* Card: Start Meeting */}
                  <div className="sm:col-span-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 p-4 flex flex-col justify-between transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] cursor-pointer">
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-1">Record Meeting with AI</h3>
                      <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xs">
                        Start recording and get real-time transcription, speaker analytics, and smart summaries.
                      </p>
                    </div>
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold gradient-bg text-white">
                        <Zap className="h-3 w-3" /> Start Recording
                      </span>
                    </div>
                  </div>

                  {/* Card: AI Assistant */}
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.05] hover:scale-[1.02] cursor-pointer">
                    <div className="flex items-center gap-1.5 mb-3">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[10px] font-semibold text-foreground/80">AI Assistant</span>
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white/[0.04] rounded-lg rounded-tl-sm px-2 py-1.5 text-[9px] text-muted-foreground max-w-[90%]">
                        Create a summary of today's standup
                      </div>
                      <div className="bg-primary/10 rounded-lg rounded-tr-sm px-2 py-1.5 text-[9px] text-foreground/70 ml-auto max-w-[90%]">
                        Here is a draft summary…
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: "Meetings Today", value: "4", sub: "2 upcoming", color: "text-primary" },
                    { label: "Hours Saved", value: "12.5h", sub: "this week", color: "text-emerald-400" },
                    { label: "Action Items", value: "8", sub: "3 pending", color: "text-amber-400" },
                    { label: "Team Score", value: "94%", sub: "↑ 5%", color: "text-cyan-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.05] hover:scale-[1.03] cursor-pointer">
                      <p className="text-[9px] text-muted-foreground mb-1">{stat.label}</p>
                      <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-[9px] text-muted-foreground">{stat.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Feature mini cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { icon: Upload, label: "Upload Recording", desc: "Drag & drop audio files", accent: "text-violet-400" },
                    { icon: Calendar, label: "Calendar Sync", desc: "Google & Outlook linked", accent: "text-blue-400" },
                    { icon: Globe, label: "Live Transcription", desc: "40+ languages supported", accent: "text-emerald-400" },
                    { icon: Shield, label: "Privacy Vault", desc: "End-to-end encrypted", accent: "text-rose-400" },
                    { icon: Clock, label: "Meeting History", desc: "128 recordings saved", accent: "text-amber-400" },
                    { icon: Headphones, label: "Speaker Diarization", desc: "Auto-identify voices", accent: "text-cyan-400" },
                  ].map((feat) => (
                    <div key={feat.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 flex items-start gap-2.5 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.05] hover:scale-[1.02] cursor-pointer">
                      <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                        <feat.icon className={`h-3.5 w-3.5 ${feat.accent}`} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-foreground/85">{feat.label}</p>
                        <p className="text-[9px] text-muted-foreground leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
