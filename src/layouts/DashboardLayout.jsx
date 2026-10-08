import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { hasSeenWelcome, markWelcomeSeen } from "../features/welcome/firstVisit.js";
import { useCoursesAccess } from "../features/payments/courseAccess.js";
import { markThanked, nextThanks } from "../features/thanks/letters.js";
import { ALL_COURSES } from "../data/courses.js";
import { isProfessor } from "../features/roles.js";
import { useMediaQuery } from "../hooks/useMediaQuery.js";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import TopNavbar from "../components/dashboard/TopNavbar.jsx";
import AppFooter from "../components/dashboard/AppFooter.jsx";

// Legacy hid the top navbar on every view except home (and the missing
// settings page), and hid the app footer on the study view. Payment pages
// use the viewer top bar, like flashcards and the PDF viewer.
const VIEWS_WITHOUT_TOP_NAVBAR = ["todos", "courses", "library", "ai", "study", "pdf", "flash", "payment", "wallet", "professors", "teachers", "live", "welcome", "thanks", "access"];
const VIEWS_WITHOUT_FOOTER = ["study"];

// Shared shell for every /dashboard route (legacy dashboard.html <body>):
// sidebar on the right, then the main column with top navbar, the current
// view and the app footer. Stays mounted while the views change.
export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, supabase } = useAuth();
  const courses = useCoursesAccess();
  // Professors have their own dashboard (/prof): nothing here runs for them.
  const professor = isProfessor(user);
  const isMobile = useMediaQuery("(max-width: 900px)");
  const view = location.pathname.replace(/^\/dashboard\/?/, "").split("/")[0];
  // On mobile the top navbar holds the only menu button, so it stays.
  const showTopNavbar = isMobile || !VIEWS_WITHOUT_TOP_NAVBAR.includes(view);
  const showFooter = !VIEWS_WITHOUT_FOOTER.includes(view);

  // Desktop: icon-only rail (legacy toggle, not persisted — same as legacy).
  const [collapsed, setCollapsed] = useState(false);
  // Mobile: the sidebar is a drawer.
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer on navigation and when leaving the mobile layout.
  const [lastLocation, setLastLocation] = useState(location.key);
  if (lastLocation !== location.key) {
    setLastLocation(location.key);
    if (drawerOpen) setDrawerOpen(false);
  }
  if (drawerOpen && !isMobile) setDrawerOpen(false);

  // First visit: the dashboard opens on بطاقة الترحيب, once per student.
  // Only from home, so deep links (payment return, a lesson) are not hijacked.
  useEffect(() => {
    if (!user || professor || view !== "" || hasSeenWelcome(user)) return;
    markWelcomeSeen(user, supabase);
    navigate("/dashboard/welcome", { replace: true, state: { firstVisit: true } });
  }, [user, professor, supabase, view, navigate]);

  // A course just became the student's (paid, or its proof approved): its
  // رسالة الشكر opens, once. Not over the welcome card (or while it is about
  // to open) nor over another letter.
  const welcomePending = Boolean(user) && !professor && view === "" && !hasSeenWelcome(user);
  useEffect(() => {
    if (!user || professor || courses.status !== "ready" || welcomePending || view === "welcome" || view === "thanks") return;
    const owned = ALL_COURSES.filter((c) => courses.access[c.id]?.hasAccess).map((c) => c.id);
    const next = nextThanks(user.id, owned);
    if (!next) return;
    markThanked(user.id, next);
    navigate(`/dashboard/thanks?course=${next}`, { state: { afterPurchase: true } });
  }, [user, professor, courses.status, courses.access, view, welcomePending, navigate]);

  // While the drawer is open: lock page scroll, close on Escape.
  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  if (professor) return <Navigate to="/prof" replace />;

  // First visit (بطاقة الترحيب) and right after a purchase (رسالة الشكر): the
  // card on its own, full screen — no sidebar, top bar or footer.
  if ((view === "welcome" && location.state?.firstVisit) || (view === "thanks" && location.state?.afterPurchase)) {
    return (
      <div className="flex min-h-screen flex-col p-4">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen gap-4 p-4">
      <Sidebar
        collapsed={collapsed && !isMobile}
        drawerOpen={drawerOpen}
        onToggle={() => (isMobile ? setDrawerOpen(false) : setCollapsed((c) => !c))}
      />
      <div className={"sidebar-overlay" + (drawerOpen ? " open" : "")} onClick={() => setDrawerOpen(false)} aria-hidden="true"></div>

      <div className="flex min-h-[calc(100vh-32px)] min-w-0 flex-1 flex-col gap-4">
        {showTopNavbar && <TopNavbar onOpenMenu={() => setDrawerOpen(true)} menuOpen={drawerOpen} />}
        <Outlet />
        {showFooter && <AppFooter />}
      </div>
    </div>
  );
}
