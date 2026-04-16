import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMeetings } from "@/hooks/useMeetings";
import { useSubscription } from "@/hooks/useSubscription";
import { PremiumGate } from "@/components/dashboard/PremiumGate";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { meetingsQuery } = useMeetings();
  const { tier } = useSubscription();
  const meetings = meetingsQuery.data ?? [];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const meetingsByDate = useMemo(() => {
    const map: Record<string, typeof meetings> = {};
    meetings.forEach((m) => {
      const key = new Date(m.created_at).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    return map;
  }, [meetings]);

  const prev = () => setCurrentDate(new Date(year, month - 1, 1));
  const next = () => setCurrentDate(new Date(year, month + 1, 1));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Calendar</h1>

      <PremiumGate tier={tier} minimumTier="business" featureName="Calendar Sync">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
            <h2 className="font-semibold">
              {currentDate.toLocaleString("default", { month: "long" })} {year}
            </h2>
            <Button variant="ghost" size="icon" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs text-muted-foreground font-medium py-2">{d}</div>
            ))}
            {cells.map((day, i) => {
              const dateStr = day ? new Date(year, month, day).toDateString() : "";
              const dayMeetings = dateStr ? meetingsByDate[dateStr] ?? [] : [];
              const isToday = day && new Date().toDateString() === dateStr;

              return (
                <div
                  key={i}
                  className={`min-h-[70px] rounded-lg p-1.5 text-xs ${
                    day ? "hover:bg-accent/50 cursor-pointer" : ""
                  } ${isToday ? "ring-1 ring-primary" : ""}`}
                >
                  {day && (
                    <>
                      <span className={`font-medium ${isToday ? "text-primary" : "text-foreground"}`}>{day}</span>
                      {dayMeetings.slice(0, 2).map((m) => (
                        <div key={m.id} className="mt-0.5 px-1 py-0.5 rounded text-[10px] gradient-bg text-primary-foreground truncate">
                          {m.title}
                        </div>
                      ))}
                      {dayMeetings.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">+{dayMeetings.length - 2} more</span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </PremiumGate>
    </div>
  );
}
