import { supabase } from "@/integrations/supabase/client";
import { buildPublicAppUrl, isDesktopApp, openExternalUrl } from "@/lib/app-shell";

const DESKTOP_AUTH_CALLBACK_URL = "wrapup://auth/callback";

export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: buildPublicAppUrl("/"),
      data: { full_name: fullName },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const desktopMode = isDesktopApp();
  const redirectTo = desktopMode ? DESKTOP_AUTH_CALLBACK_URL : buildPublicAppUrl("/dashboard");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      ...(desktopMode ? { skipBrowserRedirect: true } : {}),
    },
  });

  if (error) {
    return { data, error };
  }

  if (desktopMode) {
    if (!data?.url) {
      throw new Error("Google sign-in could not be started because no OAuth URL was returned.");
    }

    await openExternalUrl(data.url);
  }

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[0-9]/.test(password)) errors.push("Must contain a number");
  if (!/[A-Z]/.test(password)) errors.push("Must contain an uppercase letter");
  if (!/[^a-zA-Z0-9]/.test(password)) errors.push("Must contain a special character");
  return errors;
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
