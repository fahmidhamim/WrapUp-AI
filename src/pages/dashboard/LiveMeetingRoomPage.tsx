import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import wrapupLogo from "@/assets/logo-wrapup.png";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  MonitorUp,
  Smile,
  MoreHorizontal,
  MessageSquare,
  Users,
  PhoneOff,
  Share2,
  Circle as CircleIcon,
  Lock,
  Copy,
  Check,
  Send,
  Paperclip,
  Sparkles,
  ChevronDown,
  Signal,
  UserPlus,
} from "lucide-react";

const styles = `
@keyframes mr-speakingPulse {
  0%, 100% { border-color: rgba(16,185,129,0.85); box-shadow: 0 0 0 2px rgba(16,185,129,0.25); }
  50% { border-color: rgba(16,185,129,0.3); box-shadow: none; }
}
@keyframes mr-recPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.9); }
}
@keyframes mr-greenPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
@keyframes mr-floatUp {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-160px) scale(1.6); }
}
.mr-ctrl-btn { transition: all 0.15s ease; }
.mr-ctrl-btn:hover { transform: scale(1.05); filter: brightness(1.2); }
.mr-tile:hover { filter: brightness(1.08); }
.mr-tab-row {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  gap: 6px;
  padding: 10px 10px 0 10px;
  background: linear-gradient(180deg, rgba(14,14,26,0.85) 0%, rgba(14,14,26,0.65) 100%);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.mr-tab-row::after {
  content: "";
  position: absolute; left: 0; right: 0; bottom: -8px; height: 8px;
  background: linear-gradient(180deg, rgba(14,14,26,0.6), transparent);
  pointer-events: none;
}
.mr-tab-pill {
  flex: 1;
  min-width: 0;
  text-align: center;
  padding: 9px 6px 11px 6px;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  color: rgba(255,255,255,0.55);
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px 10px 0 0;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  position: relative;
  transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mr-tab-pill:hover { transform: translateY(-1px); }
.mr-tab-pill[data-color="purple"]:hover { color: #C4B5FD; background: rgba(167,139,250,0.12); border-color: rgba(167,139,250,0.28); box-shadow: 0 4px 14px -6px rgba(167,139,250,0.45); }
.mr-tab-pill[data-color="blue"]:hover   { color: #93C5FD; background: rgba(96,165,250,0.12);  border-color: rgba(96,165,250,0.28);  box-shadow: 0 4px 14px -6px rgba(96,165,250,0.45); }
.mr-tab-pill[data-color="teal"]:hover   { color: #5EEAD4; background: rgba(45,212,191,0.12);  border-color: rgba(45,212,191,0.28);  box-shadow: 0 4px 14px -6px rgba(45,212,191,0.45); }
.mr-tab-pill[data-color="pink"]:hover   { color: #F9A8D4; background: rgba(244,114,182,0.12); border-color: rgba(244,114,182,0.28); box-shadow: 0 4px 14px -6px rgba(244,114,182,0.45); }
.mr-tab-pill[data-color="amber"]:hover  { color: #FCD34D; background: rgba(251,191,36,0.12);  border-color: rgba(251,191,36,0.28);  box-shadow: 0 4px 14px -6px rgba(251,191,36,0.45); }
.mr-tab-pill.is-active[data-color="purple"] { color: #DDD6FE; background: linear-gradient(180deg, rgba(167,139,250,0.22), rgba(167,139,250,0.10)); border-color: rgba(167,139,250,0.45); box-shadow: 0 6px 20px -8px rgba(167,139,250,0.55), inset 0 0 0 1px rgba(167,139,250,0.18); }
.mr-tab-pill.is-active[data-color="blue"]   { color: #BFDBFE; background: linear-gradient(180deg, rgba(96,165,250,0.22), rgba(96,165,250,0.10));   border-color: rgba(96,165,250,0.45);   box-shadow: 0 6px 20px -8px rgba(96,165,250,0.55), inset 0 0 0 1px rgba(96,165,250,0.18); }
.mr-tab-pill.is-active[data-color="teal"]   { color: #99F6E4; background: linear-gradient(180deg, rgba(45,212,191,0.22), rgba(45,212,191,0.10));   border-color: rgba(45,212,191,0.45);   box-shadow: 0 6px 20px -8px rgba(45,212,191,0.55), inset 0 0 0 1px rgba(45,212,191,0.18); }
.mr-tab-pill.is-active[data-color="pink"]   { color: #FBCFE8; background: linear-gradient(180deg, rgba(244,114,182,0.22), rgba(244,114,182,0.10)); border-color: rgba(244,114,182,0.45); box-shadow: 0 6px 20px -8px rgba(244,114,182,0.55), inset 0 0 0 1px rgba(244,114,182,0.18); }
.mr-tab-pill.is-active[data-color="amber"]  { color: #FDE68A; background: linear-gradient(180deg, rgba(251,191,36,0.22), rgba(251,191,36,0.10));   border-color: rgba(251,191,36,0.45);   box-shadow: 0 6px 20px -8px rgba(251,191,36,0.55), inset 0 0 0 1px rgba(251,191,36,0.18); }
.mr-popup-item:hover { background: rgba(255,255,255,0.06) !important; }
.mr-leave-btn:hover { background: #dc2626 !important; }
.mr-leave-arrow:hover { background: #dc2626 !important; }
.mr-invite:hover { background: rgba(255,255,255,0.04) !important; }
.mr-msg-input:focus { border-color: #6C3FE6 !important; }
.mr-scroll::-webkit-scrollbar { width: 4px; }
.mr-scroll::-webkit-scrollbar-track { background: transparent; }
.mr-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
`;

