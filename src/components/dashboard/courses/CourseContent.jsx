import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { COUNT_WORDS, countAr, getCourseContent } from "../../../features/courses/content.js";
import { liveStatus, useLiveStatus } from "../../../features/live/status.js";

// «محتوى الدورة» — what a course contains (features/courses/content.js):
//   <CourseContent courseId currentLessonId done lessonState>  the course page's
//       side card «دروس الدورة» (Study page classes): one block per kind, each
//       item opens it; lessons show the current one and ✓ done
//   <CourseContentSummary courseId>     before buying (course details window):
//       the same counts, locked — the content opens once the course is bought

const Icon = ({ children }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const KINDS = [
  { key: "lessons", label: "الدروس", action: "عرض الدروس", icon: <Icon><path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z" /><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" /></Icon> },
  { key: "live", label: "Live", action: "عرض الجلسات", icon: <Icon><rect x="2" y="6" width="14" height="12" rx="3" /><path d="m16 10 6-3v10l-6-3z" /></Icon> },
  { key: "qcm", label: "QCM", action: "بدء التدريب", icon: <Icon><path d="M9 11l3 3 8-8" /><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></Icon> },
  { key: "exercises", label: "التمارين", action: "عرض التمارين", icon: <Icon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></Icon> },
];
const DoneIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const LockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

// When a live session happens: «اليوم — 20:00», «غدًا — 20:00» or its date.
function liveWhen(session) {
  if (!session.date) return `اليوم — ${session.startsAt}`;
  const day = new Date(`${session.date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((day - today) / 86400000);
  const label = diff === 0 ? "اليوم" : diff === 1 ? "غدًا" : session.date;
  return `${label} — ${session.startsAt}`;
}

// A Live row: status badge (live.css) + when; re-checked while the page is open.
function LiveRowMeta({ session }) {
  const status = useLiveStatus(session);
  return (
    <>
      <span className={`live-badge is-${status.tone} cc-live-badge`}>
        <i aria-hidden="true" />
        {status.key === "soon" ? "قادم" : status.label}
      </span>
      {status.key !== "ended" && <bdi>{status.key === "live" ? `حتى ${session.endsAt}` : liveWhen(session)}</bdi>}
    </>
  );
}

/** «Live» block line: the count, plus the next session when one is coming or on air. */
function liveSummary(items, n) {
  const now = new Date();
  const onAir = items.find((i) => liveStatus(i.session, now).key === "live");
  const next = items.find((i) => liveStatus(i.session, now).key === "soon");
  const count = countAr(n, COUNT_WORDS.live);
  if (onAir) return `${count} · مباشر الآن`;
  if (next) return `${count} · قادم ${next.session.startsAt}`;
  return count;
}

/** Number shown for a kind: questions for QCM, items otherwise. */
const amount = (content, key) => (key === "qcm" ? content.qcm.reduce((sum, d) => sum + d.questions, 0) : content[key].length);

export function CourseContent({ courseId, currentLessonId = null, done = {}, lessonState }) {
  const content = useMemo(() => getCourseContent(courseId), [courseId]);
  const [open, setOpen] = useState({ lessons: true }); // like the lessons card: the first block open
  if (!content) return null;
  const available = KINDS.filter((k) => content[k.key].length > 0).length;

  // Same markup and classes as «دروس الدورة» on the Study page (study.css).
  return (
    <div className="study-content-card cc-card">
      <div className="study-content-head">
        <span className="study-content-title">دروس الدورة</span>
        <span className="study-content-count">{available}/{KINDS.length} أقسام</span>
      </div>
      <div className="study-content-list">
        {KINDS.map((kind, i) => {
          const items = content[kind.key];
          const n = amount(content, kind.key);
          const isOpen = Boolean(open[kind.key]) && items.length > 0;
          return (
            <div key={kind.key} className={"study-unit-block" + (isOpen ? " is-open" : "")}>
              <button
                type="button"
                className="study-unit-toggle"
                aria-expanded={isOpen}
                disabled={!items.length}
                onClick={() => setOpen((o) => ({ ...o, [kind.key]: !o[kind.key] }))}
              >
                <span className="study-unit-num">{i + 1}</span>
                <span className="study-unit-name">{kind.label}</span>
                <span className="study-unit-meta">{!n ? "لا يوجد بعد" : kind.key === "live" ? liveSummary(items, n) : countAr(n, COUNT_WORDS[kind.key])}</span>
                <svg className="study-unit-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className="study-unit-lessons">
                {items.map((item) => {
                  // Lessons keep the old card's states: current lesson, ✓ done.
                  const isLesson = kind.key === "lessons";
                  const isDone = isLesson && done[item.id];
                  const isCurrent = isLesson && item.id === currentLessonId;
                  return (
                  <Link
                    key={item.id}
                    className={"study-lesson-item" + (isCurrent ? " active" : "") + (isDone ? " is-done" : "")}
                    aria-current={isCurrent ? "true" : undefined}
                    to={item.to}
                    state={isLesson ? lessonState : { from: `/dashboard/study/${courseId}` }}
                  >
                    <span className="study-lesson-icon">{isDone ? DoneIcon : kind.icon}</span>
                    <span className="study-lesson-info">
                      <span className="study-lesson-name">{item.title}</span>
                      <span className="study-lesson-meta">
                        {kind.key === "live" ? <LiveRowMeta session={item.session} /> : kind.key === "qcm" ? countAr(item.questions, COUNT_WORDS.qcm) : item.meta ? <bdi dir="ltr">{item.meta}</bdi> : kind.action}
                        {isDone && " · مكتمل"}
                      </span>
                    </span>
                  </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CourseContentSummary({ courseId }) {
  const content = useMemo(() => getCourseContent(courseId), [courseId]);
  if (!content) return null;
  return (
    <div className="cc-summary">
      <div className="cc-summary-head">
        <span>محتوى الدورة</span>
        <span className="cc-summary-lock"><LockIcon /> يُفتح بعد الاشتراك</span>
      </div>
      <ul className="cc-summary-list">
        {KINDS.map((kind) => {
          const n = amount(content, kind.key);
          return (
            <li key={kind.key} className={n ? "" : "is-empty"}>
              <span className="cc-icon">{kind.icon}</span>
              <span>
                <span className="cc-summary-label">{kind.label}</span>
                <span className="cc-summary-count">{n ? countAr(n, COUNT_WORDS[kind.key]) : "لا يوجد بعد"}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
