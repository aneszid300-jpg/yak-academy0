import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { getCourse } from "../../data/courses.js";
import { getProfessor } from "../../data/professors.js";
import { useCoursesAccess } from "../../features/payments/courseAccess.js";
import { announcementsFor, useClassVersion } from "../../services/classService.js";
import { createStoredValue, parseJson } from "../../utils/storedValue.js";
import { formatPayDate } from "./payment/messages.js";

// الإشعارات 🔔 (student sidebar): the announcements professors sent to the
// courses the student owns (classService), newest first. The red dot shows
// while some are unread; opening the panel marks them read (per account,
// utils/storedValue.js).

const readStore = createStoredValue("yak_read_announcements", parseJson([], Array.isArray));

export default function NotificationsBell() {
  const { status, access } = useCoursesAccess();
  useClassVersion();
  const read = useSyncExternalStore(readStore.subscribe, readStore.get);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null); // rendered in <body> (portal): the sidebar's backdrop-filter clips it
  const wrapRef = useRef(null);
  const panelRef = useRef(null);

  const owned = status === "ready" ? Object.keys(access).filter((id) => access[id]?.hasAccess) : [];
  const items = announcementsFor(owned);
  const unread = items.filter((a) => !read.includes(a.id)).length;

  function toggle(event) {
    const next = !open;
    const r = event.currentTarget.getBoundingClientRect();
    setPos({ top: r.bottom + 8, right: Math.max(16, window.innerWidth - r.right) });
    setOpen(next);
    if (next && unread) readStore.set([...new Set([...read, ...items.map((a) => a.id)])]);
  }

  // Close on a click outside or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !wrapRef.current?.contains(e.target) && !panelRef.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <button
        type="button"
        className="sidebar-icon-btn"
        title="الإشعارات"
        aria-label={unread ? `الإشعارات (${unread} جديدة)` : "الإشعارات"}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && <span className="notif-dot"></span>}
      </button>

      {open &&
        createPortal(
        <div className="notif-panel" ref={panelRef} role="dialog" aria-label="الإشعارات" style={pos ? { top: pos.top, right: pos.right } : undefined}>
          <div className="notif-head">الإشعارات</div>
          {items.length ? (
            <ul className="notif-list">
              {items.map((a) => {
                const course = getCourse(a.courseId);
                const prof = getProfessor(a.professorId);
                return (
                  <li key={a.id} className={read.includes(a.id) ? "" : "is-new"}>
                    <div className="notif-meta">
                      {prof ? `أ. ${prof.name}` : "الأستاذ"} · {course?.title}
                    </div>
                    <p className="notif-text">{a.text}</p>
                    <div className="notif-date">{formatPayDate(a.createdAt)}</div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="notif-empty">لا توجد إشعارات بعد. ستصلك هنا إعلانات أساتذة دوراتك.</p>
          )}
        </div>,
          document.body
        )}
    </div>
  );
}
