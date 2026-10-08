import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth.js";

// Legacy auth.js logout(): sign out, then go to the login page (the
// professors' own page from their dashboard).
export function useLogout(loginPath = "/login") {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return useCallback(async () => {
    const { error } = await signOut();
    if (error) {
      console.error("❌ Logout error:", error);
      return false;
    }
    navigate(loginPath, { replace: true });
    return true;
  }, [signOut, navigate, loginPath]);
}
