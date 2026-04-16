import { useState, useRef, useCallback, useMemo } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface CalendarMeeting {
  id: string;
  title: string;
  scheduled_at: string | null;
  duration_minutes: number;
}

interface Props {
  meetings: CalendarMeeting[];
  onReschedule: (id: string, newDate: Date) => void;
  onResize: (id: string, newDuration: number) => void;
  onSuggest: () => void;
  suggesting: boolean;
  suggestions: { start: string; reason: string }[];
}

const HOUR_HEIGHT = 60; // px per hour
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MIN_DURATION = 15;

export default function ScheduleCalendar({
  meetings,
  onReschedule,
  onResize,
  onSuggest,
  suggesting,
  suggestions,
}: Props) {
  const [view, setView] = useState<"day" | "week">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const gridRef = useRef<HTMLDivElement>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const days = view === "week"
    ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    : [currentDate];

  const prev = () => setCurrentDate((d) => addDays(d, view === "week" ? -7 : -1));
  const next = () => setCurrentDate((d) => addDays(d, view === "week" ? 7 : 1));
  const goToday = () => setCurrentDate(new Date());

  const meetingsByDay = useMemo(() => {
    const map: Record<string, CalendarMeeting[]> = {};
    meetings.forEach((m) => {
      if (!m.scheduled_at) return;
      const key = new Date(m.scheduled_at).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    return map;
  }, [meetings]);

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold text-sm min-w-[160px] text-center">
            {view === "week"
              ? `${format(days[0], "MMM d")} – ${format(days[6], "MMM d, yyyy")}`
              : format(currentDate, "EEEE, MMM d, yyyy")}
          </h3>
          <Button variant="ghost" size="icon" onClick={next}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday} className="text-xs ml-1">
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={suggesting ? "secondary" : "outline"}
            size="sm"
            onClick={onSuggest}
            disabled={suggesting}
            className="text-xs gap-1.5"
          >
            {suggesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            AI Suggest
          </Button>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors", view === "day" ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
              onClick={() => setView("day")}
            >
              Day
            </button>
            <button
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors", view === "week" ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
              onClick={() => setView("week")}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 bg-accent/30 border-b border-border/40 flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Suggested:
          </span>
          {suggestions.map((s, i) => (
            <span
              key={i}
              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md"
              title={s.reason}
            >
              {format(new Date(s.start), "EEE h:mm a")}
            </span>
          ))}
        </div>
      )}

      {/* Calendar grid */}
      <div className="overflow-auto max-h-[600px]">
        <div className="flex">
          {/* Time gutter */}
          <div className="w-14 flex-shrink-0 border-r border-border/40">
            <div className="h-8" /> {/* header spacer */}
            {HOURS.map((h) => (
              <div key={h} className="relative" style={{ height: HOUR_HEIGHT }}>
                <span className="absolute -top-2 right-2 text-[10px] text-muted-foreground">
                  {h === 0 ? "" : format(new Date(2000, 0, 1, h), "h a")}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => (
            <DayColumn
              key={day.toISOString()}
              day={day}
              meetings={meetingsByDay[day.toDateString()] ?? []}
              isToday={isSameDay(day, new Date())}
              onReschedule={onReschedule}
              onResize={onResize}
              view={view}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayColumn({
  day,
  meetings,
  isToday,
  onReschedule,
  onResize,
  view,
}: {
  day: Date;
  meetings: CalendarMeeting[];
  isToday: boolean;
  onReschedule: (id: string, newDate: Date) => void;
  onResize: (id: string, newDuration: number) => void;
  view: "day" | "week";
}) {
  const colRef = useRef<HTMLDivElement>(null);

  const getTimeFromY = useCallback((y: number): Date => {
    const totalMinutes = Math.round((y / HOUR_HEIGHT) * 60 / 15) * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const d = new Date(day);
    d.setHours(Math.max(0, Math.min(23, hours)), Math.min(59, minutes), 0, 0);
    return d;
  }, [day]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("meetingId");
      const offsetY = parseFloat(e.dataTransfer.getData("offsetY") || "0");
      if (!id || !colRef.current) return;
      const rect = colRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top - offsetY;
      const newDate = getTimeFromY(y);
      onReschedule(id, newDate);
    },
    [getTimeFromY, onReschedule]
  );

  return (
    <div className={cn("flex-1 min-w-[100px]", view === "day" && "min-w-full")}>
      {/* Day header */}
      <div
        className={cn(
          "h-8 flex items-center justify-center text-xs font-medium border-b border-border/40 sticky top-0 bg-card/80 backdrop-blur-sm z-10",
          isToday && "text-primary"
        )}
      >
        <span>{format(day, view === "week" ? "EEE d" : "EEEE, MMM d")}</span>
      </div>

      {/* Time slots */}
      <div
        ref={colRef}
        className="relative border-r border-border/20"
        style={{ height: HOURS.length * HOUR_HEIGHT }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Hour lines */}
        {HOURS.map((h) => (
          <div
            key={h}
            className="absolute w-full border-t border-border/20"
            style={{ top: h * HOUR_HEIGHT }}
          />
        ))}

        {/* Now indicator */}
        {isToday && <NowIndicator />}

        {/* Meeting blocks */}
        {meetings.map((m) => (
          <MeetingBlock
            key={m.id}
            meeting={m}
            onResize={onResize}
          />
        ))}
      </div>
    </div>
  );
}

function NowIndicator() {
  const now = new Date();
  const top = (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT;
  return (
    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top }}>
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-destructive" />
        <div className="flex-1 h-[1.5px] bg-destructive" />
      </div>
    </div>
  );
}

function MeetingBlock({
  meeting,
  onResize,
}: {
  meeting: CalendarMeeting;
  onResize: (id: string, newDuration: number) => void;
}) {
  const resizeRef = useRef<{ startY: number; startDuration: number } | null>(null);

  if (!meeting.scheduled_at) return null;
  const start = new Date(meeting.scheduled_at);
  const top = (start.getHours() + start.getMinutes() / 60) * HOUR_HEIGHT;
  const height = (meeting.duration_minutes / 60) * HOUR_HEIGHT;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("meetingId", meeting.id);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    e.dataTransfer.setData("offsetY", String(e.clientY - rect.top));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    resizeRef.current = { startY: e.clientY, startDuration: meeting.duration_minutes };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const dy = ev.clientY - resizeRef.current.startY;
      const dMinutes = Math.round((dy / HOUR_HEIGHT) * 60 / MIN_DURATION) * MIN_DURATION;
      const newDuration = Math.max(MIN_DURATION, resizeRef.current.startDuration + dMinutes);
      onResize(meeting.id, newDuration);
    };

    const handleMouseUp = () => {
      resizeRef.current = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="absolute left-1 right-1 rounded-md gradient-bg text-primary-foreground px-2 py-1 cursor-grab active:cursor-grabbing z-10 overflow-hidden group select-none"
      style={{ top, height: Math.max(height, 20) }}
      title={`${meeting.title} — ${format(start, "h:mm a")} (${meeting.duration_minutes}min)`}
    >
      <div className="text-[10px] font-semibold truncate leading-tight">{meeting.title}</div>
      {height > 28 && (
        <div className="text-[9px] opacity-80">
          {format(start, "h:mm a")} · {meeting.duration_minutes}m
        </div>
      )}
      {/* Resize handle */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize opacity-0 group-hover:opacity-100 bg-primary-foreground/20 rounded-b-md"
      />
    </div>
  );
}
