import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Mic, MicOff, Phone, PhoneOff, Users, Loader2, Monitor, MonitorOff } from "lucide-react";
import { BackendRuntimeNotice } from "@/components/common/BackendRuntimeNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMeetings } from "@/hooks/useMeetings";
import { useAuth } from "@/hooks/useAuth";
import { useMeetingDetail } from "@/hooks/useMeetingDetail";
import { useActionItems } from "@/hooks/useActionItems";
import { useBackendRuntimeStatus } from "@/hooks/use-backend-runtime-status";
import { supabase } from "@/integrations/supabase/client";
import {
  getProcessStartErrorMessage,
  startSessionProcessing,
} from "@/lib/session-processing";
import { toast } from "sonner";

type SummaryPayload = {
  executive_summary?: string;
  key_points?: string[];
  action_items?: Array<{ task?: string; owner?: string; deadline?: string; confidence?: number }>;
  decisions?: string[];
  follow_ups?: string[];
};

function parseSummary(raw: unknown): SummaryPayload {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as SummaryPayload;
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") return raw as SummaryPayload;
  return {};
}

function deriveProcessingStatus(session: any): {
  status: string;
  message: string;
  progress: number;
} {
  if (!session) return { status: "idle", message: "", progress: 0 };
  const status = String(
    session.processing_status ??
      session.analytics_data?.processing_status?.status ??
      "idle",
  );
  const message = String(
    session.processing_message ??
      session.analytics_data?.processing_status?.message ??
      "",
  );
  const progress = Number(
    session.processing_progress ??
      session.analytics_data?.processing_status?.progress ??
      0,
  );
  return { status, message, progress: Number.isFinite(progress) ? progress : 0 };
}

