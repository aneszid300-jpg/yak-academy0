import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useLogout } from "../hooks/useLogout.js";
import { useMediaQuery } from "../hooks/useMediaQuery.js";
import { isProfessor } from "../features/roles.js";
import { useMyProfessor } from "../features/prof/useMyProfessor.js";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import { PROF_NAV_ITEMS, profSectionFor } from "../components/prof/profNavigation.jsx";
import { yakLogoPurple } from "../assets/images/index.js";
import { SUBJECT_NAMES } from "../data/courses.js";

// Professor dashboard shell (/prof/*) — its own space, separate from the
// students' /dashboard: only an account whose role is "professor"
// (features/roles.js) gets in; everyone else goes back to /dashboard.
// Same sidebar look, the professor's own menu; a top bar with «+ رفع PDF».
// Below 900px the sidebar is a drawer opened from that bar.
export default function ProfLayout() {
  const { user } = useAuth();
  const { professor } = useMyProfessor();
  const logout = useLogout("/prof/login");
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 900px)");
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer on navigation and when leaving the mobile layout.
  const [lastLocation, setLastLocation] = useState(location.key);
  if (lastLocation !== location.key) {
    setLastLocation(location.key);
    if (drawerOpen) setDrawerOpen(false);
  }
  if (drawerOpen && !isMobile) setDrawerOpen(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event) => event.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  if (!isProfessor(user)) return <Navigate to="/dashboard" replace />;

  // A professor account not linked to a professor record yet.
  if (!professor) {
    return (
      <div className="pd-unlinked">
        <div className="section-card pd-unlinked-card">
          <img src={yakLogoPurple} alt="Yak Academy" className="pd-unlinked-logo" />
          <h1>حسابك غير مرتبط بملف أستاذ بعد</h1>
          <p>تواصل مع إدارة Yak Academy لربط حسابك بملفك، ثم أعد تسجيل الدخول.</p>
          <button type="button" className="btn-outline" onClick={logout}>
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen gap-4 p-4">
      <Sidebar
        collapsed={collapsed && !isMobile}
        drawerOpen={drawerOpen}
        onToggle={() => (isMobile ? setDrawerOpen(false) : setCollapsed((c) => !c))}
        items={PROF_NAV_ITEMS}
        sectionFor={profSectionFor}
        roleLabel="أستاذ"
        loginPath="/prof/login"
        bell={null}
      />
      <div className={"sidebar-overlay" + (drawerOpen ? " open" : "")} onClick={() => setDrawerOpen(false)} aria-hidden="true"></div>

      <div className="flex min-h-[calc(100vh-32px)] min-w-0 flex-1 flex-col gap-4">
        <header className="pd-topbar">
          <div className="pd-topbar-start">
            {isMobile && (
              <button type="button" className="toggle-sidebar-btn" onClick={() => setDrawerOpen(true)} aria-label="القائمة" aria-controls="sidebar" aria-expanded={drawerOpen}>
                <svg className="toggle-panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="16" rx="3" />
                  <path d="M9 4v16" />
                </svg>
              </button>
            )}
            <span className="pd-topbar-badge">أستاذ</span>
            <span className="pd-topbar-who">
              أ. {professor.name}
              {SUBJECT_NAMES[professor.subject] && <small> · {SUBJECT_NAMES[professor.subject]}</small>}
            </span>
          </div>
          <Link to="/prof/upload" className="pd-btn pd-btn-primary pd-btn-sm">
            + رفع PDF
          </Link>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
