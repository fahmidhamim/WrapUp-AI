import { Mic, FileText, BarChart3, Brain, Users, Calendar, Upload, Zap, Sparkles, CheckCircle2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import demoAiChat from "@/assets/demo-ai-chat.jpg";
import demoAnalytics from "@/assets/demo-analytics.jpg";
import demoTranscript from "@/assets/demo-transcript.jpg";
import demoCollaboration from "@/assets/demo-collaboration.jpg";
import demoSummary from "@/assets/demo-summary.jpg";
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
      {/* Top edge highlight */}
      <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </div>
  );
}

/**
 * SubCard — shifts once on parent hover with a colored left accent border.
 * direction: which way it shifts on hover.
 * accentColor: tailwind color class for the left border.
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
          {/* AI Assistant - Large card */}
          <InteractiveBentoCard className="md:col-span-2 min-h-[340px]">
            <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10 h-full">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
                    <Brain className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Assistant</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Ask AI About Your Meetings</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Get instant answers from your meeting history. It's fast, intelligent, and context-aware.
                </p>
                <div className="flex gap-2 flex-wrap mb-4">
                  <SubCard direction="right" accentColor="border-l-[#6366f1]" hoverColor="group-hover:bg-[#6366f1]/[0.08]">
                    <span className="text-[10px] text-[#a5b4fc]">What were the key decisions?</span>
                  </SubCard>
                  <SubCard direction="down" accentColor="border-l-[#f59e0b]" hoverColor="group-hover:bg-[#f59e0b]/[0.08]">
                    <span className="text-[10px] text-[#fcd34d]">Show action items</span>
                  </SubCard>
                  <SubCard direction="left" accentColor="border-l-[#06b6d4]" hoverColor="group-hover:bg-[#06b6d4]/[0.08]">
                    <span className="text-[10px] text-[#67e8f9]">Summarize Q3 meetings</span>
                  </SubCard>
                </div>
                {/* AI response preview */}
                <SubCard direction="up" accentColor="border-l-[#a78bfa]" hoverColor="group-hover:bg-[#a78bfa]/[0.06]" className="mb-3">
                  <p className="text-[10px] text-[#c4b5fd] font-medium mb-1">✦ AI Response</p>
                  <p className="text-[10px] text-muted-foreground italic leading-relaxed">"3 key decisions were made: budget approved, timeline set for Q2, and 2 new hires greenlit."</p>
                </SubCard>

                <div className="flex items-center gap-3 mb-4">
                  {[
                    { label: "Context-aware", color: "text-[#6ee7b7]", dot: "bg-[#10b981]" },
                    { label: "Multi-meeting", color: "text-[#93c5fd]", dot: "bg-[#3b82f6]" },
                    { label: "Instant", color: "text-[#fcd34d]", dot: "bg-[#f59e0b]" },
                  ].map((tag) => (
                    <span key={tag.label} className="inline-flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${tag.dot}`} />
                      <span className={`text-[9px] ${tag.color}`}>{tag.label}</span>
                    </span>
                  ))}
                </div>

                <SubCard direction="down" accentColor="border-l-[#06b6d4]" hoverColor="group-hover:bg-[#06b6d4]/[0.06]" className="mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-[#22d3ee] flex-shrink-0" />
                    <span className="text-[10px] text-muted-foreground">Works across <span className="text-foreground/70 font-medium">all your meetings</span> — no setup needed</span>
                  </div>
                </SubCard>

                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary cursor-pointer hover:underline">
                  <Sparkles className="w-3 h-3" /> Try it now
                </span>
              </div>
              <div className="w-full sm:w-56 flex-shrink-0 space-y-3">
                <div className="rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-primary/5 group-hover:shadow-primary/15 transition-shadow duration-500">
                  <img src={demoAiChat} alt="AI Chat" className="w-full h-auto opacity-85 group-hover:opacity-100 transition-all duration-500 group-hover:scale-[1.02]" draggable={false} />
                </div>
                <div className="rounded-xl overflow-hidden border border-white/[0.08] shadow-lg shadow-primary/5 group-hover:shadow-primary/15 transition-shadow duration-500">
                  <img src={demoSummary} alt="AI Summary" className="w-full h-auto opacity-85 group-hover:opacity-100 transition-all duration-500 group-hover:scale-[1.02]" draggable={false} />
                </div>
              </div>
            </div>
          </InteractiveBentoCard>

          {/* Analytics */}
          <InteractiveBentoCard>
            <div className="relative z-10">
              <div className="w-full rounded-xl overflow-hidden border border-white/[0.08] mb-4 shadow-lg shadow-primary/5 group-hover:shadow-primary/15 transition-shadow duration-500">
                <img src={demoAnalytics} alt="Dashboard" className="w-full h-auto opacity-85 group-hover:opacity-100 transition-all duration-500 group-hover:scale-[1.03]" draggable={false} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Meeting Analytics</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">Analyze engagement and meeting effectiveness.</p>
              <div className="flex gap-3">
                <SubCard direction="left" accentColor="border-l-[#3b82f6]" hoverColor="group-hover:bg-[#3b82f6]/[0.08]" className="flex-1 text-center">
                  <TrendingUp className="h-3 w-3 text-[#60a5fa] mx-auto mb-1" />
                  <p className="text-xs font-bold text-foreground">248</p>
                  <p className="text-[9px] text-muted-foreground">Meetings</p>
                </SubCard>
                <SubCard direction="right" accentColor="border-l-[#f97316]" hoverColor="group-hover:bg-[#f97316]/[0.08]" className="flex-1 text-center">
                  <Zap className="h-3 w-3 text-[#fb923c] mx-auto mb-1" />
                  <p className="text-xs font-bold text-foreground">52h</p>
                  <p className="text-[9px] text-muted-foreground">Hours Saved</p>
                </SubCard>
              </div>
            </div>
          </InteractiveBentoCard>

          {/* Smart Transcription */}
          <InteractiveBentoCard>
            <div className="relative z-10">
              <div className="w-full rounded-xl overflow-hidden border border-white/[0.08] mb-4 shadow-lg group-hover:shadow-primary/10 transition-shadow duration-500">
                <img src={demoTranscript} alt="Transcription" className="w-full h-auto opacity-85 group-hover:opacity-100 transition-all duration-500 group-hover:scale-[1.03]" draggable={false} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Mic className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Smart Transcription</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">Automatic transcription in 90+ languages.</p>
              <div className="flex gap-1.5 flex-wrap">
                {["English", "Bangla", "Spanish", "French", "日本語", "+86"].map((lang, i) => {
                  const colors = [
                    { accent: "border-l-[#10b981]", hover: "group-hover:bg-[#10b981]/[0.08]", text: "text-[#6ee7b7]" },
                    { accent: "border-l-[#f59e0b]", hover: "group-hover:bg-[#f59e0b]/[0.08]", text: "text-[#fcd34d]" },
                    { accent: "border-l-[#f43f5e]", hover: "group-hover:bg-[#f43f5e]/[0.08]", text: "text-[#fda4af]" },
                    { accent: "border-l-[#8b5cf6]", hover: "group-hover:bg-[#8b5cf6]/[0.08]", text: "text-[#c4b5fd]" },
                    { accent: "border-l-[#ef4444]", hover: "group-hover:bg-[#ef4444]/[0.08]", text: "text-[#fca5a5]" },
                    { accent: "border-l-[#06b6d4]", hover: "group-hover:bg-[#06b6d4]/[0.08]", text: "text-[#67e8f9]" },
                  ];
                  const c = colors[i];
                  return (
                    <SubCard key={lang} direction={i % 2 === 0 ? "up" : "down"} accentColor={c.accent} hoverColor={c.hover} className="!p-1.5">
                      <span className={`text-[9px] ${c.text}`}>{lang}</span>
                    </SubCard>
                  );
                })}
              </div>
            </div>
          </InteractiveBentoCard>

          {/* AI Summaries */}
          <InteractiveBentoCard>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">AI Summaries</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Key takeaways, action items, and follow-ups — generated instantly after every meeting.
              </p>
              <SubCard direction="right" accentColor="border-l-[#a78bfa]" hoverColor="group-hover:bg-[#a78bfa]/[0.08]" className="mb-3">
                <p className="text-[10px] text-[#c4b5fd] font-medium mb-1">✦ Summary</p>
                <p className="text-[11px] text-muted-foreground italic leading-relaxed">"3 actions identified. Budget approved. Next review Q2."</p>
              </SubCard>
              <div className="space-y-1.5">
                {["Budget approved for Q3", "Hire 2 engineers", "Ship v2 by Friday"].map((item, i) => {
                  const actionColors = [
                    { accent: "border-l-[#34d399]", hover: "group-hover:bg-[#34d399]/[0.08]" },
                    { accent: "border-l-[#fbbf24]", hover: "group-hover:bg-[#fbbf24]/[0.08]" },
                    { accent: "border-l-[#f472b6]", hover: "group-hover:bg-[#f472b6]/[0.08]" },
                  ];
                  const c = actionColors[i];
                  return (
                    <SubCard key={i} direction={i % 2 === 0 ? "right" : "left"} accentColor={c.accent} hoverColor={c.hover}>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-[#34d399] flex-shrink-0" />
                        <span className="text-[10px] text-foreground/60">{item}</span>
                      </div>
                    </SubCard>
                  );
                })}
              </div>
            </div>
          </InteractiveBentoCard>

          {/* Team Collaboration */}
          <InteractiveBentoCard>
            <div className="relative z-10">
              <div className="w-full rounded-xl overflow-hidden border border-white/[0.08] mb-4 shadow-lg group-hover:shadow-primary/10 transition-shadow duration-500">
                <img src={demoCollaboration} alt="Collaboration" className="w-full h-auto opacity-85 group-hover:opacity-100 transition-all duration-500 group-hover:scale-[1.03]" draggable={false} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Team Collaboration</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">Share and collaborate on meeting insights.</p>
              <SubCard direction="right" accentColor="border-l-[#14b8a6]" hoverColor="group-hover:bg-[#14b8a6]/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[avatar1, avatar2, avatar3, avatar4].map((src, i) => (
                      <img key={i} src={src} alt={`Team member ${i + 1}`} className="w-6 h-6 rounded-full border-2 border-background object-cover" />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">+12 team members</span>
                </div>
              </SubCard>
            </div>
          </InteractiveBentoCard>

          {/* Upload Recordings */}
          <InteractiveBentoCard>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-1">Upload Recordings</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">Upload audio or video files for instant processing.</p>
              <SubCard direction="down" accentColor="border-l-[#ec4899]" hoverColor="group-hover:bg-[#ec4899]/[0.08]">
                <div className="text-center py-1">
                  <Upload className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-[9px] text-muted-foreground">Drop files here</p>
                </div>
              </SubCard>
            </div>
          </InteractiveBentoCard>

          {/* Calendar Sync */}
          <InteractiveBentoCard>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-1">Calendar Sync</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">Auto-capture meetings from your calendar.</p>
              <div className="space-y-1.5">
                <SubCard direction="right" accentColor="border-l-[#3b82f6]" hoverColor="group-hover:bg-[#3b82f6]/[0.08]">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                    <span className="text-[9px] text-foreground/60">9:00 AM — Sprint Planning</span>
                  </div>
                </SubCard>
                <SubCard direction="left" accentColor="border-l-[#f59e0b]" hoverColor="group-hover:bg-[#f59e0b]/[0.08]">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                    <span className="text-[9px] text-foreground/60">2:00 PM — Design Review</span>
                  </div>
                </SubCard>
              </div>
            </div>
          </InteractiveBentoCard>

          {/* Real-Time Processing */}
          <InteractiveBentoCard>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-1">Real-Time Processing</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">Live transcription with zero-lag analysis.</p>
              <SubCard direction="up" accentColor="border-l-[#22c55e]" hoverColor="group-hover:bg-[#22c55e]/[0.1]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                  <span className="text-[10px] text-[#4ade80] font-medium">Live</span>
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#22c55e]/50 to-[#22c55e]/30 animate-pulse" />
                  </div>
                </div>
              </SubCard>
            </div>
          </InteractiveBentoCard>
        </div>
      </div>
    </section>
  );
}
