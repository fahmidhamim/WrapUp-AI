import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(count, target, { duration: 2, ease: "easeOut" });
    const unsub = rounded.on("change", setDisplay);
    return () => { ctrl.stop(); unsub(); };
  }, [inView, target, count, rounded]);

  return <span ref={ref}>{display}</span>;
}

const stats = [
  { value: 50000, suffix: "+", label: "Meetings Recorded", desc: "and counting" },
  { value: 99, suffix: ".2%", label: "Transcription Accuracy", desc: "industry-leading" },
  { value: 10, suffix: "x", label: "Faster Than Manual", desc: "note-taking speed" },
  { value: 40, suffix: "+", label: "Languages Supported", desc: "global coverage" },
];

export default function StatsSection() {
  return (
    <section className="relative pt-8 pb-20">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-primary/20 hover:bg-white/[0.04] transition-all duration-500"
            >
              <p className="text-4xl sm:text-5xl font-extrabold gradient-text mb-2">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm font-semibold text-foreground mb-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
