import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useMeetingDetail(meetingId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!meetingId) return;

    const channel = supabase
      .channel(`sessions-live-${meetingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sessions",
          filter: `meeting_id=eq.${meetingId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["sessions", meetingId] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [meetingId, queryClient]);

  const meetingQuery = useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("id", meetingId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!meetingId,
  });

  const sessionsQuery = useQuery({
    queryKey: ["sessions", meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("meeting_id", meetingId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!meetingId,
    refetchInterval: (query) => {
      const rows = (query.state.data ?? []) as any[];
      const hasPending = rows.some((row) => {
        const status = (row?.processing_status ?? row?.analytics_data?.processing_status?.status ?? "").toLowerCase();
        return ["queued", "processing"].includes(status);
      });
      const hasFreshUploadAwaitingResults = rows.some((row) => {
        const status = (row?.processing_status ?? row?.analytics_data?.processing_status?.status ?? "").toLowerCase();
        const hasOutput = Boolean(row?.transcript) || row?.summary != null;
        return Boolean(row?.audio_file_url) && !hasOutput && status !== "failed" && status !== "completed";
      });
      return hasPending || hasFreshUploadAwaitingResults ? 3000 : false;
    },
  });

  const notesQuery = useQuery({
    queryKey: ["notes", meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("meeting_id", meetingId!)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!meetingId,
  });

  const aiChatsQuery = useQuery({
    queryKey: ["meeting_ai_chats", meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meeting_ai_chats")
        .select("*")
        .eq("meeting_id", meetingId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!meetingId,
  });

  const participantsQuery = useQuery({
    queryKey: ["participants", meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("meeting_id", meetingId!);
      if (error) throw error;
      return data;
    },
    enabled: !!meetingId,
  });

  const addNote = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from("notes").insert({ meeting_id: meetingId!, content });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes", meetingId] }),
  });

  const updateNote = useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
      const { error } = await supabase.from("notes").update({ content }).eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes", meetingId] }),
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes", meetingId] }),
  });

  const addAiChat = useMutation({
    mutationFn: async ({ question, answer, sessionId }: { question: string; answer: string; sessionId?: string }) => {
      const { error } = await supabase.from("meeting_ai_chats").insert({
        meeting_id: meetingId!,
        session_id: sessionId ?? null,
        user_id: user!.id,
        question,
        answer,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meeting_ai_chats", meetingId] }),
  });

  const addParticipant = useMutation({
    mutationFn: async ({ name, email }: { name: string; email?: string }) => {
      const { error } = await supabase.from("participants").insert({ meeting_id: meetingId!, name, email });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["participants", meetingId] }),
  });

  const updateSession = useMutation({
    mutationFn: async ({
      sessionId,
      transcript,
      summary,
    }: {
      sessionId: string;
      transcript?: string;
      summary?: Record<string, any>;
    }) => {
      const patch: Record<string, any> = {};
      if (typeof transcript === "string") patch.transcript = transcript;
      if (typeof summary !== "undefined") patch.summary = summary;
      const { error } = await supabase.from("sessions").update(patch).eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions", meetingId] }),
  });

  return {
    meetingQuery,
    sessionsQuery,
    notesQuery,
    aiChatsQuery,
    participantsQuery,
    addNote,
    updateNote,
    deleteNote,
    addAiChat,
    addParticipant,
    updateSession,
  };
}
