import { Button } from "@/components/ui/button";
import { Mic, Upload } from "lucide-react";

interface MeetingsEmptyStateProps {
  onStart: () => void;
  onUpload: () => void;
  searchActive?: boolean;
}

export function MeetingsEmptyState({ onStart, onUpload, searchActive }: MeetingsEmptyStateProps) {
  if (searchActive) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <p className="text-sm text-muted-foreground">No meetings match your search.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-12 md:p-16 text-center flex flex-col items-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 gradient-bg rounded-full blur-2xl opacity-30" aria-hidden />
        <div className="relative w-20 h-20 rounded-full gradient-bg flex items-center justify-center">
          <Mic className="h-9 w-9 text-primary-foreground" strokeWidth={1.8} />
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-1">No meetings yet</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Upload a recording or start an instant meeting to begin.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" onClick={onUpload}>
          <Upload className="mr-1.5 h-4 w-4" /> Upload Recording
        </Button>
        <Button className="gradient-bg text-primary-foreground" onClick={onStart}>
          <Mic className="mr-1.5 h-4 w-4" /> Start Instant Meeting
        </Button>
      </div>
    </div>
  );
}