type Participant = {
  id: number;
  name: string;
  initials: string;
  color: string;
  isYou?: boolean;
  micOn: boolean;
  camOn: boolean;
  speaking?: boolean;
  role?: "Host" | "Co-host";
};

const PARTICIPANTS: Participant[] = [
  { id: 1, name: "Hamim", initials: "HA", color: "#6C3FE6", isYou: true, micOn: true, camOn: true, role: "Host" },
  { id: 2, name: "Rafiq K.", initials: "RK", color: "#2563EB", micOn: true, camOn: false },
  { id: 3, name: "Sara A.", initials: "SA", color: "#0D9488", micOn: true, camOn: true, speaking: true },
  { id: 4, name: "Nabil M.", initials: "NM", color: "#D97706", micOn: false, camOn: false },
  { id: 5, name: "Jannatul L.", initials: "JL", color: "#DB2777", micOn: true, camOn: true },
  { id: 6, name: "Tanvir F.", initials: "TF", color: "#7C3AED", micOn: false, camOn: true },
];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

function Avatar({ p, size = 32 }: { p: Participant; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: p.color,
        color: "white",
        fontSize: Math.max(10, Math.round(size * 0.36)),
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {p.initials}
    </div>
  );
}

function VideoTile({ p, isScreenShareSmall }: { p: Participant; isScreenShareSmall?: boolean }) {
  const speakingStyle: React.CSSProperties = p.speaking
    ? { animation: "mr-speakingPulse 1.5s ease infinite" }
    : {};
  return (
    <div
      className="mr-tile"
      style={{
        background: "#141828",
        borderRadius: 12,
        ...(isScreenShareSmall ? { aspectRatio: "16 / 9" } : { width: "100%", height: "100%", minHeight: 0 }),
        position: "relative",
        overflow: "hidden",
        border: "2px solid transparent",
        transition: "filter 0.15s ease",
        ...speakingStyle,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: p.camOn
            ? `radial-gradient(circle at 50% 50%, ${p.color}22 0%, #141828 70%)`
            : "#141828",
        }}
      >
        <Avatar p={p} size={isScreenShareSmall ? 32 : 48} />
      </div>

      {!p.camOn && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(0,0,0,0.5)",
            borderRadius: 6,
            padding: 4,
            color: "rgba(255,255,255,0.7)",
            display: "flex",
          }}
        >
          <VideoOff size={12} />
        </div>
      )}
      {!p.micOn && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            background: "#EF4444",
            borderRadius: 6,
            padding: 4,
            color: "white",
            display: "flex",
          }}
        >
          <MicOff size={12} />
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          background: "rgba(0,0,0,0.6)",
          borderRadius: 6,
          padding: "4px 10px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: "white",
        }}
      >
        <span>
          {p.name}
          {p.isYou && " (You)"}
        </span>
        {p.micOn ? (
          <Mic size={11} color="#10B981" />
        ) : (
          <MicOff size={11} color="#EF4444" />
        )}
      </div>
    </div>
  );
}

