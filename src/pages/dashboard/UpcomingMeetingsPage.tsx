import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Video } from "lucide-react";
import { useMeetings } from "@/hooks/useMeetings";
import { useEffect, useState } from "react";

export default function UpcomingMeetingsPage() {
  const { meetingsQuery } = useMeetings();
  const meetings = meetingsQuery.data ?? [];
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const upcomingMeetings = meetings
    .filter((m) => {
      if (!m.scheduled_at) return false;
      const start = new Date(m.scheduled_at);
      const end =
        m.actual_ended_at
          ? new Date(m.actual_ended_at)
          : m.scheduled_end_at
          ? new Date(m.scheduled_end_at)
          : new Date(start.getTime() + ((m.duration_minutes ?? 30) * 60 * 1000));
      return end >= now;
    })
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Upcoming Meetings</h1>

      {meetingsQuery.isLoading ? (
        <div className="glass rounded-xl p-12 text-center text-muted-foreground text-sm">Loading...</div>
      ) : upcomingMeetings.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-muted-foreground">
          No upcoming meetings scheduled.{" "}
          <Link to="/dashboard/schedule" className="text-primary hover:underline">Schedule one</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingMeetings.map((m, i) => {
            const sa = new Date(m.scheduled_at!);
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/dashboard/join/${m.id}`}
                  className="glass rounded-xl p-5 hover:glow transition-shadow block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
                      <Video className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/20">
                      Upcoming
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{m.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {sa.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {sa.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {now >= sa
                      ? "Join is available now."
                      : `Please join after ${sa.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })} at ${sa.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}.`}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
