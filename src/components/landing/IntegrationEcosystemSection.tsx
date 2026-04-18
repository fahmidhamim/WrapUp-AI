import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Plug, Zap } from "lucide-react";

type Logo = {
  name: string;
  initial: string;
  color: string;
  category: string;
};

const ORBIT_LOGOS: Logo[] = [
  { name: "Slack", initial: "S", color: "#E01E5A", category: "Chat" },
  { name: "Zoom", initial: "Z", color: "#2D8CFF", category: "Video" },
  { name: "Teams", initial: "T", color: "#4B53BC", category: "Video" },
  { name: "Meet", initial: "M", color: "#00897B", category: "Video" },
  { name: "Notion", initial: "N", color: "#ffffff", category: "Docs" },
  { name: "Asana", initial: "A", color: "#F06A6A", category: "Tasks" },
  { name: "Jira", initial: "J", color: "#2684FF", category: "Tasks" },
  { name: "Linear", initial: "L", color: "#5E6AD2", category: "Tasks" },
  { name: "Calendar", initial: "C", color: "#4285F4", category: "Calendar" },
  { name: "Gmail", initial: "G", color: "#EA4335", category: "Email" },
];

const EXTRA_LOGOS: Logo[] = [
  { name: "GitHub", initial: "GH", color: "#ffffff", category: "Dev" },
  { name: "GitLab", initial: "GL", color: "#FC6D26", category: "Dev" },
  { name: "HubSpot", initial: "H", color: "#FF7A59", category: "CRM" },
  { name: "Salesforce", initial: "SF", color: "#00A1E0", category: "CRM" },
  { name: "Trello", initial: "TR", color: "#0079BF", category: "Tasks" },
  { name: "Drive", initial: "D", color: "#FBBC04", category: "Storage" },
  { name: "Dropbox", initial: "DB", color: "#0061FF", category: "Storage" },
  { name: "Outlook", initial: "O", color: "#0078D4", category: "Email" },
  { name: "Zapier", initial: "Z", color: "#FF4A00", category: "Automation" },
  { name: "Webhook", initial: "W", color: "#6366F1", category: "API" },
  { name: "Intercom", initial: "I", color: "#0057FF", category: "Support" },
  { name: "Figma", initial: "F", color: "#F24E1E", category: "Design" },
];

const RADIUS_PERCENT = 42;

function LogoTile({ logo, size = "md" }: { logo: Logo; size?: "sm" | "md" }) {
  const dimension = size === "sm" ? "w-10 h-10" : "w-14 h-14";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const isLight = logo.color === "#ffffff";
  return (
    <div className="group flex flex-col items-center gap-1.5">
      <div
        className={`${dimension} rounded-2xl flex items-center justify-center font-bold ${textSize} transition-all duration-300 group-hover:scale-110 relative backdrop-blur-md border`}
        style={{
          background: isLight ? "rgba(255,255,255,0.08)" : `${logo.color}22`,
          borderColor: isLight ? "rgba(255,255,255,0.15)" : `${logo.color}55`,
          color: isLight ? "#fff" : logo.color,
          boxShadow: `0 8px 24px -8px ${isLight ? "rgba(255,255,255,0.2)" : logo.color + "66"}`,
        }}
      >
        {logo.initial}
        <span
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${isLight ? "rgba(255,255,255,0.18)" : logo.color + "33"}, transparent 70%)`,
          }}
        />
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity duration-300">
        {logo.name}
      </span>
    </div>
  );
}

export default function IntegrationEcosystemSection() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let raf: number;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setRotation((r) => (r + dt * 6) % 360);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative py-28 overflow-hidden">
      <style>{`
        @keyframes wu-orbit-pulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.08); opacity: 0.45; }
        }
        @keyframes wu-radial-pulse {
          0% { transform: scale(0.6); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[180px]" style={{ background: "hsl(260, 90%, 55%, 0.07)" }} />
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
            <Plug className="w-3 h-3" />
            Integration Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Connects with <span className="gradient-text">everything</span>
            <br className="hidden sm:block" /> you already use.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg font-body">
            Native integrations with 30+ tools — from meeting platforms to task managers. WrapUp slots into your stack in minutes, not weeks.
          </p>
        </motion.div>

        {/* Orbit */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto"
          style={{ width: "min(90vw, 560px)", aspectRatio: "1 / 1" }}
        >
          {/* Orbit rings (decorative) */}
          <div className="absolute inset-[6%] rounded-full border border-white/[0.06]" />
          <div className="absolute inset-[20%] rounded-full border border-white/[0.04]" />
          <div className="absolute inset-[34%] rounded-full border border-primary/10" />

          {/* Pulsing radial rings from center */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full border border-primary/30 pointer-events-none"
              style={{
                animation: `wu-radial-pulse 3.5s ease-out ${i * 1.16}s infinite`,
              }}
            />
          ))}

          {/* Central WrapUp orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[24%] aspect-square rounded-full bg-gradient-to-br from-primary via-violet-500 to-cyan-500 flex items-center justify-center shadow-[0_0_80px_-10px_hsl(var(--primary)/0.7)]">
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-primary/90 to-violet-600/90 flex items-center justify-center backdrop-blur-xl">
              <Sparkles className="w-[40%] h-[40%] text-white" />
            </div>
            <span
              className="absolute inset-0 rounded-full border border-white/30"
              style={{ animation: "wu-orbit-pulse 2.5s ease-in-out infinite" }}
            />
          </div>

          {/* Connection lines + orbiting logos */}
          {ORBIT_LOGOS.map((logo, i) => {
            const baseAngle = (i / ORBIT_LOGOS.length) * 360;
            const angle = (baseAngle + rotation) * (Math.PI / 180);
            const x = 50 + Math.cos(angle) * RADIUS_PERCENT;
            const y = 50 + Math.sin(angle) * RADIUS_PERCENT;
            const isLight = logo.color === "#ffffff";
            return (
              <div key={logo.name}>
                {/* Connection line from center */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <line
                    x1="50"
                    y1="50"
                    x2={x}
                    y2={y}
                    stroke={isLight ? "rgba(255,255,255,0.08)" : logo.color + "33"}
                    strokeWidth="0.15"
                  />
                </svg>

                {/* Logo tile */}
                <motion.div
                  className="absolute"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  whileHover={{ scale: 1.15, zIndex: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-bold text-sm backdrop-blur-md border shadow-lg"
                    style={{
                      background: isLight ? "rgba(255,255,255,0.08)" : `${logo.color}22`,
                      borderColor: isLight ? "rgba(255,255,255,0.18)" : `${logo.color}66`,
                      color: isLight ? "#fff" : logo.color,
                      boxShadow: `0 10px 30px -8px ${isLight ? "rgba(255,255,255,0.2)" : logo.color + "77"}`,
                    }}
                    title={logo.name}
                  >
                    {logo.initial}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Extra integrations grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto mt-20"
        >
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Plus 20+ more</p>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Need something custom? <span className="text-foreground font-semibold">Use our REST API & webhooks.</span>
              </p>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-4 sm:gap-5">
              {EXTRA_LOGOS.map((logo) => (
                <LogoTile key={logo.name} logo={logo} size="sm" />
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="tabular-nums text-foreground font-semibold">32</span> integrations
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="tabular-nums text-foreground font-semibold">2-click</span> setup
                </span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="tabular-nums text-foreground font-semibold">SOC 2</span> compliant
                </span>
              </div>
              <a
                href="#"
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors duration-200 flex items-center gap-1"
              >
                Browse all integrations →
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