function ScreenShareTile() {
  return (
    <div
      style={{
        background: "#0E0E1A",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        color: "rgba(255,255,255,0.55)",
      }}
    >
      <Monitor size={48} />
      <div style={{ fontSize: 14 }}>Screen share</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Sara A. is presenting</div>
    </div>
  );
}

type TabKey = "participants" | "chat" | "transcript" | "ai" | "notes";

function ControlButton({
  icon,
  label,
  active,
  danger,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
  badge?: string;
}) {
  const bg = danger
    ? "#EF4444"
    : active
    ? "#10B981"
    : "#1E1E2E";
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, position: "relative" }}
    >
      <div
        className="mr-ctrl-btn"
        onClick={onClick}
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: bg,
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "white",
          position: "relative",
        }}
      >
        {icon}
        {badge && (
          <div
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              borderRadius: 999,
              background: "#EF4444",
              color: "white",
              fontSize: 10,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #0E0E1A",
            }}
          >
            {badge}
          </div>
        )}
      </div>
      <span
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.65)",
          marginTop: 4,
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function LiveMeetingRoomPage() {
  const navigate = useNavigate();
  const { meetingId = "wrapup-demo-2026" } = useParams();

  const [seconds, setSeconds] = useState(5025); // start at 01:23:45
  const [activeTab, setActiveTab] = useState<TabKey>("participants");
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showLeaveMenu, setShowLeaveMenu] = useState(false);
  const [unread, setUnread] = useState(true);
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState("");
  const [floaters, setFloaters] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const floaterIdRef = useRef(0);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const popoverRootRef = useRef<HTMLDivElement | null>(null);
  const leaveRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!showReactions && !showMore && !showLeaveMenu) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRootRef.current?.contains(target)) return;
      if (leaveRootRef.current?.contains(target)) return;
      setShowReactions(false);
      setShowMore(false);
      setShowLeaveMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showReactions, showMore, showLeaveMenu]);

  const you = useMemo(() => PARTICIPANTS.find((p) => p.isYou)!, []);

  const handleCopy = () => {
    navigator.clipboard?.writeText(meetingId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerEmoji = (emoji: string) => {
    const id = ++floaterIdRef.current;
    const left = 20 + Math.random() * 60;
    setFloaters((f) => [...f, { id, emoji, left }]);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 2100);
  };

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === "chat") setUnread(false);
  };

  const goLeave = () => navigate("/join-meeting");

  return (
    <>
      <style>{styles}</style>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#080810",
          color: "white",
          fontFamily: "inherit",
          overflow: "hidden",
        }}
      >
        {/* TOP BAR */}
        <div
          style={{
            height: 56,
            background: "#0E0E1A",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={wrapupLogo}
              alt="WrapUp"
              onClick={() => navigate("/dashboard")}
              style={{
                height: 28,
                width: "auto",
                cursor: "pointer",
                display: "block",
              }}
            />
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
            <span style={{ fontSize: 14, color: "white", fontWeight: 500 }}>Team Standup</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: 999,
                fontSize: 11,
                color: "rgba(255,255,255,0.65)",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#10B981",
                  animation: "mr-greenPulse 1.5s ease infinite",
                }}
              />
              In progress
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 500,
              color: "#EF4444",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#EF4444",
                animation: "mr-recPulse 1.2s ease infinite",
              }}
            />
            {formatTime(seconds)}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
              <Users size={14} />
              <span>{PARTICIPANTS.length} participants</span>
            </div>
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
            <button
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                padding: "6px 10px",
                color: "white",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <Share2 size={14} />
              Share
            </button>
            <button
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                padding: "6px 10px",
                color: "white",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <CircleIcon size={12} fill="#EF4444" color="#EF4444" />
              Record
            </button>
            <button
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                padding: 6,
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                display: "flex",
              }}
            >
              <Lock size={14} />
            </button>
            <Avatar p={you} size={32} />
          </div>
        </div>

        {/* MAIN */}
        <div style={{ flex: 1, display: "flex", flexDirection: "row", minHeight: 0 }}>
          {/* LEFT COLUMN: video grid + control bar stacked */}
          <div
            style={{
              flex: "1 1 auto",
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              minHeight: 0,
            }}
          >
          {/* VIDEO GRID */}
          <div
            ref={gridRef}
            style={{
              flex: 1,
              background: "#080810",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              position: "relative",
              minHeight: 0,
            }}
          >
            {screenShare ? (
              <>
                <div style={{ flex: "0 0 70%", minHeight: 0 }}>
                  <ScreenShareTile />
                </div>
                <div
                  style={{
                    flex: "0 0 30%",
                    display: "grid",
                    gridTemplateColumns: `repeat(${PARTICIPANTS.length}, 1fr)`,
                    gap: 8,
                  }}
                >
                  {PARTICIPANTS.map((p) => (
                    <VideoTile key={p.id} p={p} isScreenShareSmall />
                  ))}
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gridTemplateRows: "repeat(2, 1fr)",
                  gap: 8,
                  alignContent: "stretch",
                  width: "100%",
                  height: "100%",
                  minHeight: 0,
                }}
              >
                {PARTICIPANTS.map((p) => (
                  <VideoTile key={p.id} p={p} />
                ))}
              </div>
            )}

            {/* floating emoji reactions */}
            {floaters.map((f) => (
              <div
                key={f.id}
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: `${f.left}%`,
                  fontSize: 32,
                  pointerEvents: "none",
                  animation: "mr-floatUp 2s ease-out forwards",
                }}
              >
                {f.emoji}
              </div>
            ))}
          </div>

          {/* CONTROL BAR — placed inside left column so it spans only the video area */}
          <div
            style={{
              height: 72,
              background: "#0E0E1A",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, position: "relative" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Meeting ID:</span>
              <span style={{ color: "white", fontFamily: "monospace" }}>{meetingId}</span>
              <div onClick={handleCopy} style={{ cursor: "pointer", color: "rgba(255,255,255,0.55)", display: "flex", position: "relative" }}>
                {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                {copied && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 6px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#1E1E2E",
                      color: "white",
                      fontSize: 10,
                      padding: "3px 8px",
                      borderRadius: 6,
                      whiteSpace: "nowrap",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    Copied!
                  </div>
                )}
              </div>
            </div>

            <div ref={popoverRootRef} style={{ display: "flex", gap: 8, alignItems: "flex-start", position: "relative" }}>
              <ControlButton
                icon={muted ? <MicOff size={20} /> : <Mic size={20} />}
                label={muted ? "Unmute" : "Mute"}
                danger={muted}
                onClick={() => setMuted((m) => !m)}
              />
              <ControlButton
                icon={camOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}
                label={camOff ? "Start video" : "Stop video"}
                danger={camOff}
                onClick={() => setCamOff((c) => !c)}
              />
              <ControlButton
                icon={<MonitorUp size={20} />}
                label="Share screen"
                active={screenShare}
                onClick={() => setScreenShare((s) => !s)}
              />

              <div style={{ position: "relative" }}>
                <ControlButton
                  icon={<Smile size={20} />}
                  label="React"
                  onClick={() => {
                    setShowReactions((s) => !s);
                    setShowMore(false);
                  }}
                />
                {showReactions && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 8px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#1E1E2E",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      padding: 8,
                      display: "flex",
                      gap: 4,
                      zIndex: 5,
                    }}
                  >
                    {["👍", "❤️", "😂", "😮", "👏", "🎉"].map((e) => (
                      <div
                        key={e}
                        onClick={() => {
                          triggerEmoji(e);
                          setShowReactions(false);
                        }}
                        className="mr-popup-item"
                        style={{
                          fontSize: 22,
                          padding: 4,
                          borderRadius: 6,
                          cursor: "pointer",
                          transition: "background 0.15s ease",
                        }}
                      >
                        {e}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ position: "relative" }}>
                <ControlButton
                  icon={<MoreHorizontal size={20} />}
                  label="More"
                  onClick={() => {
                    setShowMore((s) => !s);
                    setShowReactions(false);
                  }}
                />
                {showMore && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 8px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#1E1E2E",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      padding: 4,
                      minWidth: 180,
                      zIndex: 5,
                    }}
                  >
                    {[
                      { label: "Blur background", action: () => {} },
                      { label: "Virtual background", action: () => {} },
                      {
                        label: "Full screen",
                        action: () => document.documentElement.requestFullscreen?.().catch(() => {}),
                      },
                      { label: "Keyboard shortcuts", action: () => {} },
                      { label: "Report a problem", action: () => {} },
                    ].map((o) => (
                      <div
                        key={o.label}
                        onClick={() => {
                          o.action();
                          setShowMore(false);
                        }}
                        className="mr-popup-item"
                        style={{
                          fontSize: 13,
                          padding: "8px 12px",
                          borderRadius: 6,
                          cursor: "pointer",
                          color: "white",
                          transition: "background 0.15s ease",
                        }}
                      >
                        {o.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <ControlButton
                icon={<MessageSquare size={20} />}
                label="Chat"
                badge={unread ? "3" : undefined}
                onClick={() => switchTab("chat")}
              />
              <ControlButton
                icon={<Users size={20} />}
                label="People"
                onClick={() => switchTab("participants")}
              />
            </div>

            <div ref={leaveRootRef} style={{ display: "flex", alignItems: "stretch", gap: 0, position: "relative" }}>
              <div
                className="mr-leave-btn"
                onClick={goLeave}
                style={{
                  background: "#EF4444",
                  borderRadius: "12px 0 0 12px",
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "background 0.15s ease",
                }}
              >
                <PhoneOff size={16} />
                Leave Meeting
              </div>
              <div
                className="mr-leave-arrow"
                onClick={() => setShowLeaveMenu((s) => !s)}
                style={{
                  background: "#EF4444",
                  borderRadius: "0 12px 12px 0",
                  width: 36,
                  color: "white",
                  cursor: "pointer",
                  borderLeft: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s ease",
                }}
              >
                <ChevronDown size={14} />
              </div>
              {showLeaveMenu && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "calc(100% + 8px)",
                    right: 0,
                    background: "#1E1E2E",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    padding: 4,
                    minWidth: 200,
                    zIndex: 5,
                  }}
                >
                  {[
                    { label: "Leave meeting" },
                    { label: "End meeting for all" },
                  ].map((o) => (
                    <div
                      key={o.label}
                      onClick={() => {
                        setShowLeaveMenu(false);
                        goLeave();
                      }}
                      className="mr-popup-item"
                      style={{
                        fontSize: 13,
                        padding: "8px 12px",
                        borderRadius: 6,
                        cursor: "pointer",
                        color: "white",
                        transition: "background 0.15s ease",
                      }}
                    >
                      {o.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>
          {/* /LEFT COLUMN */}

          {/* RIGHT PANEL */}
          <div
            style={{
              flex: "1 1 35%",
              maxWidth: "35%",
              background: "#0E0E1A",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            <div className="mr-tab-row">
              {(
                [
                  { k: "participants", label: "Participants", color: "purple" },
                  { k: "chat", label: "Chat", color: "blue" },
                  { k: "transcript", label: "Transcript", color: "teal" },
                  { k: "ai", label: "AI Summary", color: "pink" },
                  { k: "notes", label: "Notes", color: "amber" },
                ] as { k: TabKey; label: string; color: string }[]
              ).map((t) => {
                const active = activeTab === t.k;
                return (
                  <div
                    key={t.k}
                    data-color={t.color}
                    className={`mr-tab-pill${active ? " is-active" : ""}`}
                    onClick={() => switchTab(t.k)}
                  >
                    {t.label}
                  </div>
                );
              })}
            </div>

            <div className="mr-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              {activeTab === "participants" && (
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.55)",
                      padding: "12px 16px",
                    }}
                  >
                    In this meeting ({PARTICIPANTS.length})
                  </div>
                  {PARTICIPANTS.map((p) => (
                    <div
                      key={p.id}
                      className="mr-invite"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "8px 16px",
                        gap: 10,
                        cursor: "default",
                      }}
                    >
                      <Avatar p={p} size={32} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: "white", display: "flex", alignItems: "center", gap: 6 }}>
                          {p.name}
                          {p.isYou && <span style={{ color: "rgba(255,255,255,0.45)" }}>(You)</span>}
                        </div>
                        {p.role && (
                          <div style={{ marginTop: 3 }}>
                            <span
                              style={{
                                fontSize: 10,
                                padding: "2px 6px",
                                borderRadius: 999,
                                background:
                                  p.role === "Host"
                                    ? "rgba(108,63,230,0.2)"
                                    : "rgba(37,99,235,0.2)",
                                color: p.role === "Host" ? "#A78BFA" : "#60A5FA",
                                fontWeight: 500,
                              }}
                            >
                              {p.role}
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        {p.micOn ? (
                          <Mic size={16} color={p.speaking ? "#10B981" : "#10B981"} />
                        ) : (
                          <MicOff size={16} color="#EF4444" />
                        )}
                        {p.camOn ? (
                          <VideoIcon size={16} color="#10B981" />
                        ) : (
                          <VideoOff size={16} color="rgba(255,255,255,0.4)" />
                        )}
                        <Signal size={16} color="#10B981" />
                      </div>
                    </div>
                  ))}
                  <div
                    className="mr-invite"
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8,
                      padding: "8px 16px",
                      margin: "8px 16px",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.65)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <UserPlus size={14} />
                    <span>+ Invite people</span>
                  </div>
                </div>
              )}

              {activeTab === "chat" && (
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* msg 1 */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <Avatar p={PARTICIPANTS[1]} size={28} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                          Rafiq K. <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>2 min ago</span>
                        </div>
                        <div style={{ fontSize: 13, color: "white", marginTop: 2 }}>Can everyone see my screen?</div>
                      </div>
                    </div>
                    {/* msg 2 from you */}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ maxWidth: "75%" }}>
                        <div
                          style={{
                            background: "#6C3FE6",
                            borderRadius: "12px 12px 2px 12px",
                            padding: "8px 12px",
                            fontSize: 13,
                            color: "white",
                          }}
                        >
                          Yes, looks clear!
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3, textAlign: "right" }}>
                          1 min ago
                        </div>
                      </div>
                    </div>
                    {/* msg 3 */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <Avatar p={PARTICIPANTS[2]} size={28} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>Sara A.</div>
                        <div style={{ fontSize: 13, color: "white", marginTop: 2 }}>
                          I'll share the Q3 report link after this call
                        </div>
                      </div>
                    </div>
                    {/* msg 4 */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <Avatar p={PARTICIPANTS[3]} size={28} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>Nabil M.</div>
                        <div style={{ fontSize: 13, color: "white", marginTop: 2 }}>Sure, thanks Sara 👍</div>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      padding: "12px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        className="mr-msg-input"
                        placeholder="Type a message..."
                        style={{
                          flex: 1,
                          background: "#141828",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 20,
                          padding: "8px 14px",
                          fontSize: 13,
                          color: "white",
                          outline: "none",
                          transition: "border-color 0.15s ease",
                        }}
                      />
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "#6C3FE6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <Send size={14} color="white" />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, color: "rgba(255,255,255,0.45)" }}>
                      <Smile size={14} style={{ cursor: "pointer" }} />
                      <Paperclip size={14} style={{ cursor: "pointer" }} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "transcript" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500, color: "white" }}>Live Transcript</span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 999,
                        background: "rgba(16,185,129,0.15)",
                        color: "#10B981",
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#10B981",
                          animation: "mr-greenPulse 1.5s ease infinite",
                        }}
                      />
                      Live
                    </span>
                  </div>
                  <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                      { p: PARTICIPANTS[0], time: "00:01:23", text: "Good morning everyone, let's get started with the standup. Who wants to go first?" },
                      { p: PARTICIPANTS[1], time: "00:01:45", text: "I'll go. Yesterday I finished the API integration for the upload endpoint." },
                      { p: PARTICIPANTS[2], time: "00:02:12", text: "The design review went well. Client approved the new dashboard mockups.", current: true },
                      { p: PARTICIPANTS[3], time: "00:02:48", text: "I'm still working on the Bengali language detection fix. Should be done by tomorrow." },
                      { p: PARTICIPANTS[0], time: "00:03:15", text: "Perfect. Any blockers anyone wants to raise before we close?" },
                    ].map((entry, idx, arr) => (
                      <div
                        key={idx}
                        style={{
                          paddingLeft: entry.current ? 10 : 0,
                          borderLeft: entry.current ? "2px solid #6C3FE6" : "none",
                          paddingBottom: idx < arr.length - 1 ? 12 : 0,
                          borderBottom:
                            idx < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar p={entry.p} size={24} />
                          <span style={{ fontSize: 12, color: entry.p.color, fontWeight: 500 }}>
                            {entry.p.name}
                          </span>
                          <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                            {entry.time}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: "white", lineHeight: 1.6, marginTop: 6 }}>
                          {entry.text}
                        </div>
                      </div>
                    ))}
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: 6 }}>
                      Transcript is AI-generated and may contain errors
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div style={{ padding: 16 }}>
                  <div
                    style={{
                      background: "rgba(108,63,230,0.08)",
                      border: "1px solid rgba(108,63,230,0.2)",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <Sparkles size={14} color="#A78BFA" />
                      <span style={{ fontSize: 13, color: "#A78BFA", fontWeight: 500 }}>Live Summary</span>
                    </div>
                    <div style={{ fontSize: 13, color: "white", lineHeight: 1.7 }}>
                      The team is conducting their daily standup. Rafiq completed the API integration. Sara
                      received client approval on dashboard designs. Nabil is resolving the Bengali detection
                      issue.
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.45)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 8,
                      }}
                    >
                      Key Points
                    </div>
                    {[
                      "API integration endpoint completed",
                      "Dashboard designs approved by client",
                      "Bengali detection fix in progress",
                    ].map((kp) => (
                      <div key={kp} style={{ fontSize: 13, color: "white", padding: "4px 0", display: "flex", gap: 8 }}>
                        <span style={{ color: "#6C3FE6" }}>•</span>
                        <span>{kp}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.45)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 8,
                      }}
                    >
                      Action Items
                    </div>
                    {[
                      { text: "Share Q3 report link", who: "Sara" },
                      { text: "Complete Bengali fix", who: "Nabil" },
                    ].map((a) => (
                      <div
                        key={a.text}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 13,
                          color: "white",
                          padding: "4px 0",
                        }}
                      >
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 3,
                            border: "1.5px solid rgba(255,255,255,0.35)",
                            flexShrink: 0,
                          }}
                        />
                        <span>{a.text}</span>
                        <span style={{ color: "rgba(255,255,255,0.5)", marginLeft: "auto" }}>— {a.who}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.45)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 8,
                      }}
                    >
                      Decisions
                    </div>
                    <div style={{ fontSize: 13, color: "white", padding: "4px 0" }}>
                      • Next standup tomorrow at 10 AM
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Take personal notes here... They're only visible to you."
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "white",
                    fontSize: 13,
                    lineHeight: 1.8,
                    padding: 16,
                    width: "100%",
                    height: "100%",
                    minHeight: 300,
                    outline: "none",
                    resize: "none",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onBlur={(e) => (e.currentTarget.style.background = "transparent")}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
