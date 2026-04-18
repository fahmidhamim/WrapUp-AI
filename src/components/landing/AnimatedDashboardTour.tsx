import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ListTodo,
  TrendingUp,
  Video,
  BarChart3,
  Sparkles,
  MousePointer2,
  LayoutDashboard,
  FileText,
  Brain,
  Upload,
  Settings,
} from "lucide-react";

/**
 * A looping, in-browser "dashboard tour" that mimics the real user dashboard.
 * Used in place of a real screen-recording so users see a living, animated preview
 * instead of an unrelated video.
 */

const SCENE_DURATION_MS = 5200;

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Home", active: 0 },
  { icon: Video, label: "Meetings", active: -1 },
  { icon: BarChart3, label: "Analytics", active: 1 },
  { icon: Brain, label: "AI Q&A", active: 2 },
  { icon: Upload, label: "Upload", active: -1 },
  { icon: FileText, label: "Transcripts", active: -1 },
  { icon: Settings, label: "Settings", active: -1 },
];

const STATS = [
  { label: "This Week", value: "12", sub: "Meetings Analyzed", Icon: Calendar, tint: "text-primary", bg: "bg-primary/15" },
  { label: "Action Items", value: "8", sub: "Pending Tasks", Icon: ListTodo, tint: "text-amber-400", bg: "bg-amber-400/15" },
  { label: "Engagement", value: "92%", sub: "↗ +18% from last week", Icon: TrendingUp, tint: "text-emerald-400", bg: "bg-emerald-400/15" },
];

const RECENT_MEETINGS = [
  { title: "Q4 Roadmap Review", dur: "42 min", when: "Today" },
  { title: "Design Sync — Mobile App", dur: "28 min", when: "Yesterday" },
  { title: "Weekly Standup", dur: "15 min", when: "2d ago" },
];

const CHART_DATA = [
  { day: "Mon", v: 45 },
  { day: "Tue", v: 72 },
  { day: "Wed", v: 58 },
  { day: "Thu", v: 88 },
  { day: "Fri", v: 95 },
  { day: "Sat", v: 32 },
  { day: "Sun", v: 20 },
];

const AI_QUESTION = "What were the key decisions this week?";
const AI_ANSWER =
  "3 major decisions: mobile launch prioritized for Q4, beta scheduled for next week, and design specs due Friday.";

function useScene() {
  const [scene, setScene] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setScene((s) => (s + 1) % 3), SCENE_DURATION_MS);
    return () => clearInterval(id);
  }, []);
  return scene;
}

function useTypewriter(text: string, active: boolean, speed = 22) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!active) {
      setShown(0);
      return;
    }
    setShown(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, active, speed]);
  return shown;
}

