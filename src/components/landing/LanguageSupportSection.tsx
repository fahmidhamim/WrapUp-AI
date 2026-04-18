import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Languages, CheckCircle2 } from "lucide-react";
import { WORLD_MAP_D } from "./worldMapPath";

type LangPoint = {
  name: string;
  code: string;
  flag: string;
  accuracy: number;
  // percent coords on the 1000x500 map viewBox
  x: number;
  y: number;
  phrase: string;
};

// Pin positions are in the 1000x500 equirectangular viewBox:
//   x = 500 + lon * (1000/360),  y = 250 - lat * (1000/360)
const LANGUAGES: LangPoint[] = [
  { name: "English",    code: "EN", flag: "🇬🇧", accuracy: 99.3, x: 500, y: 107, phrase: "Let's ship the roadmap." },
  { name: "Spanish",    code: "ES", flag: "🇪🇸", accuracy: 98.7, x: 490, y: 138, phrase: "Vamos a lanzar la hoja de ruta." },
  { name: "French",     code: "FR", flag: "🇫🇷", accuracy: 98.9, x: 506, y: 114, phrase: "Livrons la feuille de route." },
  { name: "German",     code: "DE", flag: "🇩🇪", accuracy: 99.1, x: 537, y: 104, phrase: "Lass uns die Roadmap liefern." },
  { name: "Portuguese", code: "PT", flag: "🇧🇷", accuracy: 98.4, x: 367, y: 294, phrase: "Vamos entregar o roadmap." },
  { name: "Japanese",   code: "JA", flag: "🇯🇵", accuracy: 97.8, x: 888, y: 151, phrase: "ロードマップを出荷しましょう。" },
  { name: "Korean",     code: "KO", flag: "🇰🇷", accuracy: 97.2, x: 853, y: 146, phrase: "로드맵을 출시합시다." },
  { name: "Mandarin",   code: "ZH", flag: "🇨🇳", accuracy: 97.5, x: 823, y: 139, phrase: "我们来发布路线图。" },
  { name: "Hindi",      code: "HI", flag: "🇮🇳", accuracy: 96.9, x: 714, y: 171, phrase: "रोडमैप लॉन्च करते हैं।" },
  { name: "Arabic",     code: "AR", flag: "🇸🇦", accuracy: 96.4, x: 630, y: 181, phrase: "لنطلق خارطة الطريق." },
  { name: "Russian",    code: "RU", flag: "🇷🇺", accuracy: 98.0, x: 604, y: 95,  phrase: "Давайте выпустим дорожную карту." },
  { name: "Dutch",      code: "NL", flag: "🇳🇱", accuracy: 98.6, x: 514, y: 104, phrase: "Laten we de roadmap lanceren." },
];

// Real-world equirectangular-projection land path generated from
// Natural Earth 110m land data (world-atlas@2/land-110m.json).
const MAP_PATHS = [WORLD_MAP_D];

