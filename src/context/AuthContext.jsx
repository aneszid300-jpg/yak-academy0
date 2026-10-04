import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase.js";

const AuthContext = createContext(null);

// Where Supabase sends the browser back to (must be in the Supabase
// Redirect URLs allowlist).
const redirectUrl = (path) => window.location.origin + path;

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    // getSession() waits for the client to finish reading any tokens in the
    // URL (OAuth return, password-recovery link) before resolving.
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) console.error("❌ Cannot get session:", error);
      setSession(data?.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      supabase,
      session,
      user: session?.user ?? null,
      loading,

      signIn: (email, password) =>
        supabase.auth.signInWithPassword({ email, password }),

      signUp: ({ email, password, fullName, phone }) =>
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, phone },
          },
        }),

      signInWithGoogle: () =>
        supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: redirectUrl("/dashboard") },
        }),

      requestPasswordReset: (email) =>
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl("/reset-password"),
        }),

      updatePassword: (password) => supabase.auth.updateUser({ password }),

      signOut: () => supabase.auth.signOut(),
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
