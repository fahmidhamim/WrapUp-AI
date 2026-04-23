import type { MeetingSessionSummary, MeetingWithSessions } from "@/hooks/useMeetings";

const AUDIO_EXT_RE = /\.(mp3|mp4|m4a|wav|webm|ogg|flac|aac|mov|mkv)$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function cleanMeetingTitle(raw: string | null | undefined): string {
  if (!raw) return "Untitled Meeting";
  let s = raw.trim();
  if (!s) return "Untitled Meeting";

  if (UUID_RE.test(s)) return "Untitled Meeting";

  s = s.replace(AUDIO_EXT_RE, "");
  s = s.replace(/[_-]+/g, " ");
  s = s.replace(/\s+/g, " ").trim();

  if (!s) return "Untitled Meeting";

  if (!/[a-zA-Z]/.test(s)) return "Untitled Meeting";

  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function formatMeetingDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}`;
}

export function formatDuration(minutes: number | null | undefined): string | null {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) return null;
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}

const ICON_PALETTE = [
  "#6C3FE6",
  "#2563EB",
  "#0D9488",
  "#D97706",
  "#DB2777",
] as const;

export interface IconColorStyle {
  background: string;
  color: string;
  boxShadow: string;
}

export function getIconColor(index: number): IconColorStyle {
  const i = Number.isFinite(index) && index >= 0 ? Math.floor(index) : 0;
  const hex = ICON_PALETTE[i % ICON_PALETTE.length];
  return {
    background: `${hex}33`,
    color: hex,
    boxShadow: `inset 0 0 0 1px ${hex}4D`,
  };
}

export function getInitial(title: string): string {
  const match = (title || "").match(/[a-zA-Z0-9]/);
  return match ? match[0].toUpperCase() : "M";
}

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

function asObject(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

export interface DerivedMeetingStatus {
  transcriptDone: boolean;
  summaryDone: boolean;
  momDone: boolean;
  processing: boolean;
  language: string | null;
  sentiment: "positive" | "neutral" | "tense" | null;
  speakerCount: number | null;
}

export function deriveMeetingStatus(meeting: MeetingWithSessions): DerivedMeetingStatus {
  const sessions: MeetingSessionSummary[] = meeting.sessions ?? [];

  const transcriptDone = sessions.some((s) => typeof s.transcript === "string" && s.transcript.trim().length > 0);

  const summaryDone = sessions.some((s) => {
    const obj = asObject(s.summary as Json);
    return obj != null && Object.keys(obj).length > 0;
  });

  const momDone = sessions.some((s) => {
    const obj = asObject(s.summary as Json);
    if (!obj) return false;
    return Boolean(obj.mom || obj.minutes_of_meeting || obj.minutesOfMeeting);
  });

  const processing = sessions.some((s) => {
    const status = (s.processing_status ?? "").toString().toLowerCase();
    if (status === "queued" || status === "processing") return true;
    const analytics = asObject(s.analytics_data as Json);
    const nestedStatus = asObject(analytics?.processing_status as Json)?.status;
    const nested = typeof nestedStatus === "string" ? nestedStatus.toLowerCase() : "";
    return nested === "queued" || nested === "processing";
  }) && !summaryDone;

  const latest = [...sessions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
  const language = latest?.language_detected?.trim() || null;

  let sentiment: DerivedMeetingStatus["sentiment"] = null;
  let speakerCount: number | null = null;

  const pickSentiment = (raw: unknown): DerivedMeetingStatus["sentiment"] | null => {
    if (typeof raw !== "string") return null;
    const v = raw.trim().toLowerCase();
    if (!v) return null;
    if (v.includes("pos")) return "positive";
    if (v.includes("neg") || v.includes("tense")) return "tense";
    if (v.includes("neu")) return "neutral";
    return null;
  };

  const pickSpeakerCount = (raw: unknown): number | null => {
    if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return Math.floor(raw);
    if (Array.isArray(raw) && raw.length > 0) return raw.length;
    if (typeof raw === "string") {
      const n = Number.parseInt(raw, 10);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return null;
  };

  for (const s of sessions) {
    const sRec = s as unknown as Record<string, unknown>;
    const summary = asObject(s.summary as Json);
    const analytics = asObject(s.analytics_data as Json);

    if (!sentiment) {
      const candidates: unknown[] = [
        sRec.sentiment,
        sRec.sentiment_label,
        sRec.overall_sentiment,
        summary?.sentiment,
        summary?.sentiment_label,
        summary?.overall_sentiment,
        analytics?.sentiment,
        analytics?.sentiment_label,
        analytics?.overall_sentiment,
        asObject(analytics?.sentiment as Json)?.label,
        asObject(summary?.sentiment as Json)?.label,
      ];
      for (const c of candidates) {
        const picked = pickSentiment(c);
        if (picked) {
          sentiment = picked;
          break;
        }
      }
    }

    if (speakerCount == null) {
      const candidates: unknown[] = [
        sRec.speaker_count,
        sRec.num_speakers,
        sRec.diarization_speaker_count,
        sRec.speakers,
        summary?.speaker_count,
        summary?.num_speakers,
        summary?.diarization_speaker_count,
        summary?.speakers,
        analytics?.speaker_count,
        analytics?.num_speakers,
        analytics?.diarization_speaker_count,
        analytics?.speakers,
      ];
      for (const c of candidates) {
        const n = pickSpeakerCount(c);
        if (n != null) {
          speakerCount = n;
          break;
        }
      }
    }
  }

  return { transcriptDone, summaryDone, momDone, processing, language, sentiment, speakerCount };
}

export function formatLanguage(code: string): string {
  const trimmed = code.trim();
  if (!trimmed) return "";
  const map: Record<string, string> = {
    en: "English",
    "en-us": "English",
    "en-gb": "English",
    bn: "Bengali",
    "bn-bd": "Bengali",
    es: "Spanish",
    fr: "French",
    de: "German",
    hi: "Hindi",
    ar: "Arabic",
    zh: "Chinese",
    ja: "Japanese",
    pt: "Portuguese",
    ru: "Russian",
  };
  const lower = trimmed.toLowerCase();
  if (map[lower]) return map[lower];
  if (lower.includes("mixed") || lower.includes("multi")) return "Mixed";
  return trimmed[0].toUpperCase() + trimmed.slice(1);
}
