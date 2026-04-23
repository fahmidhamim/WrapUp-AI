import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BackendRuntimeStatus } from "@/lib/backend-runtime";

interface BackendStatusDotProps {
  status: BackendRuntimeStatus | null;
  onRetry?: () => void;
  className?: string;
}

type FriendlyState = "ready" | "starting" | "unavailable";

function resolveState(status: BackendRuntimeStatus | null): FriendlyState {
  if (!status) return "ready";
  if (status.state === "starting") return "starting";
  if (status.state === "unavailable") return "unavailable";
  return "ready";
}

const LABELS: Record<FriendlyState, string> = {
  ready: "AI engine ready",
  starting: "AI engine starting…",
  unavailable: "AI engine offline",
};

const DOT_CLS: Record<FriendlyState, string> = {
  ready: "bg-success",
  starting: "bg-amber-400",
  unavailable: "bg-destructive",
};

export function BackendStatusDot({ status, onRetry, className }: BackendStatusDotProps) {
  const state = resolveState(status);

  return (
    <div className={cn("flex items-center gap-2 text-[12px] text-muted-foreground", className)}>
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          DOT_CLS[state],
          state !== "ready" && "animate-pulse",
        )}
        aria-hidden
      />
      <span>{LABELS[state]}</span>
      {state === "unavailable" && onRetry && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-primary hover:text-primary"
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </div>
  );
}
