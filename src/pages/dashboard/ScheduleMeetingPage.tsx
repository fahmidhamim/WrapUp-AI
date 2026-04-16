import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, Clock, CalendarPlus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMeetings } from "@/hooks/useMeetings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar";

const TIMEZONES = [
  { value: "GMT-12:00", label: "(GMT-12:00) Baker Island" },
  { value: "GMT-11:00", label: "(GMT-11:00) Pago Pago, Midway" },
  { value: "GMT-10:00", label: "(GMT-10:00) Honolulu, Hawaii" },
  { value: "GMT-09:00", label: "(GMT-09:00) Anchorage, Alaska" },
  { value: "GMT-08:00", label: "(GMT-08:00) Los Angeles, Vancouver" },
  { value: "GMT-07:00", label: "(GMT-07:00) Denver, Phoenix, Calgary" },
  { value: "GMT-06:00", label: "(GMT-06:00) Chicago, Mexico City" },
  { value: "GMT-05:00", label: "(GMT-05:00) New York, Toronto, Bogotá" },
  { value: "GMT-04:00", label: "(GMT-04:00) Santiago, Halifax, Caracas" },
  { value: "GMT-03:00", label: "(GMT-03:00) São Paulo, Buenos Aires" },
  { value: "GMT-02:00", label: "(GMT-02:00) South Georgia" },
  { value: "GMT-01:00", label: "(GMT-01:00) Azores, Cape Verde" },
  { value: "GMT+00:00", label: "(GMT+00:00) London, Lisbon, Accra" },
  { value: "GMT+01:00", label: "(GMT+01:00) Paris, Berlin, Lagos" },
  { value: "GMT+02:00", label: "(GMT+02:00) Cairo, Johannesburg, Helsinki" },
  { value: "GMT+03:00", label: "(GMT+03:00) Moscow, Riyadh, Nairobi" },
  { value: "GMT+03:30", label: "(GMT+03:30) Tehran" },
  { value: "GMT+04:00", label: "(GMT+04:00) Dubai, Baku, Tbilisi" },
  { value: "GMT+04:30", label: "(GMT+04:30) Kabul" },
  { value: "GMT+05:00", label: "(GMT+05:00) Karachi, Tashkent" },
  { value: "GMT+05:30", label: "(GMT+05:30) Mumbai, Kolkata, Delhi" },
  { value: "GMT+05:45", label: "(GMT+05:45) Kathmandu" },
  { value: "GMT+06:00", label: "(GMT+06:00) Dhaka, Almaty" },
  { value: "GMT+06:30", label: "(GMT+06:30) Yangon" },
  { value: "GMT+07:00", label: "(GMT+07:00) Bangkok, Jakarta, Hanoi" },
  { value: "GMT+08:00", label: "(GMT+08:00) Singapore, Beijing, Kuala Lumpur" },
  { value: "GMT+09:00", label: "(GMT+09:00) Tokyo, Seoul, Pyongyang" },
  { value: "GMT+09:30", label: "(GMT+09:30) Adelaide, Darwin" },
  { value: "GMT+10:00", label: "(GMT+10:00) Sydney, Melbourne, Guam" },
  { value: "GMT+11:00", label: "(GMT+11:00) Solomon Islands, Noumea" },
  { value: "GMT+12:00", label: "(GMT+12:00) Auckland, Fiji, Kamchatka" },
  { value: "GMT+13:00", label: "(GMT+13:00) Nuku'alofa, Samoa" },
];

