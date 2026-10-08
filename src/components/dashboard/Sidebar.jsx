import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useLogout } from "../../hooks/useLogout.js";
import { useTheme } from "../../hooks/useTheme.js";
import { getDisplayName, getUserInitial } from "../../utils/userName.js";
import { yakLogoPurple } from "../../assets/images/index.js";
import { NAV_ITEMS, activeSectionFor, isSubItemActive, subItemUrl } from "./navigation.jsx";
import NotificationsBell from "./NotificationsBell.jsx";

const chevron = (
  <svg className="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// Legacy .sidebar: logo + collapse toggle, theme/notifications, navigation
// with submenus, and the user card. `collapsed` is the desktop icon rail;
// `drawerOpen` is the mobile drawer (below 900px). The student dashboard uses
// the defaults; the professor dashboard passes its own menu and role label.
export default function Sidebar({ collapsed, onToggle, drawerOpen, items = NAV_ITEMS, sectionFor = activeSectionFor, roleLabel = "طالب", loginPath = "/login", bell = <NotificationsBell /> }) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const logout = useLogout(loginPath);
  const { isDark, toggleTheme } = useTheme();

  const activeSection = sectionFor(pathname);

  // Open submenus. Like legacy, entering a section opens its submenu and
  // it stays open until the user closes it.
  const [openParents, setOpenParents] = useState(() => new Set([activeSection]));
  const [prevSection, setPrevSection] = useState(activeSection);
  if (prevSection !== activeSection) {
    setPrevSection(activeSection);
    setOpenParents((prev) => new Set(prev).add(activeSection));
  }

  function toggleParent(item) {
    // Collapsed rail: no submenus, go straight to the section (legacy).
    if (collapsed) {
      navigate(subItemUrl(item.children[0]));
      return;
    }
    setOpenParents((prev) => {
      const next = new Set(prev);
      if (next.has(item.key)) next.delete(item.key);
      else next.add(item.key);
      return next;
    });
  }

  const [loggingOut, setLoggingOut] = useState(false);
  async function handleLogout() {
    setLoggingOut(true);
    const ok = await logout();
    if (!ok) setLoggingOut(false);
  }

  const className =
    "sidebar" + (collapsed ? " collapsed" : "") + (drawerOpen ? " drawer-open" : "");

  return (
    <aside className={className} id="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <div className="logo-container">
            <img src={yakLogoPurple} alt="Yak Academy" className="logo-img" />
          </div>
          <button type="button" className="toggle-sidebar-btn" title="طي / فتح" onClick={onToggle}>
            <img src={yakLogoPurple} alt="Yak" className="toggle-logo-img" />
            <svg className="toggle-panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="3" />
              <path d="M9 4v16" />
            </svg>
          </button>
        </div>

        <div className="sidebar-top-actions">
          <button type="button" className="sidebar-icon-btn" title="تغيير الثيم" aria-label="تغيير الثيم" onClick={toggleTheme}>
            {isDark ? (
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          {bell}
        </div>
      </div>

      <ul className="nav-menu">
        {items.map((item) => {
          if (!item.children) {
            const active = activeSection === item.key;
            return (
              <li key={item.key} className={"nav-item" + (active ? " active" : "")}>
                <Link to={item.to} aria-current={active ? "page" : undefined}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          }

          const hasActiveChild = activeSection === item.key;
          const open = openParents.has(item.key);
          return (
            <li
              key={item.key}
              className={"nav-item nav-item-parent" + (open ? " open" : "") + (hasActiveChild ? " has-active-child" : "")}
            >
              <a
                role="button"
                tabIndex={0}
                aria-expanded={collapsed ? undefined : open}
                onClick={() => toggleParent(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleParent(item);
                  }
                }}
              >
                {item.icon}
                <span>{item.label}</span>
                {chevron}
              </a>
              <ul className="nav-submenu">
                {item.children.map((child) => {
                  const active = isSubItemActive(child, pathname, search);
                  return (
                    <li key={child.label} className={"nav-subitem" + (active ? " active" : "")}>
                      <Link to={subItemUrl(child)} aria-current={active ? "page" : undefined}>
                        <span>{child.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-electric-violet font-bold text-white">
            {getUserInitial(user)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{getDisplayName(user)}</div>
            <div className="sidebar-user-role">{roleLabel}</div>
          </div>
        </div>
        <button type="button" className="sidebar-logout" onClick={handleLogout} disabled={loggingOut} title="تسجيل الخروج">
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
