import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "./useAuth";

type MeetingUpdate = Pick<
  Database["public"]["Tables"]["meetings"]["Update"],
  "title" | "scheduled_at" | "scheduled_end_at" | "actual_ended_at" | "duration_minutes"
>;
type MeetingInsert = Database["public"]["Tables"]["meetings"]["Insert"];

export function useMeetings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const meetingsQuery = useQuery({
    queryKey: ["meetings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Realtime subscription for live updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("meetings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "meetings" }, () => {
        queryClient.invalidateQueries({ queryKey: ["meetings"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const createMeeting = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .from("meetings")
        .insert({ title, owner_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meetings"] }),
  });

  const updateMeeting = useMutation({
    mutationFn: async (payload: { id: string; title?: string; scheduled_at?: string; scheduled_end_at?: string; actual_ended_at?: string; duration_minutes?: number }) => {
      const { id, ...rest } = payload;
      const { error } = await supabase.from("meetings").update(rest as MeetingUpdate).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meetings"] }),
  });

  const deleteMeeting = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("meetings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meetings"] }),
  });

  const scheduleMeeting = useMutation({
    mutationFn: async ({ title, scheduledAt, scheduledEndAt }: { title: string; scheduledAt: string; scheduledEndAt: string }) => {
      const { data, error } = await supabase
        .from("meetings")
        .insert({ title, owner_id: user!.id, scheduled_at: scheduledAt, scheduled_end_at: scheduledEndAt } as MeetingInsert)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meetings"] }),
  });

  return { meetingsQuery, createMeeting, updateMeeting, deleteMeeting, scheduleMeeting };
}
