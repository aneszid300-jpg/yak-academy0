import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth.js";

// Legacy auth.js logout(): sign out, then go to the login page.
export function useLogout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return useCallback(async () => {
    const { error } = await signOut();
    if (error) {
      console.error("❌ Logout error:", error);
      return false;
    }
    navigate("/login", { replace: true });
    return true;
  }, [signOut, navigate]);
}
