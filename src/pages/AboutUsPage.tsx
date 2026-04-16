import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Target, Eye, Heart, Users, Globe, Award, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import LandingNavbar from "@/components/landing/LandingNavbar";
import StarfieldBackground from "@/components/landing/StarfieldBackground";
import Footer from "@/components/landing/Footer";

import avatar1 from "@/assets/avatars/avatar-1.jpg";
import avatar2 from "@/assets/avatars/avatar-2.jpg";
import avatar3 from "@/assets/avatars/avatar-3.jpg";
import avatar4 from "@/assets/avatars/avatar-4.jpg";

const values = [
  { icon: Zap, title: "Innovation First", desc: "We push the boundaries of AI to deliver meeting intelligence that feels magical." },
  { icon: Shield, title: "Privacy by Design", desc: "Your data security is not an afterthought — it's built into everything we do." },
  { icon: Heart, title: "User-Centric", desc: "Every feature is designed to save you time and make meetings more productive." },
  { icon: Globe, title: "Global Accessibility", desc: "90+ languages supported, making WrapUp accessible to teams worldwide." },
];

const stats = [
  { value: "10M+", label: "Meetings Processed" },
  { value: "500K+", label: "Active Users" },
  { value: "90+", label: "Languages Supported" },
  { value: "99.2%", label: "Transcription Accuracy" },
];

const team = [
  { name: "Alex Chen", role: "CEO & Co-Founder", avatar: avatar1 },
  { name: "Sarah Williams", role: "CTO & Co-Founder", avatar: avatar2 },
  { name: "Michael Park", role: "Head of AI", avatar: avatar3 },
  { name: "Emily Zhang", role: "Head of Design", avatar: avatar4 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function AboutUsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="dark cinema-gradient text-foreground min-h-screen overflow-x-hidden relative">
      <StarfieldBackground />
      <LandingNavbar />

      <section className="relative pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </motion.div>

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 text-primary mb-6 backdrop-blur-sm bg-primary/5">
              Our Story & Mission
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              About <span className="gradient-text">WrapUp</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
              We started WrapUp because we believed no one should spend more time writing meeting notes than actually making decisions. Our AI-powered platform helps teams focus on what matters — the conversation.
            </p>
          </motion.div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-6 mb-20">
            {[
              { icon: Target, title: "Our Mission", text: "To eliminate the busywork of meetings so teams can focus on collaboration, creativity, and outcomes. We're building the future where every meeting is instantly actionable." },
              { icon: Eye, title: "Our Vision", text: "A world where no valuable insight is ever lost in a meeting. Where AI handles the documentation so humans can focus on the thinking that matters." },
            ].map((item, i) => (
              <motion.div key={item.title} initial="hidden" animate="visible" variants={fadeUp} custom={i} className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-8 hover:border-primary/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-6 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold gradient-text mb-1">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Values */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
              Our <span className="gradient-text">Values</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <motion.div key={v.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-6 hover:border-primary/20 transition-all duration-300 text-center">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <v.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-2">{v.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
              Meet the <span className="gradient-text">Team</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <motion.div key={member.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-6 hover:border-primary/20 transition-all duration-300 text-center group">
                  <img src={member.avatar} alt={member.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-border/30 group-hover:border-primary/40 transition-colors" />
                  <h3 className="text-sm font-bold text-foreground">{member.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
