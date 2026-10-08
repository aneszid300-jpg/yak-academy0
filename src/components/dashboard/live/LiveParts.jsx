import { useNavigate } from "react-router-dom";
import { getProfessor } from "../../../data/professors.js";
import { SUBJECT_NAMES } from "../../../data/courses.js";
import { sessionDuration, sessionTime } from "../../../features/live/status.js";

// The pieces of the Live page around the stage:
//   <LiveBadge status>          🔴 مباشر الآن / 🟡 تبدأ قريبًا / ⚪ انتهت الجلسة
//   <LiveHeader session status>   the top bar (Study page bar)
//   <LiveSessionInfo session>   «معلومات الجلسة» (+ «حول الجلسة» when there is one)
//   <LiveDetails session>       topics / files — only when the session has some
//   <LiveSkeleton>              same boxes as the loaded page, so nothing jumps

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const professorOf = (session) => (session.professorId ? getProfessor(session.professorId) : null);

export function LiveBadge({ status }) {
  return (
    <span className={`live-badge is-${status.tone}`}>
      <i aria-hidden="true" />
      {status.label}
    </span>
  );
}

export function BackButton({ onClick, label }) {
  return (
    <button type="button" className="study-back-btn live-back" onClick={onClick}>
      <BackIcon />
      {label}
    </button>
  );
}

// Same bar as the Study page (.study-topbar, study.css): subject chip (+ the
// live status) · session title · «العودة للرئيسية». Professor and time are in
// «معلومات الجلسة» below. While the session is more than an hour away no
// status is shown.
export function LiveHeader({ session, status }) {
  const navigate = useNavigate();
  const subject = SUBJECT_NAMES[session.subjectKey];
  return (
    <header className="study-topbar live-topbar">
      <div className="live-topbar-start">
        {subject && <div className="study-top-meta">{subject}</div>}
        {/* announced when the session starts or ends while the page is open */}
        <div aria-live="polite">{!status.farOff && <LiveBadge status={status} />}</div>
      </div>
      <h1 className="study-top-title live-topbar-title">{session.title}</h1>
      <button type="button" className="study-back-btn" onClick={() => navigate("/dashboard")}>
        العودة للرئيسية
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
    </header>
  );
}

export function LiveSessionInfo({ session }) {
  const professor = professorOf(session);
  const facts = [
    SUBJECT_NAMES[session.subjectKey] && ["المادة", SUBJECT_NAMES[session.subjectKey]],
    session.kind && ["نوع الجلسة", session.kind],
    professor && ["الأستاذ", professor.name],
    ["الموعد", <><bdi dir="ltr">{sessionTime(session)}</bdi> · {sessionDuration(session)}</>],
  ].filter(Boolean);
  return (
    <section className="live-card" aria-labelledby="liveInfo">
      <h2 id="liveInfo" className="live-card-title">معلومات الجلسة</h2>
      <dl className="live-facts">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {session.description && (
        <>
          <h3 className="live-card-sub">حول الجلسة</h3>
          <p className="live-desc">{session.description}</p>
        </>
      )}
    </section>
  );
}

export function LiveDetails({ session }) {
  if (!session.topics.length && !session.resources.length) return null;
  return (
    <section className="live-card live-details" aria-labelledby="liveDetails">
      <h2 id="liveDetails" className="live-card-title">تفاصيل الجلسة</h2>
      <div className="live-details-grid">
        {session.topics.length > 0 && (
          <div>
            <h3 className="live-card-sub">المحاور</h3>
            <ul className="live-topics">
              {session.topics.map((topic) => <li key={topic}>{topic}</li>)}
            </ul>
          </div>
        )}
        {session.resources.length > 0 && (
          <div>
            <h3 className="live-card-sub">ملفات الجلسة</h3>
            <ul className="live-resources">
              {session.resources.map((r) => (
                <li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export function StageSkeleton() {
  return <div className="live-stage is-loading payment-skeleton" aria-hidden="true" />;
}

export function LiveSkeleton() {
  return (
    <div className="live-page" aria-busy="true" aria-label="جاري تحميل الجلسة">
      <div className="study-topbar live-topbar">
        <div className="payment-skeleton" style={{ width: 90, height: 30, borderRadius: 999 }} />
        <div className="payment-skeleton" style={{ width: "min(280px, 50%)", height: 20, borderRadius: 8 }} />
        <div className="payment-skeleton" style={{ width: 140, height: 36, borderRadius: 999 }} />
      </div>
      <div className="live-layout">
        <StageSkeleton />
        <div className="live-card payment-skeleton" style={{ height: 230 }} />
      </div>
    </div>
  );
}
