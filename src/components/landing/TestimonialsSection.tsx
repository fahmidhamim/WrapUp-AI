import { motion } from "framer-motion";

const testimonials = [
  { name: "Sarah J.", role: "Product Manager", quote: "WrapUp cut my meeting follow-up time by 80%. It's magic." },
  { name: "Michael B.", role: "Engineering Lead", quote: "The AI summaries are incredibly accurate. Our team relies on them daily." },
  { name: "Lisa K.", role: "Startup CEO", quote: "Finally, I can focus on the conversation instead of taking notes." },
  { name: "Thomas C.", role: "Sales Director", quote: "The action items feature alone makes this worth it. Nothing slips through." },
  { name: "Amanda P.", role: "Consultant", quote: "I handle 10+ client calls a day. WrapUp saved my sanity." },
  { name: "Robert L.", role: "HR Manager", quote: "Interview transcriptions are so detailed. Highly recommend." },
  { name: "Jennifer W.", role: "Marketing VP", quote: "Honestly? I was skeptical at first. Now I can't imagine work without it." },
  { name: "David M.", role: "CTO", quote: "The real-time processing is impressive. Zero lag." },
  { name: "Elena R.", role: "Operations Head", quote: "Finally, a tool that respects data privacy and delivers results." },
  { name: "James T.", role: "Team Lead", quote: "My team's meeting efficiency improved by 3x in the first month." },
];

const row1 = testimonials.slice(0, 5);
const row2 = testimonials.slice(5, 10);

function MarqueeRow({ items, reverse = false }: { items: typeof testimonials; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        className="flex gap-5 flex-nowrap"
        animate={{ x: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((t, i) => (
          <div
            key={`${t.name}-${i}`}
            className="glass-card rounded-2xl p-6 min-w-[320px] max-w-[320px] flex-shrink-0"
          >
            <p className="text-sm text-muted-foreground font-body italic mb-4 leading-relaxed">"{t.quote}"</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-primary-foreground">
                {t.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground font-body">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 mb-14">
        <div className="text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 text-primary mb-6 tracking-wider uppercase">
            🚀 Join the Revolution
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            Trusted by <span className="gradient-text">10,000+</span> professionals
          </h2>
          <p className="text-muted-foreground text-lg font-body">
            From startups to enterprises, teams are reclaiming their time with WrapUp.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <MarqueeRow items={row1} />
        <MarqueeRow items={row2} reverse />
      </div>
    </section>
  );
}
