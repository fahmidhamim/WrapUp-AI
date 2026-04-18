import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Calculator, Calendar, Clock, DollarSign, Users, Video } from "lucide-react";
import { Slider } from "@/components/ui/slider";

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());
  const [display, setDisplay] = useState(() => Math.round(value).toLocaleString());

  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
    const unsub = rounded.on("change", setDisplay);
    return () => {
      ctrl.stop();
      unsub();
    };
  }, [value, mv, rounded]);

  return <span className="tabular-nums">{display}</span>;
}

const MINUTES_SAVED_PER_MEETING = 30;
const WEEKS_PER_MONTH = 4.33;
const WORK_HOURS_PER_DAY = 8;
const HOURLY_PRODUCTIVITY_VALUE = 50;

export default function TimeSavingsCalculator() {
  const [meetings, setMeetings] = useState(10);
  const [teamSize, setTeamSize] = useState(5);

  const minutesPerWeek = meetings * MINUTES_SAVED_PER_MEETING * teamSize;
  const hoursPerMonth = (minutesPerWeek * WEEKS_PER_MONTH) / 60;
  const daysPerYear = (hoursPerMonth * 12) / WORK_HOURS_PER_DAY;
  const dollarsPerYear = hoursPerMonth * 12 * HOURLY_PRODUCTIVITY_VALUE;

  return (
    <section id="savings" className="py-28 relative">
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none" style={{ background: "hsl(250, 90%, 50%, 0.05)" }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: "hsl(190, 90%, 50%, 0.04)" }} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-primary/15 text-primary mb-6 tracking-wider uppercase backdrop-blur-sm bg-primary/5">
            <Calculator className="w-3 h-3" />
            Time Savings Calculator
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            See how much time
            <br />
            <span className="gradient-text">you&apos;ll save.</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Adjust the sliders to see your team&apos;s savings in hours, days, and dollars.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card rounded-2xl p-8 space-y-8"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Video className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Meetings per week</span>
                </div>
                <span className="text-3xl font-extrabold gradient-text tabular-nums">{meetings}</span>
              </div>
              <Slider
                value={[meetings]}
                min={1}
                max={30}
                step={1}
                onValueChange={(v) => setMeetings(v[0])}
              />
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                <span>1</span>
                <span>30+</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Team size</span>
                </div>
                <span className="text-3xl font-extrabold gradient-text tabular-nums">{teamSize}</span>
              </div>
              <Slider
                value={[teamSize]}
                min={1}
                max={100}
                step={1}
                onValueChange={(v) => setTeamSize(v[0])}
              />
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                <span>1</span>
                <span>100+</span>
              </div>
            </div>

            <div className="pt-5 border-t border-white/[0.06]">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Based on <span className="text-foreground font-semibold">~30 minutes saved per meeting</span> from automated transcription, AI summaries, and action-item extraction.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl p-8 overflow-hidden border border-primary/25 bg-gradient-to-br from-primary/[0.12] via-white/[0.02] to-transparent shadow-[0_0_60px_-20px_hsl(var(--primary)/0.35)]"
          >
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/15 blur-[100px] pointer-events-none" />
            <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Your team saves</p>
              </div>

              <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                <span className="text-6xl sm:text-7xl font-extrabold gradient-text leading-none">
                  <AnimatedNumber value={hoursPerMonth} />
                </span>
                <span className="text-2xl font-semibold text-foreground">hours</span>
              </div>
              <p className="text-sm text-muted-foreground mb-8">every single month</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Per year</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    <AnimatedNumber value={daysPerYear} />
                    <span className="text-sm text-muted-foreground font-medium ml-1">days</span>
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Productivity</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    $<AnimatedNumber value={dollarsPerYear} />
                    <span className="text-sm text-muted-foreground font-medium ml-1">/ yr</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/[0.06]">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Productivity value estimated at <span className="text-foreground font-semibold">$50/hour</span>. Days assume an 8-hour workday.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
