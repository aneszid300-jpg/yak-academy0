import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useMediaQuery } from "../hooks/useMediaQuery.js";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import TopNavbar from "../components/dashboard/TopNavbar.jsx";
import AppFooter from "../components/dashboard/AppFooter.jsx";

// Legacy hid the top navbar on every view except home (and the missing
// settings page), and hid the app footer on the study view. Payment pages
// use the viewer top bar, like flashcards and the PDF viewer.
const VIEWS_WITHOUT_TOP_NAVBAR = ["todos", "courses", "library", "ai", "study", "pdf", "flash", "payment", "wallet", "professors"];
const VIEWS_WITHOUT_FOOTER = ["study"];

// Shared shell for every /dashboard route (legacy dashboard.html <body>):
// sidebar on the right, then the main column with top navbar, the current
// view and the app footer. Stays mounted while the views change.
export default function DashboardLayout() {
  const location = useLocation();
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
