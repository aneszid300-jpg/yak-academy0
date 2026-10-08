import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import AuthLoader from "../components/auth/AuthLoader.jsx";

// Guards every /dashboard route.
// 1. wait for the local session check (no dashboard flash),
// 2. no session → /login,
// 3. session → confirm the user with the server (getUser, as the legacy
//    protectDashboard() did) before rendering.
export default function ProtectedRoute({ loginPath = "/login" }) {
  const { session, loading, supabase } = useAuth();
  const location = useLocation();
  const [verified, setVerified] = useState(null); // null = checking

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;
    let active = true;
    setVerified(null);
    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (error) console.error("❌ Cannot get current user:", error);
      setVerified(Boolean(data?.user) && !error);
    });
    return () => {
      active = false;
    };
    // Only re-verify when the signed-in user changes, not on token refresh.
  }, [userId]);

  if (loading) return <AuthLoader />;
  if (!session) return <Navigate to={loginPath} replace state={{ from: location }} />;
  if (verified === null) return <AuthLoader />;
  if (!verified) return <Navigate to={loginPath} replace />;

  return <Outlet />;
}
