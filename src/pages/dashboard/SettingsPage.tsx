import { Bell, Palette, RotateCcw, Settings } from "lucide-react";
import { usePalette, presets, defaultPaletteColors, type CustomColors } from "@/components/providers/PaletteProvider";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type SettingsTab = "appearance" | "notifications";

const NOTIF_STORAGE_KEY = "wrapup:notification-prefs";

interface NotificationPrefs {
  summaryReady: boolean;
  weeklyDigest: boolean;
  meetingShared: boolean;
  upcomingReminder: boolean;
  processingFailed: boolean;
}

const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  summaryReady: true,
  weeklyDigest: true,
  meetingShared: true,
  upcomingReminder: false,
  processingFailed: true,
};

function loadNotifPrefs(): NotificationPrefs {
  try {
    const raw = window.localStorage.getItem(NOTIF_STORAGE_KEY);
    if (raw) return { ...DEFAULT_NOTIF_PREFS, ...(JSON.parse(raw) as Partial<NotificationPrefs>) };
  } catch { /* ignore */ }
  return { ...DEFAULT_NOTIF_PREFS };
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <label className="relative w-10 h-10 rounded-lg border border-border overflow-hidden cursor-pointer shrink-0">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
        />
        <div className="w-full h-full" style={{ backgroundColor: value }} />
      </label>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground font-mono uppercase">{value}</p>
      </div>
    </div>
  );
}

function NotifRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="shrink-0 mt-0.5" />
    </div>
  );
}

export default function SettingsPage() {
  const { colors, setColors } = usePalette();
  const [draft, setDraft] = useState<CustomColors>(colors);
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(() => loadNotifPrefs());

  useEffect(() => {
    try {
      window.localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifPrefs));
    } catch { /* ignore */ }
  }, [notifPrefs]);

  const updateNotif = (key: keyof NotificationPrefs, value: boolean) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const updateDraft = (key: keyof CustomColors, value: string) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    setColors(next);
  };

  const applyPreset = (preset: CustomColors) => {
    setDraft(preset);
    setColors(preset);
  };

  const tabs: { id: SettingsTab; label: string; icon: typeof Palette }[] = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border/40">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors relative -mb-px",
              activeTab === t.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "appearance" && (
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Palette className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Card Palette</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Customize the colors for your dashboard cards. Pick a preset or choose your own.
            </p>

            <div className="mb-6">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Presets</p>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p.colors)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-primary/40 transition-colors text-xs font-medium text-foreground"
                  >
                    <div className="flex -space-x-1">
                      <div className="w-4 h-4 rounded-full border border-background" style={{ backgroundColor: p.colors.cardBg }} />
                      <div className="w-4 h-4 rounded-full border border-background" style={{ backgroundColor: p.colors.cardBorder }} />
                    </div>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4 rounded-xl border border-border bg-secondary p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Card Colors</p>
                <ColorField label="Background" value={draft.cardBg} onChange={(v) => updateDraft("cardBg", v)} />
                <ColorField label="Hover Background" value={draft.cardHoverBg} onChange={(v) => updateDraft("cardHoverBg", v)} />
              </div>
              <div className="space-y-4 rounded-xl border border-border bg-secondary p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Accent Colors</p>
                <ColorField label="Border" value={draft.cardBorder} onChange={(v) => updateDraft("cardBorder", v)} />
                <ColorField label="Glow / Shadow" value={draft.cardGlow} onChange={(v) => updateDraft("cardGlow", v)} />
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Preview</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {["Card Preview 1", "Card Preview 2", "Card Preview 3"].map((label) => (
                  <div
                    key={label}
                    className="rounded-xl p-5 transition-all duration-300 cursor-default"
                    style={{ backgroundColor: draft.cardBg, border: `1px solid ${draft.cardBorder}33` }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = draft.cardHoverBg;
                      e.currentTarget.style.boxShadow = `0 0 30px -8px ${draft.cardGlow}40`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = draft.cardBg;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <p className="text-xs text-muted-foreground mb-2">{label}</p>
                    <p className="text-2xl font-bold text-foreground">42</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => applyPreset(defaultPaletteColors)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to default
            </button>
          </div>

          <div className="rounded-xl border border-border bg-secondary p-12 text-center">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">More Settings</h2>
            <p className="text-sm text-muted-foreground">
              Account preferences and integrations will be configurable here.
            </p>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="space-y-8 max-w-2xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Email Notifications</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Choose which emails you receive from WrapUp. Changes are saved automatically.
            </p>

            <div className="space-y-3">
              <NotifRow
                label="Summary ready"
                description="Get an email when your meeting transcript and summary have finished processing."
                checked={notifPrefs.summaryReady}
                onChange={(v) => updateNotif("summaryReady", v)}
              />
              <NotifRow
                label="Weekly digest"
                description="A weekly round-up of your meetings, top action items, and engagement highlights."
                checked={notifPrefs.weeklyDigest}
                onChange={(v) => updateNotif("weeklyDigest", v)}
              />
              <NotifRow
                label="Meeting shared with me"
                description="Notify me when someone shares a meeting recording or summary with my account."
                checked={notifPrefs.meetingShared}
                onChange={(v) => updateNotif("meetingShared", v)}
              />
              <NotifRow
                label="Upcoming meeting reminders"
                description="Send a reminder email 15 minutes before a scheduled meeting starts."
                checked={notifPrefs.upcomingReminder}
                onChange={(v) => updateNotif("upcomingReminder", v)}
              />
              <NotifRow
                label="Processing failed"
                description="Alert me if transcription or summary generation fails so I can retry."
                checked={notifPrefs.processingFailed}
                onChange={(v) => updateNotif("processingFailed", v)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-primary/5 px-5 py-4 flex items-start gap-3">
            <Bell className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Notification delivery is managed by WrapUp's email service. Preferences are stored locally and will be applied to your account on the next sync.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
