import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2, Pencil, Video, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMeetings } from "@/hooks/useMeetings";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function MeetingsPage() {
  const { meetingsQuery, createMeeting, updateMeeting, deleteMeeting } = useMeetings();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  useEffect(() => {
    if (searchParams.get("new") === "true") setCreateOpen(true);
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const meetings = (meetingsQuery.data ?? []).filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const scheduledStart = m.scheduled_at ? new Date(m.scheduled_at) : null;
    const scheduledEnd =
      m.actual_ended_at
        ? new Date(m.actual_ended_at)
        : m.scheduled_end_at
        ? new Date(m.scheduled_end_at)
        : scheduledStart
        ? new Date(scheduledStart.getTime() + ((m.duration_minutes ?? 30) * 60 * 1000))
        : null;
    const isScheduledAndNotEnded = !!(scheduledStart && scheduledEnd && scheduledEnd >= now);
    return matchesSearch && !isScheduledAndNotEnded;
  });

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createMeeting.mutateAsync(newTitle.trim());
    setNewTitle("");
    setCreateOpen(false);
    toast.success("Meeting created!");
  };

  const handleRename = async () => {
    if (!renameId || !renameTitle.trim()) return;
    await updateMeeting.mutateAsync({ id: renameId, title: renameTitle.trim() });
    setRenameId(null);
    toast.success("Meeting renamed!");
  };

  const handleDelete = async (id: string) => {
    await deleteMeeting.mutateAsync(id);
    toast.success("Meeting deleted!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Meetings</h1>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search meetings..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {meetingsQuery.isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : meetings.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-muted-foreground">
          {search ? "No meetings match your search." : "No meetings yet. Create one to get started!"}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-xl p-5 hover:glow transition-shadow group"
            >
              <Link to={`/dashboard/meetings/${m.id}`} className="block">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
                    <Video className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.preventDefault()}>
                    <button className="p-1.5 rounded-md hover:bg-accent" onClick={() => { setRenameId(m.id); setRenameTitle(m.title); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(m.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-sm mb-1">{m.title}</h3>
                <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-2">ID: {m.id.slice(0, 8)}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Meeting</DialogTitle></DialogHeader>
          <Input placeholder="Meeting title" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreate()} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="gradient-bg text-primary-foreground" onClick={handleCreate} disabled={createMeeting.isPending}>
              {createMeeting.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={!!renameId} onOpenChange={() => setRenameId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename Meeting</DialogTitle></DialogHeader>
          <Input value={renameTitle} onChange={e => setRenameTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && handleRename()} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameId(null)}>Cancel</Button>
            <Button className="gradient-bg text-primary-foreground" onClick={handleRename} disabled={updateMeeting.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
