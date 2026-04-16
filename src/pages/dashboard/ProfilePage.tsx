import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { User, Camera, Crown, Check, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { openExternalUrl } from "@/lib/app-shell";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { tier, tierDefinition, subscriptionQuery } = useSubscription();
  const [uploading, setUploading] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // On checkout success, sync subscription from Stripe → DB
  useEffect(() => {
    if (searchParams.get("checkout") !== "success") return;

    const syncSubscription = async () => {
      setSyncing(true);
      try {
        const { error } = await supabase.functions.invoke("check-subscription");
        if (error) throw error;
        await queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
        toast.success("Payment successful! Your plan has been upgraded.");
      } catch {
        toast.warning("Payment received — your plan will update shortly.");
      } finally {
        setSyncing(false);
        // Remove ?checkout=success from URL without reload
        navigate("/dashboard/profile", { replace: true });
      }
    };

    void syncSubscription();
  }, [searchParams, user?.id, queryClient, navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: `${publicUrl}?t=${Date.now()}` })
        .eq("id", user.id);
      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Profile picture updated!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleManageSubscription = async () => {
    setOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        await openExternalUrl(data.url);
      } else {
        throw new Error("No portal URL returned.");
      }
    } catch (err: any) {
      toast.error(err.message || "Could not open billing portal. Please try again.");
    } finally {
      setOpeningPortal(false);
    }
  };

  const avatarUrl = profile?.avatar_url;

  const tierFeatures: Record<string, string[]> = {
    free: [
      "5 meetings per month",
      "Basic search",
      "Email support",
      "7-day transcript history",
      "1 workspace",
    ],
    plus: [
      "50 meetings per month",
      "Unlimited session length",
      "60-day transcript history",
      "PDF & text export",
      "Basic integrations",
      "Priority email support",
    ],
    business: [
      "Everything in Plus",
      "Unlimited meetings",
      "Unlimited transcript history",
      "Advanced AI summaries",
      "Sentiment analysis",
      "Custom vocabulary",
      "Analytics dashboard",
      "Team workspaces",
      "Shared meeting libraries",
      "Real-time collaboration",
      "Premium integrations",
      "Calendar sync",
      "Custom branding",
    ],
    enterprise: [
      "Everything in Business",
      "Zero data retention with LLM",
      "Private AI deployment",
      "SSO & SAML authentication",
      "Advanced security & controls",
      "Audit log",
      "User provisioning (SCIM)",
      "Dedicated success manager",
      "SLA guarantee",
      "Custom integrations & API",
    ],
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Profile card with avatar */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden gradient-bg flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-primary-foreground" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{profile?.full_name || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {tier !== "free" && (
              <span className="inline-block text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full gradient-bg text-primary-foreground">
                {tierDefinition.label.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Full Name</span>
            <span className="font-medium">{profile?.full_name || "—"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium">{syncing ? "Syncing…" : tierDefinition.label}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Plan card */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">Your Plan</h2>
        </div>

        {syncing || subscriptionQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking subscription…
          </div>
        ) : tier !== "free" ? (
          /* ── Paid plan ── */
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{tierDefinition.label} Plan — Active</span>
            </div>
            <ul className="space-y-2">
              {(tierFeatures[tier] ?? []).map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => void handleManageSubscription()}
              disabled={openingPortal}
              className="w-full flex items-center justify-center gap-2 border border-border rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
            >
              {openingPortal ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              Manage Subscription
            </button>
          </div>
        ) : (
          /* ── Free plan ── */
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Current: <span className="font-medium text-foreground">Free Plan</span>
              </p>
              <ul className="space-y-1.5">
                {tierFeatures.free.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium mb-2">Upgrade to Plus — $5/mo</p>
              <ul className="space-y-1.5 mb-4">
                {tierFeatures.plus.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/dashboard/pricing")}
                className="w-full gradient-bg text-primary-foreground font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity"
              >
                Upgrade to Plus
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
