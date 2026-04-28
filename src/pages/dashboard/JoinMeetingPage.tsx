import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mic,
  Video as VideoIcon,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const styles = `
@keyframes wavebar {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}
@keyframes glowPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.85; }
}
.jm-input:focus { border-color: #6C3FE6 !important; }
.jm-quick-btn:hover { background: rgba(255,255,255,0.08) !important; }
.jm-join-btn:hover { background: #5530d4 !important; }
.jm-help-link:hover { opacity: 0.85; }
`;

function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 36,
        height: 20,
        borderRadius: 999,
        background: on ? "#6C3FE6" : "rgba(255,255,255,0.15)",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.15s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: on ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.15s ease",
        }}
      />
    </div>
  );
}

function MeetingIllustration() {
  const tiles = [
    { color: "#6C3FE6", initials: "HA" },
    { color: "#2563EB", initials: "RK" },
    { color: "#0D9488", initials: "SA" },
  ];
  return (
    <div style={{ position: "relative", width: "100%", padding: "20px 0" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 50%, rgba(108,63,230,0.25) 0%, transparent 60%)",
          filter: "blur(30px)",
          animation: "glowPulse 3s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          maxWidth: 320,
          margin: "0 auto",
        }}
      >
        {tiles.map((t, i) => (
          <div
            key={i}
            style={{
              gridColumn: i === 2 ? "1 / span 2" : undefined,
              background: "#141828",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              aspectRatio: i === 2 ? "2.2 / 1" : "1.4 / 1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: t.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {t.initials}
            </div>
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 14 }}>
              {[0, 1, 2, 3, 4].map((b) => (
                <div
                  key={b}
                  style={{
                    width: 3,
                    height: 14,
                    background: t.color,
                    borderRadius: 2,
                    animation: `wavebar ${0.8 + b * 0.15}s ease-in-out infinite`,
                    transformOrigin: "center",
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function JoinMeetingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const defaultName = useMemo(() => {
    return (
      (profile as { name?: string; full_name?: string } | null)?.name ||
      (profile as { full_name?: string } | null)?.full_name ||
      (user?.user_metadata?.full_name as string | undefined) ||
      (user?.user_metadata?.name as string | undefined) ||
      ""
    );
  }, [user, profile]);

  const [meetingId, setMeetingId] = useState("");
  const [name, setName] = useState(defaultName);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const handleJoin = () => {
    navigate("/meeting-room/demo-meeting-id");
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 6,
    display: "block",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#0A0A0F",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 14,
    color: "white",
    outline: "none",
    transition: "border-color 0.15s ease",
    boxSizing: "border-box",
  };

  return (
    <>
      <style>{styles}</style>
      <div
        style={{
          minHeight: "calc(100vh - 80px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "55fr 45fr",
            gap: 32,
            maxWidth: 900,
            width: "100%",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <MeetingIllustration />
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 20, color: "white", fontWeight: 600 }}>
                Join your team in real time
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.55)",
                  marginTop: 8,
                  maxWidth: 320,
                  marginLeft: "auto",
                  marginRight: "auto",
                  lineHeight: 1.5,
                }}
              >
                Enter your meeting details to connect instantly with your team
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#141828",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: 32,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <span style={{ fontSize: 18 }}>🎙️</span>
              <span className="gradient-text" style={{ fontSize: 16, fontWeight: 700 }}>
                WrapUp
              </span>
            </div>
            <div style={{ fontSize: 18, color: "white", fontWeight: 500 }}>Join a meeting</div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.55)",
                marginTop: 4,
                marginBottom: 22,
              }}
            >
              Enter your meeting ID or paste a link
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Meeting ID or link</label>
              <input
                className="jm-input"
                style={inputStyle}
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                placeholder="Enter meeting ID or paste link..."
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Your name</label>
              <input
                className="jm-input"
                style={inputStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should we call you?"
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>
                Password{" "}
                <span style={{ color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>(optional)</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="jm-input"
                  style={{ ...inputStyle, paddingRight: 40 }}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter if required"
                />
                <div
                  onClick={() => setShowPassword((s) => !s)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.55)",
                    display: "flex",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.45)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              Before you join
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Mic size={16} color="rgba(255,255,255,0.7)" />
                <span style={{ flex: 1, fontSize: 13, color: "white" }}>Microphone</span>
                <ToggleSwitch on={micOn} onToggle={() => setMicOn((v) => !v)} />
              </div>
              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <VideoIcon size={16} color="rgba(255,255,255,0.7)" />
                <span style={{ flex: 1, fontSize: 13, color: "white" }}>Camera</span>
                <ToggleSwitch on={camOn} onToggle={() => setCamOn((v) => !v)} />
              </div>
            </div>

            <div
              className="jm-join-btn"
              onClick={handleJoin}
              style={{
                width: "100%",
                height: 48,
                background: "#6C3FE6",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 500,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
            >
              <span>Join Meeting</span>
              <ArrowRight size={18} />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                marginTop: 18,
                fontSize: 12,
                color: "rgba(255,255,255,0.45)",
              }}
            >
              <HelpCircle size={12} />
              <span>Having trouble joining?</span>
              <span
                className="jm-help-link"
                style={{ color: "#6C3FE6", cursor: "pointer", fontWeight: 500 }}
              >
                Get help
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
