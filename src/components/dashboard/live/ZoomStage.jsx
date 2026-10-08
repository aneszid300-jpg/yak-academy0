import { Link } from "react-router-dom";
import { startsIn } from "../../../features/live/status.js";
import { recordAttendance } from "../../../services/classService.js";

// Stage of the Live page when the session runs in Zoom (V1). A Yak-branded
// area in place of the video that tells the student what to do now:
//   soon  — when it starts; the join button opens JOIN_EARLY_MIN before
//   live  — «الانضمام عبر Zoom» (opens the meeting in a new tab)
//   ended — say so, the recording when there is one, a way back
// The meeting link is session.provider.joinUrl (data/liveSessions.js, later
// the backend). While it is missing, nothing pretends to connect: the button
// stays off and «تحديث» re-fetches the session.

const VideoIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="2" y="6" width="14" height="12" rx="3" />
    <path d="m16 10 6-3v10l-6-3z" />
  </svg>
);
const ExternalIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Joining counts as attending (the professor sees it in «الجلسات»).
function JoinButton({ url, sessionId }) {
  return url ? (
    <a className="btn-violet live-stage-btn" href={url} target="_blank" rel="noopener noreferrer" onClick={() => recordAttendance(sessionId, todayIso())}>
      الانضمام عبر Zoom
      <ExternalIcon />
      <span className="sr-only">(يفتح في نافذة جديدة)</span>
    </a>
  ) : (
    <button type="button" className="btn-violet live-stage-btn" disabled>الانضمام عبر Zoom</button>
  );
}

export default function ZoomStage({ session, status, onRetry, backTo }) {
  const url = session.provider?.joinUrl || null;
  let title, text, actions;

  if (status.canJoin) {
    title = status.key === "live" ? "الجلسة جارية الآن" : `تبدأ الجلسة ${startsIn(status.minutesToStart)}`;
    text = url
      ? status.key === "live"
        ? "انضم إلى البث المباشر وتابع الأستاذ مع زملائك."
        : "يمكنك الدخول الآن والاستعداد قبل انطلاق الجلسة."
      : "رابط الانضمام غير متاح بعد. سيُضاف من طرف فريق Yak Academy، حدّث الصفحة بعد قليل.";
    actions = (
      <>
        <JoinButton url={url} sessionId={session.id} />
        {!url && <button type="button" className="live-stage-link" onClick={onRetry}>تحديث</button>}
      </>
    );
  } else if (status.key === "soon") {
    title = `تبدأ الجلسة على الساعة ${session.startsAt}`;
    text = `${startsIn(status.minutesToStart)}. سيتفعّل زر الانضمام قبل بداية الجلسة بقليل، ابقَ على هذه الصفحة أو عُد في الموعد.`;
  } else {
    title = "انتهت الجلسة";
    text = session.recordingUrl ? "تسجيل الجلسة متاح الآن." : "شكرًا لمشاركتك. سيظهر تسجيل الجلسة هنا عند توفره.";
    actions = session.recordingUrl ? (
      <a className="btn-violet live-stage-btn" href={session.recordingUrl} target="_blank" rel="noopener noreferrer">مشاهدة التسجيل</a>
    ) : (
      <Link className="live-stage-link" to={backTo}>العودة للرئيسية</Link>
    );
  }

  return (
    <div className={`live-stage is-${status.canJoin ? "live" : status.tone}`}>
      <div className="live-stage-inner">
        <span className="live-stage-icon"><VideoIcon width={30} height={30} /></span>
        <h2 className="live-stage-title">{title}</h2>
        <p className="live-stage-text">{text}</p>
        {actions && <div className="live-stage-actions">{actions}</div>}
        <span className="live-stage-provider">البث عبر Zoom</span>
      </div>
    </div>
  );
}
