import { useEffect, useRef } from "react";
import { SUBJECT_NAMES } from "../../data/courses.js";
import { countAr, COUNT_WORDS } from "../../features/courses/content.js";
import { sessionDuration } from "../../features/live/status.js";
import { getUploadKind, liveCategory } from "../../config/contentConfig.js";
import { dayAr, isoDay } from "../../features/prof/schedule.js";
import { attendanceFor, courseStats } from "../../services/classService.js";

// Pieces shared by the professor dashboard pages (/prof/*).
// Student numbers (registered, active, attended) come from classService; while
// it cannot provide them (no backend) they show «—» with «يتوفر مع الخادم» —
// never an invented number.

export const PENDING = "—";
export const PENDING_NOTE = "يتوفر مع الخادم";

/** A count from classService, or «—» while it is not available. */
export const countOr = (n) => (n == null ? PENDING : n);

/** { enrolled, active } summed over courses, or null. */
export function statsFor(courseIds) {
  const all = courseIds.map((id) => courseStats(id));
  if (all.some((x) => x == null)) return null;
  return all.reduce((t, x) => ({ enrolled: t.enrolled + x.enrolled, active: t.active + x.active }), { enrolled: 0, active: 0 });
}

const LIVE_WORDS = ["جلسة واحدة", "جلستان", "جلسات", "جلسة"];
const COURSE_WORDS = ["دورة واحدة", "دورتان", "دورات", "دورة"];
export const coursesCount = (n) => countAr(n, COURSE_WORDS);

/** «5 دروس · 4 أسئلة QCM · …» for one course, only what it has. */
export function contentSummary(content) {
  if (!content) return "";
  const qcm = content.qcm.reduce((n, d) => n + d.questions, 0);
  return [
    content.lessons.length && countAr(content.lessons.length, COUNT_WORDS.lessons),
    content.live.length && countAr(content.live.length, LIVE_WORDS),
    qcm && countAr(qcm, COUNT_WORDS.qcm),
    content.exercises.length && countAr(content.exercises.length, COUNT_WORDS.exercises),
  ]
    .filter(Boolean)
    .join(" · ");
}

