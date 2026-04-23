import { cn } from "@/lib/utils";

interface WaveformBarsProps {
  count?: number;
  className?: string;
  barClassName?: string;
}

export function WaveformBars({ count = 20, className, barClassName }: WaveformBarsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-[3px] h-6", className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn("w-[3px] h-full rounded-full bg-primary/70 origin-center animate-waveform", barClassName)}
          style={{ animationDelay: `${i * 70}ms` }}
        />
      ))}
    </div>
  );
}
