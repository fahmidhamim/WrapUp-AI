export interface Meeting {
  id: string;
  title: string;
  created_at: string;
  duration_minutes?: number | null;
  scheduled_at?: string | null;
}

export function getThisWeekMeetings<T extends { created_at: string }>(meetings: T[]): T[] {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return meetings.filter((m) => new Date(m.created_at) >= weekAgo);
}

export function groupMeetingsByDay<T extends { created_at: string }>(meetings: T[], days: number): { date: string; label: string; count: number }[] {
  const now = new Date();
  const result: { date: string; label: string; count: number }[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    result.push({ date: dateStr, label: dayNames[d.getDay()], count: 0 });
  }

  for (const m of meetings) {
    const dateStr = new Date(m.created_at).toISOString().slice(0, 10);
    const entry = result.find((r) => r.date === dateStr);
    if (entry) entry.count++;
  }

  return result;
}

export function groupMeetingsByWeek<T extends { created_at: string }>(meetings: T[], weeks: number): { week: string; count: number }[] {
  const now = new Date();
  const result: { week: string; start: Date; count: number }[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(start.getDate() - (i + 1) * 7);
    const end = new Date(now);
    end.setDate(end.getDate() - i * 7);
    const label = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    result.push({ week: label, start, count: 0 });
  }

  for (const m of meetings) {
    const d = new Date(m.created_at);
    for (let i = 0; i < result.length; i++) {
      const nextStart = i + 1 < result.length ? result[i + 1].start : now;
      if (d >= result[i].start && d < nextStart) {
        result[i].count++;
        break;
      }
    }
  }

  return result.map(({ week, count }) => ({ week, count }));
}

export function getMonthlyUsage<T extends { created_at: string }>(meetings: T[]): number {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return meetings.filter((m) => new Date(m.created_at) >= monthStart).length;
}
