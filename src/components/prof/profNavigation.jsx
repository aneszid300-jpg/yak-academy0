// Professor dashboard navigation (/prof). Same sidebar as the students', with
// the professor's own entries.

const icon = (children) => (
  <svg className="nav-icon" viewBox="0 0 24 24">
    {children}
  </svg>
);

export const PROF_NAV_ITEMS = [
  {
    key: "home",
    label: "الرئيسية",
    to: "/prof",
    icon: icon(
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
  },
  {
    key: "courses",
    label: "دوراتي",
    to: "/prof/courses",
    icon: icon(
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </>
    ),
  },
  {
    key: "upload",
    label: "رفع الملفات",
    to: "/prof/upload",
    icon: icon(
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </>
    ),
  },
  {
    key: "sessions",
    label: "الجلسات",
    to: "/prof/sessions",
    icon: icon(
      <>
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" />
      </>
    ),
  },
  {
    key: "announcements",
    label: "الإعلانات",
    to: "/prof/announcements",
    icon: icon(
      <>
        <path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1z" />
        <path d="M16 9a3 3 0 0 1 0 6" />
        <path d="M19 6a7 7 0 0 1 0 12" />
      </>
    ),
  },
  {
    key: "profile",
    label: "ملفي",
    to: "/prof/profile",
    icon: icon(
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
  },
];

const SECTION_BY_SEGMENT = { "": "home", courses: "courses", upload: "upload", sessions: "sessions", announcements: "announcements", profile: "profile" };

export function profSectionFor(pathname) {
  const segment = pathname.replace(/^\/prof\/?/, "").split("/")[0];
  return SECTION_BY_SEGMENT[segment] ?? null;
}
