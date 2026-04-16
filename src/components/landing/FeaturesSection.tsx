import { Sparkles } from "lucide-react";

const stats = [
  { value: "90+", label: "Languages Supported" },
  { value: "99.2%", label: "Transcription Accuracy" },
  { value: "10x", label: "Faster Than Manual Notes" },
  { value: "50K+", label: "Meetings Processed" },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[160px] pointer-events-none" style={{ background: "hsl(250, 90%, 50%, 0.04)" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-primary/15 text-primary mb-6 tracking-wider uppercase backdrop-blur-sm bg-primary/5">
            <Sparkles className="w-3 h-3" />
            Why WrapUp
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Built for teams that
            <br />
            <span className="gradient-text">value their time.</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            From recording to insights — WrapUp handles it all.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-8 hover:border-primary/20 transition-all duration-500"
            >
              <p className="text-3xl sm:text-4xl font-bold gradient-text mb-2">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
