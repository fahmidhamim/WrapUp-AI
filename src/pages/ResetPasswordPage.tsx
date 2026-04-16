import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { validatePassword } from "@/lib/auth";
import { toast } from "sonner";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Contains an uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains a special character", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from the email link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
        setChecking(false);
      }
    });

    // Also check hash for type=recovery (fallback)
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
    
    // Give it a moment to detect the event
    const timer = setTimeout(() => setChecking(false), 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const errors = validatePassword(password);
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = errors.length === 0 && !mismatch && password.length > 0 && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      navigate("/login");
    }
  };

  if (checking) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isRecovery) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-muted-foreground mb-4">Invalid or expired reset link.</p>
          <Button onClick={() => navigate("/forgot-password")} variant="outline">
            Request a new link
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl p-8">
          <h1 className="text-xl font-bold mb-1">Set New Password</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Choose a strong password for your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 bg-background/50 border-border/50"
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {password.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 space-y-1">
                  {passwordRules.map(({ label, test }) => {
                    const passed = test(password);
                    return (
                      <div key={label} className="flex items-center gap-2 text-xs">
                        {passed ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                        <span className={passed ? "text-green-500" : "text-muted-foreground"}>{label}</span>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9 pr-9 bg-background/50 border-border/50"
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mismatch && <p className="text-xs text-destructive mt-1">Passwords do not match</p>}
            </div>

            <Button type="submit" className="w-full gradient-bg text-primary-foreground font-semibold" disabled={!canSubmit || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Password
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
