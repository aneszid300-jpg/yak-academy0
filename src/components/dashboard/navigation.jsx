// Sidebar navigation — labels, order and icons from legacy/dashboard.html.
// Legacy switched views with switchPage(); here every entry is a URL.

const icon = (children) => (
  <svg className="nav-icon" viewBox="0 0 24 24">
    {children}
  </svg>
);

export const NAV_ITEMS = [
  {
    key: "home",
    label: "الرئيسية",
    to: "/dashboard",
    icon: icon(
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
  },
  {
    key: "todos",
    label: "مهام اليوم",
    to: "/dashboard/todos",
    icon: icon(
      <>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </>
    ),
  },
  {
    key: "courses",
    label: "الدورات",
    icon: icon(
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </>
    ),
    children: [
      { label: "الكل", path: "/dashboard/courses", view: null },
      { label: "دوراتي", path: "/dashboard/courses", view: "my" },
      { label: "تمارين الدورات", path: "/dashboard/courses", view: "exercises" },
    ],
  },
  {
    key: "ai",
    label: "باك AI",
    icon: icon(
      <>
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
      </>
    ),
    children: [
      { label: "الكل", path: "/dashboard/ai", view: null },
      { label: "بطاقاتي", path: "/dashboard/ai", view: "my" },
    ],
  },
  {
    key: "library",
    label: "المكتبة",
    icon: icon(<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />),
    // Legacy: the library only shows Bac subjects.
    children: [{ label: "مواضيع البكالوريا", path: "/dashboard/library", view: null }],
  },
  {
    // New with payments: the student's purchase centre.
    key: "wallet",
    label: "محفظتي",
    to: "/dashboard/wallet",
    icon: icon(
      <>
        <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" />
        <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
      </>
    ),
  },
  {
    key: "settings",
    label: "الإعدادات",
    to: "/dashboard/settings",
    icon: icon(
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
  },
];

export const subItemUrl = ({ path, view }) => (view ? `${path}?view=${view}` : path);

// Which sidebar entry a URL belongs to. Views without their own entry keep
// the section they are opened from in legacy: study ← courses, flash ← AI,
// pdf ← library; payment (only units are sold) ← courses.
const SECTION_BY_SEGMENT = {
  "": "home",
  todos: "todos",
  courses: "courses",
  study: "courses",
  payment: "courses",
  ai: "ai",
  flash: "ai",
  library: "library",
  pdf: "library",
  wallet: "wallet",
  settings: "settings",
};

export function activeSectionFor(pathname) {
  const segment = pathname.replace(/^\/dashboard\/?/, "").split("/")[0];
  return SECTION_BY_SEGMENT[segment] ?? null;
}

// A sub-item is highlighted only on its own list view, e.g.
// /dashboard/courses?view=my — not on a course's detail page.
export function isSubItemActive(child, pathname, search) {
  const path = pathname.replace(/\/+$/, "");
  if (path !== child.path) return false;
  const view = new URLSearchParams(search).get("view");
  const known = child.path === "/dashboard/courses" ? ["my", "exercises"] : child.path === "/dashboard/ai" ? ["my"] : [];
  return (known.includes(view) ? view : null) === child.view;
}