function Cursor({ x, y }: { x: string; y: string }) {
  return (
    <motion.div
      className="absolute z-20 pointer-events-none"
      animate={{ left: x, top: y }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      style={{ left: x, top: y }}
    >
      <MousePointer2 className="w-4 h-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] -translate-x-1 -translate-y-1" fill="white" />
    </motion.div>
  );
}

function SceneHome() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] text-white/50 font-medium">Dashboard</p>
          <p className="text-sm font-bold text-white">Good morning, Sarah</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/25">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[9px] font-semibold text-primary uppercase tracking-wider">Pro</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-lg p-2.5 bg-white/[0.04] border border-white/[0.06]"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-white/50 font-medium">{s.label}</span>
              <div className={`w-5 h-5 rounded-full ${s.bg} flex items-center justify-center`}>
                <s.Icon className={`w-2.5 h-2.5 ${s.tint}`} />
              </div>
            </div>
            <p className="text-lg font-bold text-white leading-tight">{s.value}</p>
            <p className="text-[8px] text-white/40 leading-tight">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="rounded-lg bg-white/[0.03] border border-white/[0.06] overflow-hidden"
      >
        <div className="px-2.5 py-2 border-b border-white/[0.06] flex items-center justify-between">
          <span className="text-[10px] font-bold text-white">Recent Meetings</span>
          <span className="text-[9px] text-primary">View all</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {RECENT_MEETINGS.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.12, duration: 0.4 }}
              className="px-2.5 py-2 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center shrink-0">
                  <Video className="w-2.5 h-2.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-white truncate">{m.title}</p>
                  <p className="text-[8px] text-white/40">{m.dur}</p>
                </div>
              </div>
              <span className="text-[9px] text-white/40 shrink-0">{m.when}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SceneAnalytics() {
  const maxV = Math.max(...CHART_DATA.map((d) => d.v));
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      <div>
        <p className="text-[11px] text-white/50 font-medium">Analytics</p>
        <p className="text-sm font-bold text-white">Weekly Activity</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="rounded-lg p-2.5 bg-white/[0.04] border border-white/[0.06]"
        >
          <p className="text-[9px] text-white/50 font-medium mb-1">Total Meetings</p>
          <p className="text-xl font-bold text-white leading-tight">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              248
            </motion.span>
          </p>
          <p className="text-[9px] text-emerald-400">↗ +12% this month</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="rounded-lg p-2.5 bg-white/[0.04] border border-white/[0.06]"
        >
          <p className="text-[9px] text-white/50 font-medium mb-1">Hours Saved</p>
          <p className="text-xl font-bold text-white leading-tight">52h</p>
          <p className="text-[9px] text-amber-400">↗ +8h this week</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="rounded-lg p-3 bg-white/[0.03] border border-white/[0.06]"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-bold text-white">Meetings / day</span>
          <span className="text-[9px] text-white/40">Last 7 days</span>
        </div>
        <div className="flex items-end gap-1.5 h-20">
          {CHART_DATA.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.v / maxV) * 100}%` }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="w-full rounded-t-sm bg-gradient-to-t from-primary/40 to-primary shadow-[0_0_12px_-2px_hsl(var(--primary)/0.6)]"
              />
              <span className="text-[8px] text-white/40">{d.day}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SceneAI({ active }: { active: boolean }) {
  const qShown = useTypewriter(AI_QUESTION, active, 30);
  const aShown = useTypewriter(AI_ANSWER, active && qShown === AI_QUESTION.length, 16);
  const showAnswer = qShown === AI_QUESTION.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3 flex flex-col h-full"
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-primary-foreground" />
        </div>
        <div>
          <p className="text-[11px] text-white/50 font-medium leading-none">AI Assistant</p>
          <p className="text-sm font-bold text-white">Ask your meetings</p>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="rounded-xl rounded-tr-sm px-3 py-2 bg-primary/15 border border-primary/25 max-w-[85%]">
          <p className="text-[10px] text-white/90 leading-snug">
            {AI_QUESTION.slice(0, qShown)}
            {qShown < AI_QUESTION.length && (
              <span className="inline-block w-[1px] h-2.5 bg-primary ml-0.5 align-middle animate-pulse" />
            )}
          </p>
        </div>
      </div>

      {showAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-start"
        >
          <div className="rounded-xl rounded-tl-sm px-3 py-2 bg-white/[0.05] border border-white/[0.08] max-w-[90%]">
            <p className="text-[9px] uppercase tracking-wider text-primary font-semibold mb-1 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              AI Response
            </p>
            <p className="text-[10px] text-white/90 leading-relaxed">
              {AI_ANSWER.slice(0, aShown)}
              {aShown < AI_ANSWER.length && (
                <span className="inline-block w-[1px] h-2.5 bg-primary ml-0.5 align-middle animate-pulse" />
              )}
            </p>
          </div>
        </motion.div>
      )}

      {showAnswer && aShown === AI_ANSWER.length && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-wrap gap-1 ml-1"
        >
          {["Mobile Launch", "Beta", "Design Specs"].map((t) => (
            <span
              key={t}
              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-medium border border-primary/20 text-primary bg-primary/5"
            >
              {t}
            </span>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AnimatedDashboardTour() {
  const scene = useScene();

  const cursorPos = useMemo(() => {
    if (scene === 0) return { x: "62%", y: "38%" };
    if (scene === 1) return { x: "48%", y: "76%" };
    return { x: "78%", y: "58%" };
  }, [scene]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-[hsl(240,15%,8%)] border border-white/[0.08] aspect-[16/9]">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/70" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
          <div className="w-2 h-2 rounded-full bg-green-500/70" />
        </div>
        <div className="mx-auto px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.05]">
          <span className="text-[8px] text-white/50 font-medium tracking-wide">app.wrapup.ai/dashboard</span>
        </div>
        <div className="w-10" />
      </div>

      {/* App body */}
      <div className="flex h-[calc(100%-26px)]">
        {/* Sidebar */}
        <div className="w-[22%] border-r border-white/[0.06] bg-white/[0.015] p-1.5 space-y-0.5 flex flex-col">
          <div className="flex items-center gap-1.5 px-1.5 py-1.5 mb-1">
            <div className="w-4 h-4 rounded-md gradient-bg flex items-center justify-center shrink-0">
              <Sparkles className="w-2 h-2 text-primary-foreground" />
            </div>
            <span className="text-[9px] font-bold text-white tracking-tight">WrapUp</span>
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = item.active === scene;
            return (
              <motion.div
                key={item.label}
                animate={{
                  backgroundColor: isActive ? "hsl(var(--primary) / 0.15)" : "rgba(255,255,255,0)",
                }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md ${
                  isActive ? "border border-primary/25" : "border border-transparent"
                }`}
              >
                <item.icon className={`w-2.5 h-2.5 ${isActive ? "text-primary" : "text-white/40"}`} />
                <span className={`text-[9px] font-medium ${isActive ? "text-white" : "text-white/50"}`}>
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 p-3 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {scene === 0 && <div key="home"><SceneHome /></div>}
            {scene === 1 && <div key="analytics"><SceneAnalytics /></div>}
            {scene === 2 && <div key="ai"><SceneAI active={scene === 2} /></div>}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating cursor */}
      <Cursor x={cursorPos.x} y={cursorPos.y} />

      {/* Scene progress dots */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === scene ? "w-6 bg-primary" : "w-1 bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
