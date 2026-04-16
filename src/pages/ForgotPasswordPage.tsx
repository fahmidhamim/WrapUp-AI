import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { buildPublicAppUrl, getPublicAppBaseUrl, hasConfiguredPublicAppUrl, isDesktopApp } from "@/lib/app-shell";
import { validateEmail } from "@/lib/auth";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const desktopPublicAppNotice = isDesktopApp() && !hasConfiguredPublicAppUrl()
    ? `Desktop reset links currently open on ${getPublicAppBaseUrl()}. Set VITE_PUBLIC_APP_URL to change that.`
    : null;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: buildPublicAppUrl("/reset-password"),
      });

      setLoading(false);

      if (error) {
        toast.error("Could not send reset email right now. Please try again.");
      } else {
        setEmail(normalizedEmail);
        setSent(true);
      }
    } catch {
      setLoading(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (sent) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-xl font-bold mb-2">Check Your Email</h1>
            <p className="text-sm text-muted-foreground mb-6">
              We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>. Click the link in your email to set a new password.
            </p>
            {desktopPublicAppNotice && (
              <p className="text-xs text-muted-foreground mb-6">
                {desktopPublicAppNotice}
              </p>
            )}
            <Link to="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
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
          <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Login
          </Link>

          <h1 className="text-xl font-bold mb-1">Forgot Password</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your email and we'll send you a link to reset your password.
          </p>
          {desktopPublicAppNotice && (
            <p className="text-xs text-muted-foreground mb-6">
              {desktopPublicAppNotice}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  className="pl-9 bg-background/50 border-border/50"
                  required
                />
              </div>
              {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
            </div>

            <Button type="submit" className="w-full gradient-bg text-primary-foreground font-semibold" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send Reset Link
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
