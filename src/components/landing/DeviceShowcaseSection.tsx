import { motion } from "framer-motion";
import { Monitor, Smartphone, Tablet, Play } from "lucide-react";
import deviceDesktop from "@/assets/device-desktop.jpg";
import deviceTablet from "@/assets/device-tablet.jpg";
import mobileShowcase from "@/assets/mobile-showcase.jpg";
import demoVideo from "@/assets/demo-video.mp4";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function DeviceShowcaseSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-primary/5 blur-[180px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 text-primary mb-5 backdrop-blur-sm bg-primary/5">
            Multi-Platform Experience
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Available on <span className="gradient-text">Every Device</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg font-body">
            Access your meeting intelligence seamlessly across desktop, tablet, and mobile — anytime, anywhere.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Laptop Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="group rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:border-primary/25 hover:bg-white/[0.05] transition-all duration-500 hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.2)]"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Monitor className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Desktop Experience</h3>
                <p className="text-xs text-muted-foreground">Full-featured dashboard on your laptop</p>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={deviceDesktop}
                alt="WrapUp desktop dashboard showing meeting analytics and transcriptions"
                className="w-full rounded-xl object-cover aspect-[16/10]"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Video / Auto Demo Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="group rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:border-cyan-400/25 hover:bg-white/[0.05] transition-all duration-500 hover:shadow-[0_0_40px_-10px_hsl(190,80%,50%,0.2)]"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                <Play className="h-4.5 w-4.5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Live Dashboard Tour</h3>
                <p className="text-xs text-muted-foreground">See WrapUp in action — auto walkthrough</p>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-[hsl(240,15%,8%)] border border-white/[0.08]">
              <video
                src={demoVideo}
                autoPlay
                muted
                loop
                playsInline
                className="w-full rounded-xl object-cover aspect-[16/9]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none rounded-xl" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-white/80 font-medium">Auto Playing</span>
              </div>
            </div>
          </motion.div>

          {/* Tablet Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={2}
            className="group rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:border-violet-400/25 hover:bg-white/[0.05] transition-all duration-500 hover:shadow-[0_0_40px_-10px_hsl(270,60%,55%,0.2)]"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-violet-400/10 flex items-center justify-center">
                <Tablet className="h-4.5 w-4.5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Tablet Optimized</h3>
                <p className="text-xs text-muted-foreground">Read transcripts on the go</p>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={deviceTablet}
                alt="WrapUp blog page displayed on a tablet held by hands"
                className="w-full rounded-xl object-cover aspect-[16/10]"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Mobile App Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={3}
            className="group rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:border-emerald-400/25 hover:bg-white/[0.05] transition-all duration-500 hover:shadow-[0_0_40px_-10px_hsl(160,60%,50%,0.2)]"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                <Smartphone className="h-4.5 w-4.5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Mobile App</h3>
                <p className="text-xs text-muted-foreground">5 screens — from signup to AI Q&A</p>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={mobileShowcase}
                alt="WrapUp mobile app showcasing Signup, AI Summary, Live Meeting, Analytics, and AI Q&A screens"
                className="w-full rounded-xl object-cover aspect-[16/10]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none rounded-xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