/* ---------- icons (stroke, currentColor) ---------- */
const svg = (children, size = 18) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
export const ICONS = {
  book: svg(<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>),
  users: svg(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
  file: svg(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>),
  live: svg(<><rect x="2" y="6" width="14" height="12" rx="2" /><path d="m22 8-6 4 6 4V8z" /></>),
  upload: svg(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>),
  calendar: svg(<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>),
  spark: svg(<><path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z" /></>),
};

/* ---------- stat card ---------- */
export function StatCard({ label, icon, value, sub, tone }) {
  return (
    <div className="pd-stat">
      <div className="pd-stat-top">
        <span className="pd-stat-label">{label}</span>
        <span className="pd-stat-icon">{icon}</span>
      </div>
      <div className={"pd-stat-val" + (value === PENDING ? " is-pending" : "")}>{value}</div>
      {sub && <div className={"pd-stat-sub" + (tone ? ` is-${tone}` : "")}>{sub}</div>}
    </div>
  );
}

/* ---------- start / details ---------- */
/** «بدء الجلسة» opens the session's Zoom link (data/liveSessions.js provider.joinUrl). */
export function StartButton({ session, small = true }) {
  const url = session.provider?.joinUrl;
  const cls = "pd-btn pd-btn-primary" + (small ? " pd-btn-sm" : "");
  if (!url) {
    return (
      <button type="button" className={cls} disabled title="رابط Zoom لم يُضف بعد">
        بدء الجلسة
      </button>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={cls}>
      بدء الجلسة
    </a>
  );
}

/** «20:00 – 22:00», always left to right (isolated from the Arabic around it). */
export function TimeRange({ session }) {
  return (
    <span className="pd-timerange" dir="ltr">
      {session.startsAt} – {session.endsAt}
    </span>
  );
}

export function LivePill({ children = "LIVE" }) {
  return <span className="pd-live-pill">{children}</span>;
}

/* ---------- a session on the schedule ---------- */
export function ScheduleRow({ item, onDetails }) {
  const { session, status, day } = item;
  const live = status.key === "live";
  const att = status.key === "soon" ? undefined : attendanceFor(session.id, isoDay(day));
  return (
    <div className={"pd-sched" + (live ? " is-live" : "") + (status.key === "ended" ? " is-ended" : "")}>
      <div className="pd-sched-time">
        <TimeRange session={session} />
      </div>
      <div className="pd-sched-info">
        <div className="pd-sched-title">
          {session.title} {live && <LivePill>LIVE الآن</LivePill>}
        </div>
        <div className="pd-sched-meta">
          {[SUBJECT_NAMES[session.subjectKey], liveCategory(session).label, att !== undefined && `الحضور ${att ? att.length : PENDING}`].filter(Boolean).join(" · ")}
        </div>
      </div>
      {status.canJoin ? (
        <StartButton session={session} />
      ) : (
        <button type="button" className="pd-btn pd-btn-ghost pd-btn-sm" onClick={() => onDetails(item)}>
          تفاصيل
        </button>
      )}
    </div>
  );
}

/* ---------- details modal ---------- */
export function SessionModal({ item, onClose, onDelete }) {
  const closeRef = useRef(null);
  useEffect(() => {
    if (!item) return;
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [item, onClose]);
  if (!item) return null;
  const { session, day, status } = item;
  const att = attendanceFor(session.id, isoDay(day));
  const rows = [
    ["اليوم", dayAr(day)],
    ["الوقت", <TimeRange key="t" session={session} />],
    ["المدة", sessionDuration(session)],
    ["النوع", liveCategory(session).label],
    ["المادة", SUBJECT_NAMES[session.subjectKey] || "—"],
    ["الحضور", att ? (status.key === "soon" ? "لم تبدأ بعد" : att.length) : <span key="e" className="pd-muted">{PENDING} · {PENDING_NOTE}</span>],
    ["رابط Zoom", session.provider?.joinUrl ? "مضاف" : "لم يُضف بعد"],
  ];
  return (
    <div className="pd-modal-overlay" onClick={onClose}>
      <div className="pd-modal" role="dialog" aria-modal="true" aria-labelledby="pdModalTitle" onClick={(e) => e.stopPropagation()}>
        <h3 id="pdModalTitle">{session.title}</h3>
        <p className="pd-modal-sub">{status.label}</p>
        <dl className="pd-modal-rows">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {att && att.length > 0 && (
          <div className="pd-attendees">
            <div className="pd-attendees-head">من انضم ({att.length})</div>
            <ul>
              {att.map((a, i) => (
                <li key={i}>
                  <span>{a.name}</span>
                  <small dir="ltr">{new Date(a.at).toTimeString().slice(0, 5)}</small>
                </li>
              ))}
            </ul>
            <p className="pd-muted">يُحتسب الحضور عند الضغط على «الانضمام عبر Zoom».</p>
          </div>
        )}
        <div className="pd-modal-actions">
          {onDelete && (
            <button type="button" className="pd-btn pd-btn-danger pd-modal-delete" onClick={() => onDelete(session)}>
              حذف الجلسة
            </button>
          )}
          <button type="button" ref={closeRef} className="pd-btn pd-btn-ghost" onClick={onClose}>
            إغلاق
          </button>
          {status.canJoin && <StartButton session={session} small={false} />}
        </div>
      </div>
    </div>
  );
}

/* ---------- files ---------- */
const sizeText = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** One file: an exercise PDF from the course data, or an upload ({ name, size, createdAt, kind }). */
export function FileRow({ name, courseTitle, kind, meta, upload, onDelete }) {
  const k = getUploadKind(kind);
  const info = upload ? [courseTitle, sizeText(upload.size), `رُفع ${dayAr(new Date(upload.createdAt))}`] : [courseTitle, meta];
  return (
    <div className="pd-file">
      <span className={"pd-file-ico is-" + kind}>{kind === "flashcards" ? ICONS.spark : ICONS.file}</span>
      <span className="pd-file-body">
        <span className="pd-file-name">{name}</span>
        <span className="pd-file-meta">{info.filter(Boolean).join(" · ")}</span>
      </span>
      {upload?.status === "processing" && <span className="pd-badge is-wait">قيد المعالجة بالـ AI</span>}
      <span className={"pd-badge is-" + kind}>{k.badge}</span>
      {onDelete && (
        <button type="button" className="pd-icon-btn" onClick={onDelete} aria-label={`حذف ${name}`} title="حذف">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function Empty({ children }) {
  return <p className="pd-empty">{children}</p>;
}
