import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type SharedActionItem = {
  id: string;
  title: string;
  is_completed: boolean;
};

type SummaryPayload = {
  executive_summary?: string;
  key_points?: string[];
  decisions?: string[];
  follow_ups?: string[];
  action_items?: Array<{ task?: string; owner?: string; deadline?: string; confidence?: number }>;
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
};

type SharedSnapshot = {
  meeting_title: string;
  created_at: string;
  transcript: string | null;
  summary: SummaryPayload | null;
  action_items: SharedActionItem[];
};

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\s*\|\s*|\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export default function SharedMeetingPage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<SharedSnapshot | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from("meeting_shares")
          .select("snapshot, created_at")
          .eq("token", token)
          .eq("is_revoked", false)
          .maybeSingle();

        if (dbError) throw dbError;

        if (!data) {
          throw new Error("This shared link is invalid or has been revoked.");
        }

        if (!data.snapshot) {
          throw new Error("This shared meeting has no content to display.");
        }

        if (!cancelled) {
          setSnapshot(data.snapshot as unknown as SharedSnapshot);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load shared meeting.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-xl border border-border p-6 space-y-3">
          <h1 className="text-xl font-semibold">Shared Meeting Not Available</h1>
          <p className="text-sm text-muted-foreground">{error ?? "This shared link is invalid or expired."}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const summary = snapshot.summary ?? {};
  const executiveSummary = typeof summary.executive_summary === "string" ? summary.executive_summary : "";
  const keyPoints = toStringList(summary.key_points);
  const decisions = toStringList(summary.decisions);
  const followUps = toStringList(summary.follow_ups);
  const mom = summary.mom ?? {};
  const momAgenda = toStringList(mom.agenda);
  const momDiscussion = toStringList(mom.discussion);
  const momDecisions = toStringList(mom.decisions);
  const momActionItems = toStringList(mom.action_items);
  const momNextSteps = toStringList(mom.next_steps);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Shared via WrapUp</p>
          <h1 className="text-2xl font-bold">{snapshot.meeting_title}</h1>
          <p className="text-sm text-muted-foreground">
            Created {new Date(snapshot.created_at).toLocaleString()}
          </p>
        </header>

        <section className="rounded-xl border border-border p-5 space-y-3">
          <h2 className="text-lg font-semibold">Summary</h2>
          {executiveSummary ? (
            <p className="whitespace-pre-wrap text-sm leading-6">{executiveSummary}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No summary available.</p>
          )}
          {keyPoints.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Key Points</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {keyPoints.map((point, idx) => <li key={idx}>{point}</li>)}
              </ul>
            </div>
          )}
          {decisions.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Decisions</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {decisions.map((d, idx) => <li key={idx}>{d}</li>)}
              </ul>
            </div>
          )}
          {followUps.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Follow-ups</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {followUps.map((f, idx) => <li key={idx}>{f}</li>)}
              </ul>
            </div>
          )}
          {Array.isArray(summary.action_items) && summary.action_items.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Generated Action Items</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {summary.action_items.map((item, idx) => {
                  const task = item.task?.trim() || "Untitled task";
                  const owner = item.owner?.trim() ? ` | Owner: ${item.owner.trim()}` : "";
                  const deadline = item.deadline?.trim() ? ` | Deadline: ${item.deadline.trim()}` : "";
                  return <li key={idx}>{`${task}${owner}${deadline}`}</li>;
                })}
              </ul>
            </div>
          )}
          {Array.isArray(summary.speaker_breakdown) && summary.speaker_breakdown.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Speaker Breakdown</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {summary.speaker_breakdown.map((entry, idx) => (
                  <li key={idx}>
                    {entry.speaker?.trim() || "Unknown"}
                    {entry.contribution?.trim() ? `: ${entry.contribution.trim()}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {summary.mom && Object.keys(summary.mom).length > 0 && (
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Structured MoM</p>
              <div className="rounded-lg border border-border p-3 space-y-2 text-sm">
                {mom.title?.trim() && <p className="font-medium">{mom.title.trim()}</p>}
                {mom.overview?.trim() && <p className="whitespace-pre-wrap">{mom.overview.trim()}</p>}
                {momAgenda.length > 0 && <p><span className="font-medium">Agenda:</span> {momAgenda.join(" | ")}</p>}
                {momDiscussion.length > 0 && <p><span className="font-medium">Discussion:</span> {momDiscussion.join(" | ")}</p>}
                {momDecisions.length > 0 && <p><span className="font-medium">Decisions:</span> {momDecisions.join(" | ")}</p>}
                {momActionItems.length > 0 && <p><span className="font-medium">Action Items:</span> {momActionItems.join(" | ")}</p>}
                {momNextSteps.length > 0 && <p><span className="font-medium">Next Steps:</span> {momNextSteps.join(" | ")}</p>}
              </div>
            </div>
          )}
        </section>

        {snapshot.transcript && (
          <section className="rounded-xl border border-border p-5 space-y-3">
            <h2 className="text-lg font-semibold">Transcript</h2>
            <pre className="whitespace-pre-wrap text-sm leading-6 font-sans">{snapshot.transcript}</pre>
          </section>
        )}

        {snapshot.action_items.length > 0 && (
          <section className="rounded-xl border border-border p-5 space-y-3">
            <h2 className="text-lg font-semibold">Action Items</h2>
            <ul className="space-y-2 text-sm">
              {snapshot.action_items.map((item) => (
                <li key={item.id} className="flex items-start gap-2">
                  <span className="mt-0.5">{item.is_completed ? "✓" : "•"}</span>
                  <span className={item.is_completed ? "line-through text-muted-foreground" : ""}>{item.title}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
