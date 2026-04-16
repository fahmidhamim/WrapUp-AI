import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useActionItems() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const actionItemsQuery = useQuery({
    queryKey: ["action_items", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("action_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 3000,
  });

  const createActionItem = useMutation({
    mutationFn: async ({ meetingId, title }: { meetingId: string; title: string }) => {
      const { data, error } = await supabase
        .from("action_items")
        .insert({ meeting_id: meetingId, owner_id: user!.id, title })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["action_items"] }),
  });

  const toggleActionItem = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { error } = await supabase.from("action_items").update({ is_completed }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["action_items"] }),
  });

  const deleteActionItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("action_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["action_items"] }),
  });

  // Realtime — placed after all hooks to maintain stable hook order
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("action-items-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "action_items" }, () => {
        queryClient.invalidateQueries({ queryKey: ["action_items"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  return { actionItemsQuery, createActionItem, toggleActionItem, deleteActionItem };
}