export default function JoinMeetingPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { meetingsQuery, updateMeeting } = useMeetings();
  const { status: backendRuntimeStatus, retry: retryBackend } = useBackendRuntimeStatus();
  const [meetingCode, setMeetingCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [endingMeeting, setEndingMeeting] = useState(false);
  const [meetingEndedView, setMeetingEndedView] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const micStreamRef = useRef<MediaStream | null>(null);
  const systemStreamRef = useRef<MediaStream | null>(null);
  const mixedStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const systemSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      micStreamRef.current?.getTracks().forEach((track) => track.stop());
      systemStreamRef.current?.getTracks().forEach((track) => track.stop());
      mixedStreamRef.current?.getTracks().forEach((track) => track.stop());
      micSourceRef.current?.disconnect();
      systemSourceRef.current?.disconnect();
      audioDestinationRef.current = null;
      micSourceRef.current = null;
      systemSourceRef.current = null;
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close();
      }
    };
  }, []);

  const selectedMeeting = useMemo(() => {
    if (!id) return null;
    const meetings = meetingsQuery.data ?? [];
    return meetings.find((m) => m.id === id) ?? null;
  }, [id, meetingsQuery.data]);
  const { sessionsQuery } = useMeetingDetail(selectedMeeting?.id);
  const { actionItemsQuery } = useActionItems();
  const latestSession: any = sessionsQuery.data?.[0];
  const latestTranscript = latestSession?.transcript ?? "";
  const latestSummary = useMemo(
    () => parseSummary(latestSession?.summary),
    [latestSession?.summary],
  );
  const { status: processingStatus, message: processingMessage, progress: processingProgress } =
    deriveProcessingStatus(latestSession);
  const meetingActionItems = useMemo(
    () => (actionItemsQuery.data ?? []).filter((item: any) => item.meeting_id === selectedMeeting?.id),
    [actionItemsQuery.data, selectedMeeting?.id],
  );

  const scheduledAt = selectedMeeting?.scheduled_at ? new Date(selectedMeeting.scheduled_at) : null;
  const effectiveEndAt = selectedMeeting
    ? selectedMeeting.actual_ended_at
      ? new Date(selectedMeeting.actual_ended_at)
      : selectedMeeting.scheduled_end_at
      ? new Date(selectedMeeting.scheduled_end_at)
      : selectedMeeting.scheduled_at
      ? new Date(new Date(selectedMeeting.scheduled_at).getTime() + ((selectedMeeting.duration_minutes ?? 30) * 60 * 1000))
      : null
    : null;
  const hasEnded = !!effectiveEndAt && now >= effectiveEndAt;
  const canJoinScheduledMeeting = !!scheduledAt && now >= scheduledAt && !hasEnded;
  const canEndMeetingAsHost = !!selectedMeeting && !!user && selectedMeeting.owner_id === user.id;

  const joinAfterLabel = scheduledAt
    ? `${scheduledAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${scheduledAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
    : null;

  const endAtLabel = effectiveEndAt
    ? `${effectiveEndAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${effectiveEndAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
    : null;

  const startHostRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Audio recording is not supported in this browser.");
      return;
    }

    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    micStreamRef.current = micStream;

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const destination = audioContext.createMediaStreamDestination();
    audioDestinationRef.current = destination;
    const micSource = audioContext.createMediaStreamSource(micStream);
    micSourceRef.current = micSource;
    micSource.connect(destination);

    const mixedStream = destination.stream;
    mixedStreamRef.current = mixedStream;

    let recorder: MediaRecorder;
    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      recorder = new MediaRecorder(mixedStream, { mimeType: "audio/webm;codecs=opus" });
    } else {
      recorder = new MediaRecorder(mixedStream);
    }
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorderRef.current = recorder;
    recorder.start(1000);
  };

  const stopSystemAudioCapture = () => {
    systemSourceRef.current?.disconnect();
    systemSourceRef.current = null;
    systemStreamRef.current?.getTracks().forEach((track) => track.stop());
    systemStreamRef.current = null;
    setScreenSharing(false);
  };

  const startSystemAudioCapture = async ({ enableScreenShareUi }: { enableScreenShareUi: boolean }) => {
    if (systemSourceRef.current) {
      if (enableScreenShareUi) setScreenSharing(true);
      return;
    }
    if (!audioContextRef.current || !audioDestinationRef.current) {
      throw new Error("Recording is not active.");
    }
    const displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    systemStreamRef.current = displayStream;

    const audioTracks = displayStream.getAudioTracks();
    if (audioTracks.length === 0) {
      displayStream.getTracks().forEach((track) => track.stop());
      systemStreamRef.current = null;
      throw new Error("No device/tab audio was shared. Enable Share audio and try again.");
    }

    const audioTrack = audioTracks[0];
    const detach = () => {
      stopSystemAudioCapture();
    };
    audioTrack.onended = detach;
    displayStream.getVideoTracks().forEach((track) => {
      track.onended = detach;
    });

    const systemSource = audioContextRef.current.createMediaStreamSource(new MediaStream([audioTrack]));
    systemSourceRef.current = systemSource;
    systemSource.connect(audioDestinationRef.current);
    if (enableScreenShareUi) setScreenSharing(true);
  };

  const toggleScreenShare = async () => {
    if (screenSharing) {
      stopSystemAudioCapture();
      return;
    }
    try {
      await startSystemAudioCapture({ enableScreenShareUi: true });
      toast.success("Screen share started. Device/tab audio will be included.");
    } catch (error) {
      toast.error(getProcessStartErrorMessage(error, "Failed to start screen share"));
    }
  };

  const stopHostRecording = async (): Promise<Blob | null> => {
    const recorder = recorderRef.current;

    if (!recorder) return null;

    if (recorder.state === "recording") {
      recorder.requestData();
    }
    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    stopSystemAudioCapture();
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    mixedStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
    mixedStreamRef.current = null;
    micSourceRef.current?.disconnect();
    micSourceRef.current = null;
    audioDestinationRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      await audioContextRef.current.close();
    }
    audioContextRef.current = null;

    recorderRef.current = null;
    if (chunksRef.current.length === 0) return null;
    return new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
  };

  const uploadAndProcessMeetingAudio = async (audioBlob: Blob) => {
    if (!selectedMeeting || !user) return;

    const filePath = `${user.id}/${selectedMeeting.id}/${Date.now()}-join-call.webm`;
    const { error: uploadError } = await supabase.storage
      .from("meeting-files")
      .upload(filePath, audioBlob);
    if (uploadError) throw uploadError;

    const audioStorageRef = `meeting-files/${filePath}`;
    const { data: createdSession, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        meeting_id: selectedMeeting.id,
        audio_file_url: audioStorageRef,
      })
      .select("id")
      .single();
    if (sessionError) throw sessionError;

    const { data: authData } = await supabase.auth.getSession();
    const accessToken = authData.session?.access_token;
    if (!accessToken) throw new Error("Authentication session missing. Please log in again.");

    await startSessionProcessing(createdSession.id, accessToken);
  };

  const handleJoinScheduledMeeting = async () => {
    if (!selectedMeeting) return;
    if (!canJoinScheduledMeeting) return;
    try {
      if (canEndMeetingAsHost) {
        toast.info("Meeting recording started. Use the middle button to start screen share + device audio.");
        await startHostRecording();
      }
      setMeetingEndedView(false);
      setJoined(true);
    } catch (error) {
      toast.error(getProcessStartErrorMessage(error, "Failed to join meeting"));
    }
  };

  const handleLeaveOrEnd = async () => {
    if (!selectedMeeting || !canEndMeetingAsHost) {
      setMeetingEndedView(true);
      return;
    }

    setEndingMeeting(true);
    try {
      const audioBlob = await stopHostRecording();
      if (audioBlob && audioBlob.size > 0) {
        await uploadAndProcessMeetingAudio(audioBlob);
      }

      await updateMeeting.mutateAsync({
        id: selectedMeeting.id,
        actual_ended_at: new Date().toISOString(),
      });

      toast.success("Meeting ended. Transcript and summary are being generated.");
      setMeetingEndedView(true);
    } catch (error) {
      toast.error(getProcessStartErrorMessage(error, "Failed to end meeting"));
    } finally {
      setEndingMeeting(false);
    }
  };

  if (id && meetingsQuery.isLoading) {
    return <div className="glass rounded-xl p-6 text-sm text-muted-foreground">Loading meeting...</div>;
  }

  if (id && !selectedMeeting) {
    return <div className="glass rounded-xl p-6 text-sm text-muted-foreground">Meeting not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Join Meeting</h1>

      <BackendRuntimeNotice
        status={backendRuntimeStatus}
        onRetry={() => void retryBackend()}
      />

      {!joined ? (
        <div className="glass rounded-xl p-6 space-y-4">
          {selectedMeeting ? (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">Meeting</label>
                <Input value={selectedMeeting.title} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Scheduled Time</label>
                <Input value={joinAfterLabel ?? "-"} readOnly className="font-mono" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">End Time</label>
                <Input value={endAtLabel ?? "-"} readOnly className="font-mono" />
              </div>
              {canJoinScheduledMeeting ? (
                <Button
                  className="gradient-bg text-primary-foreground font-semibold w-full"
                  onClick={() => void handleJoinScheduledMeeting()}
                >
                  <Phone className="h-4 w-4 mr-2" /> Join
                </Button>
              ) : hasEnded ? (
                <p className="text-sm text-muted-foreground">
                  This meeting has ended.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Please join after {joinAfterLabel}.
                </p>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">Meeting ID</label>
                <Input
                  placeholder="Enter meeting ID..."
                  value={meetingCode}
                  onChange={e => setMeetingCode(e.target.value)}
                  className="font-mono"
                />
              </div>
              <Button
                className="gradient-bg text-primary-foreground font-semibold w-full"
                disabled={!meetingCode.trim()}
                onClick={() => {
                  setMeetingEndedView(false);
                  setJoined(true);
                }}
              >
                <Phone className="h-4 w-4 mr-2" /> Join Call
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="glass rounded-xl p-6 space-y-6">
          {!meetingEndedView ? (
            <>
              <div className="border border-border rounded-xl min-h-[300px] p-4">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Live Transcript</p>
                <p className="text-sm text-muted-foreground italic">
                  Transcript will appear here during the call...
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> Participants
                </p>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-primary-foreground">
                    Y
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  variant={micOn ? "outline" : "destructive"}
                  size="icon"
                  onClick={() => {
                    const next = !micOn;
                    micStreamRef.current?.getAudioTracks().forEach((track) => {
                      track.enabled = next;
                    });
                    setMicOn(next);
                  }}
                  className="rounded-full w-12 h-12"
                >
                  {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                <Button
                  variant={screenSharing ? "default" : "outline"}
                  size="icon"
                  onClick={() => void toggleScreenShare()}
                  className="rounded-full w-12 h-12"
                  disabled={endingMeeting || !canEndMeetingAsHost}
                  title={screenSharing ? "Stop screen share" : "Start screen share"}
                >
                  {screenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => void handleLeaveOrEnd()}
                  className="rounded-full w-12 h-12"
                  disabled={endingMeeting}
                >
                  {endingMeeting ? <Loader2 className="h-5 w-5 animate-spin" /> : <PhoneOff className="h-5 w-5" />}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-border p-4 space-y-3">
                <p className="text-sm font-semibold">Post-meeting insights</p>
                {(processingStatus === "queued" || processingStatus === "processing") && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {processingMessage || "Generating transcript and summary..."}
                    </p>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${Math.max(0, Math.min(100, processingProgress))}%` }}
                      />
                    </div>
                  </div>
                )}
                {processingStatus === "failed" && (
                  <p className="text-xs text-destructive">Processing failed. Please retry from Meeting Details.</p>
                )}
              </div>

              <div className="border border-border rounded-xl min-h-[220px] p-4">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Transcript</p>
                {latestTranscript ? (
                  <p className="text-sm whitespace-pre-wrap">{latestTranscript}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Transcript is not ready yet.</p>
                )}
              </div>

              <div className="border border-border rounded-xl p-4 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Summary</p>
                {latestSummary.executive_summary ? (
                  <p className="text-sm">{latestSummary.executive_summary}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Summary is not ready yet.</p>
                )}
                {Array.isArray(latestSummary.key_points) && latestSummary.key_points.length > 0 && (
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {latestSummary.key_points.map((point, idx) => (
                      <li key={`${point}-${idx}`}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border border-border rounded-xl p-4 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Action Items</p>
                {meetingActionItems.length > 0 ? (
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {meetingActionItems.map((item: any) => (
                      <li key={item.id}>{item.title}</li>
                    ))}
                  </ul>
                ) : Array.isArray(latestSummary.action_items) && latestSummary.action_items.length > 0 ? (
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {latestSummary.action_items.map((item, idx) => (
                      <li key={`summary-action-${idx}`}>
                        {typeof item === "string" ? item : (item.task ?? "Untitled action item")}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Action items are not ready yet.</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setJoined(false)}>
                  Back to meeting lobby
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