export default function LanguageSupportSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % LANGUAGES.length);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const active = LANGUAGES[activeIdx];

  return (
    <section className="relative py-28 overflow-hidden">
      <style>{`
        @keyframes wu-map-ping {
          0% { transform: scale(0.5); opacity: 0.9; }
          80% { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes wu-map-dot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.35); }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[180px]" style={{ background: "hsl(260, 90%, 55%, 0.06)" }} />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] rounded-full blur-[120px]" style={{ background: "hsl(190, 90%, 50%, 0.05)" }} />
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
            <Globe className="w-3 h-3" />
            Global Language Support
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Works in <span className="gradient-text">your language.</span>
            <br className="hidden sm:block" /> Wherever your team meets.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg font-body">
            Real-time transcription and summarization in 50+ languages — with on-the-fly translation between any two of them.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto"
        >
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-5 sm:p-8 relative overflow-hidden">
            {/* top shimmer line */}
            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
              {/* Map */}
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-b from-black/40 via-black/20 to-black/40 aspect-[2/1]">
                {/* subtle grid */}
                <div
                  className="absolute inset-0 opacity-[0.15] pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />

                <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
                  {/* continents (stylized, dotted fill via pattern) */}
                  <defs>
                    <pattern id="wu-lang-dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="rgba(139,92,246,0.35)" />
                    </pattern>
                    <linearGradient id="wu-lang-line" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#8b5cf6" stopOpacity="0" />
                      <stop offset="0.5" stopColor="#8b5cf6" stopOpacity="0.9" />
                      <stop offset="1" stopColor="#06b6d4" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {MAP_PATHS.map((d, i) => (
                    <path
                      key={i}
                      d={d}
                      fill="url(#wu-lang-dots)"
                      fillRule="evenodd"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="0.4"
                      strokeLinejoin="round"
                    />
                  ))}

                  {/* connection lines from active to all others */}
                  {LANGUAGES.map((lang, i) => {
                    if (i === activeIdx) return null;
                    return (
                      <line
                        key={`line-${lang.code}`}
                        x1={active.x}
                        y1={active.y}
                        x2={lang.x}
                        y2={lang.y}
                        stroke="url(#wu-lang-line)"
                        strokeWidth="0.8"
                        strokeDasharray="3 3"
                        opacity="0.55"
                      />
                    );
                  })}
                </svg>

                {/* Language pins */}
                {LANGUAGES.map((lang, i) => {
                  const isActive = i === activeIdx;
                  return (
                    <div
                      key={lang.code}
                      className="absolute pointer-events-none"
                      style={{
                        left: `${(lang.x / 1000) * 100}%`,
                        top: `${(lang.y / 500) * 100}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className="relative">
                        {isActive && (
                          <span
                            className="absolute inset-0 rounded-full bg-green-400/60"
                            style={{ animation: "wu-map-ping 1.6s ease-out infinite" }}
                          />
                        )}
                        <span
                          className={`relative block rounded-full border transition-all duration-300 ${
                            isActive
                              ? "w-3 h-3 bg-green-400 border-white shadow-[0_0_16px_rgba(74,222,128,0.85)]"
                              : "w-2 h-2 bg-primary/60 border-primary/40"
                          }`}
                          style={isActive ? { animation: "wu-map-dot 1.6s ease-in-out infinite" } : undefined}
                        />
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap"
                          >
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/85 border border-primary/40 backdrop-blur-md shadow-lg">
                              <span className="text-xs">{lang.flag}</span>
                              <span className="text-[10px] font-bold text-foreground">{lang.name}</span>
                              <span className="text-[9px] font-mono text-primary tabular-nums">{lang.accuracy}%</span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Overlay stats */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between flex-wrap gap-2 pointer-events-none">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-black/60 border border-white/10 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Live</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{LANGUAGES.length} active regions</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-black/60 border border-white/10 backdrop-blur-md">
                    <Languages className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-bold text-foreground">50+ languages · 120+ countries</span>
                  </div>
                </div>
              </div>

              {/* Side panel */}
              <div className="flex flex-col gap-4 min-w-0">
                {/* Live phrase card */}
                <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.1] via-white/[0.02] to-transparent p-5 backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/15 blur-[80px] pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Now transcribing</span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={active.code}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.25 }}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08]"
                        >
                          <span className="text-sm leading-none">{active.flag}</span>
                          <span className="text-[10px] font-mono font-bold text-foreground">{active.code}</span>
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={active.code + "-phrase"}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.3 }}
                        className="text-base font-semibold text-foreground leading-snug min-h-[3rem]"
                      >
                        “{active.phrase}”
                      </motion.p>
                    </AnimatePresence>
                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/[0.06]">
                      <span className="text-[10px] text-muted-foreground">Accuracy</span>
                      <span className="text-xs font-bold text-primary tabular-nums">{active.accuracy}%</span>
                    </div>
                  </div>
                </div>

                {/* Languages grid */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Top 12 supported</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5">
                    {LANGUAGES.map((lang, i) => {
                      const isActive = i === activeIdx;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => setActiveIdx(i)}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all duration-200 text-left ${
                            isActive
                              ? "bg-primary/15 border-primary/40"
                              : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15]"
                          }`}
                        >
                          <span className="text-sm leading-none">{lang.flag}</span>
                          <span className="text-[11px] font-semibold text-foreground truncate flex-1">{lang.name}</span>
                          <span className="text-[9px] font-mono text-muted-foreground tabular-nums">{lang.code}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom stats */}
            <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Languages</p>
                <p className="text-lg font-bold text-foreground tabular-nums mt-0.5">50+</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Countries</p>
                <p className="text-lg font-bold text-foreground tabular-nums mt-0.5">120+</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Avg accuracy</p>
                <p className="text-lg font-bold text-foreground tabular-nums mt-0.5">98.2%</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Live translate</p>
                <p className="text-lg font-bold text-foreground tabular-nums mt-0.5">Any→Any</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