function generateTimeSlots() {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

function detectGMT(): string {
  const offset = -new Date().getTimezoneOffset();
  const h = Math.floor(Math.abs(offset) / 60);
  const m = Math.abs(offset) % 60;
  const sign = offset >= 0 ? "+" : "-";
  const label = `GMT${sign}${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  return TIMEZONES.find((tz) => tz.value === label)?.value || "GMT+00:00";
}

export default function ScheduleMeetingPage() {
  const navigate = useNavigate();
  const { meetingsQuery, scheduleMeeting, updateMeeting } = useMeetings();
  const meetings = meetingsQuery.data ?? [];
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [gmt, setGmt] = useState(detectGMT);
  const [submitting, setSubmitting] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<{ start: string; reason: string }[]>([]);

  const handleSchedule = async () => {
    if (!date) { toast.error("Please select a date"); return; }
    if (!title.trim()) { toast.error("Please enter a meeting title"); return; }

    const match = gmt.match(/GMT([+-])(\d{2}):(\d{2})/);
    const offsetSign = match?.[1] === "+" ? 1 : -1;
    const offsetH = parseInt(match?.[2] || "0");
    const offsetM = parseInt(match?.[3] || "0");
    const totalOffsetMs = offsetSign * (offsetH * 60 + offsetM) * 60 * 1000;

    const [hh, mm] = time.split(":").map(Number);
    const [endHh, endMm] = endTime.split(":").map(Number);
    const startMinutes = hh * 60 + mm;
    const endMinutes = endHh * 60 + endMm;
    if (endMinutes <= startMinutes) {
      toast.error("End time must be after start time");
      return;
    }
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hh, mm));
    const utcEndDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), endHh, endMm));
    const scheduledAt = new Date(utcDate.getTime() - totalOffsetMs);
    const scheduledEndAt = new Date(utcEndDate.getTime() - totalOffsetMs);

    setSubmitting(true);
    try {
      await scheduleMeeting.mutateAsync({
        title: title.trim(),
        scheduledAt: scheduledAt.toISOString(),
        scheduledEndAt: scheduledEndAt.toISOString(),
      });
      toast.success("Meeting scheduled successfully!");
      setTitle("");
      setDate(undefined);
    } catch {
      toast.error("Failed to schedule meeting");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReschedule = useCallback(
    (id: string, newDate: Date) => {
      updateMeeting.mutate(
        { id, scheduled_at: newDate.toISOString() },
        { onSuccess: () => toast.success("Meeting rescheduled"), onError: () => toast.error("Failed to reschedule") }
      );
    },
    [updateMeeting]
  );

  const handleResize = useCallback(
    (id: string, newDuration: number) => {
      updateMeeting.mutate(
        { id, duration_minutes: newDuration },
        { onError: () => toast.error("Failed to resize") }
      );
    },
    [updateMeeting]
  );

  const handleSuggest = useCallback(async () => {
    setSuggesting(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-times", {
        body: {
          meetings: meetings.filter((m) => m.scheduled_at).map((m) => ({
            title: m.title,
            scheduled_at: m.scheduled_at,
            duration_minutes: (m as any).duration_minutes ?? 30,
          })),
          date: new Date().toISOString(),
        },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setSuggestions(data?.suggestions ?? []);
      if (!data?.suggestions?.length) toast.info("No suggestions available");
    } catch {
      toast.error("Failed to get suggestions");
    } finally {
      setSuggesting(false);
    }
  }, [meetings]);

  const calendarMeetings = meetings
    .filter((m) => m.scheduled_at)
    .map((m) => ({
      id: m.id,
      title: m.title,
      scheduled_at: m.scheduled_at,
      duration_minutes: (m as any).duration_minutes ?? 30,
    }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Schedule</h1>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Schedule form */}
        <div className="glass rounded-xl p-6 space-y-5 h-fit">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-glow mx-auto flex items-center justify-center">
            <CalendarPlus className="h-7 w-7 text-primary-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input id="title" placeholder="e.g. Sprint Planning" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-popover z-50">
                {TIME_SLOTS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>End Time</Label>
            <Select value={endTime} onValueChange={setEndTime}>
              <SelectTrigger>
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-popover z-50">
                {TIME_SLOTS.map((t) => (
                  <SelectItem key={`end-${t}`} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={gmt} onValueChange={setGmt}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-popover z-50">
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full gradient-bg text-primary-foreground font-semibold" onClick={handleSchedule} disabled={submitting}>
            {submitting ? "Scheduling..." : "Schedule Meeting"}
          </Button>
        </div>

        {/* Calendar view */}
        <ScheduleCalendar
          meetings={calendarMeetings}
          onReschedule={handleReschedule}
          onResize={handleResize}
          onSuggest={handleSuggest}
          suggesting={suggesting}
          suggestions={suggestions}
        />
      </div>
    </div>
  );
}
