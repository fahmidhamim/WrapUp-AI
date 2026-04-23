import { jsPDF } from "jspdf";

export type MeetingSummaryPayload = {
  executive_summary?: string;
  key_points?: string[];
  action_items?: Array<{ task?: string; owner?: string; deadline?: string; confidence?: number }>;
  decisions?: string[];
  follow_ups?: string[];
  speaker_breakdown?: Array<{ speaker?: string; contribution?: string }>;
  mom?: {
    title?: string;
    overview?: string;
    agenda?: string[] | string;
    discussion?: string[] | string;
    decisions?: string[] | string;
    action_items?: string[] | string;
    next_steps?: string[] | string;
  };
  language?: string;
};

export interface MeetingActionItem {
  title: string;
  is_completed: boolean;
}

export interface GenerateMeetingPdfInput {
  title: string;
  id: string;
  createdAt: string;
  transcript: string;
  summary: MeetingSummaryPayload;
  meetingActions?: MeetingActionItem[];
}

export function generateMeetingPdf(input: GenerateMeetingPdfInput): void {
  const { title, id, createdAt, transcript, summary, meetingActions = [] } = input;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const usableWidth = pageWidth - margin * 2;
  let y = 52;

  const addLines = (text: string, size = 11, bold = false) => {
    if (!text.trim()) return;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, usableWidth) as string[];
    for (const line of lines) {
      if (y > pageHeight - 45) {
        doc.addPage();
        y = 52;
      }
      doc.text(line, margin, y);
      y += size + 4;
    }
  };

  const toTextList = (value?: string[] | string): string[] => {
    if (Array.isArray(value)) {
      return value.map((item) => item.trim()).filter(Boolean);
    }
    if (typeof value !== "string") return [];
    return value
      .split(/\s*\|\s*|\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const addBulletList = (heading: string, items: string[]) => {
    if (items.length === 0) return;
    y += 6;
    addLines(heading, 12, true);
    items.forEach((item) => addLines(`- ${item}`, 11));
  };

  addLines(title, 18, true);
  addLines(`Meeting ID: ${id}`, 10);
  addLines(`Date: ${new Date(createdAt).toLocaleString()}`, 10);
  y += 8;
  addLines("Transcript", 14, true);
  addLines(transcript || "No transcript generated yet.", 10);

  y += 8;
  addLines("Summary", 14, true);
  addLines(summary.executive_summary ?? "No summary generated yet.", 11);

  addBulletList("Key Points", toTextList(summary.key_points));
  addBulletList("Decisions", toTextList(summary.decisions));
  addBulletList("Follow-ups", toTextList(summary.follow_ups));

  if (Array.isArray(summary.action_items) && summary.action_items.length > 0) {
    y += 6;
    addLines("Generated Action Items", 12, true);
    summary.action_items.forEach((item) => {
      const task = item.task?.trim() || "Untitled task";
      const owner = item.owner?.trim() ? ` | Owner: ${item.owner.trim()}` : "";
      const deadline = item.deadline?.trim() ? ` | Deadline: ${item.deadline.trim()}` : "";
      addLines(`- ${task}${owner}${deadline}`, 11);
    });
  }

  if (Array.isArray(summary.speaker_breakdown) && summary.speaker_breakdown.length > 0) {
    y += 6;
    addLines("Speaker Breakdown", 12, true);
    summary.speaker_breakdown.forEach((entry) => {
      const speaker = entry.speaker?.trim() || "Unknown";
      const contribution = entry.contribution?.trim() || "";
      addLines(`- ${speaker}${contribution ? `: ${contribution}` : ""}`, 11);
    });
  }

  if (summary.mom && Object.keys(summary.mom).length > 0) {
    y += 6;
    addLines("Structured MoM", 12, true);
    if (summary.mom.title?.trim()) addLines(summary.mom.title.trim(), 11, true);
    if (summary.mom.overview?.trim()) addLines(summary.mom.overview.trim(), 11);

    const momAgenda = toTextList(summary.mom.agenda);
    if (momAgenda.length > 0) addLines(`Agenda: ${momAgenda.join(" | ")}`, 11);

    const momDiscussion = toTextList(summary.mom.discussion);
    if (momDiscussion.length > 0) addLines(`Discussion: ${momDiscussion.join(" | ")}`, 11);

    const momDecisions = toTextList(summary.mom.decisions);
    if (momDecisions.length > 0) addLines(`Decisions: ${momDecisions.join(" | ")}`, 11);

    const momActionItems = toTextList(summary.mom.action_items);
    if (momActionItems.length > 0) addLines(`Action Items: ${momActionItems.join(" | ")}`, 11);

    const momNextSteps = toTextList(summary.mom.next_steps);
    if (momNextSteps.length > 0) addLines(`Next Steps: ${momNextSteps.join(" | ")}`, 11);
  }

  if (meetingActions.length > 0) {
    y += 6;
    addLines("Action Items", 12, true);
    meetingActions.forEach((item) => addLines(`- ${item.is_completed ? "[Done] " : ""}${item.title}`, 11));
  }

  doc.save(`${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "meeting"}-summary.pdf`);
}
