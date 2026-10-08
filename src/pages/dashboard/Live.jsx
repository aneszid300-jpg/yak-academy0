import { Suspense } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useLiveSession } from "../../features/live/useLiveSession.js";
import { useLiveStatus } from "../../features/live/status.js";
import { getLiveProvider } from "../../features/live/providers.jsx";
import { BackButton, LiveDetails, LiveHeader, LiveSessionInfo, LiveSkeleton, StageSkeleton } from "../../components/dashboard/live/LiveParts.jsx";

// الجلسة المباشرة — /dashboard/live/:sessionId (lazy route, see App.jsx).
//   header  ← back · the session (subject, title, professor, time) · status
//   stage   the main element — filled by the session's provider (V1 Zoom)
//   side    «معلومات الجلسة»; «تفاصيل الجلسة» below when the session has any
// Data: liveService (useLiveSession) → loading / not found / error states;
// status from the schedule (useLiveStatus), re-checked while the page is open.

export default function Live() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const live = useLiveSession(sessionId);
  const status = useLiveStatus(live.session);

  const from = location.state?.from || "/dashboard";
  const back = () => navigate(from);
  const backLabel = from === "/dashboard" ? "العودة للرئيسية" : "رجوع";

  if (live.state === "loading") return <LiveSkeleton />;

  if (live.state !== "ready") {
    const notFound = live.state === "not_found";
    return (
      <section className="live-page">
        <div className="live-head">
          <BackButton onClick={back} label={backLabel} />
        </div>
        <div className="live-card live-problem" role="alert">
          <h1 className="live-problem-title">{notFound ? "الجلسة غير موجودة" : "تعذر تحميل الجلسة"}</h1>
          <p className="live-problem-text">
            {notFound ? "الرابط غير صحيح أو أن الجلسة لم تعد متوفرة." : "تحقق من اتصالك بالإنترنت ثم أعد المحاولة."}
          </p>
          {notFound ? (
            <Link to="/dashboard" className="btn-violet">العودة للرئيسية</Link>
          ) : (
            <button type="button" className="btn-violet" onClick={live.reload}>إعادة المحاولة</button>
          )}
        </div>
      </section>
    );
  }

  const { session } = live;
  const { Stage } = getLiveProvider(session);

  return (
    <section className="live-page">
      <LiveHeader session={session} status={status} />
      <div className="live-layout">
        <div className="live-main">
          <Suspense fallback={<StageSkeleton />}>
            <Stage session={session} status={status} onRetry={live.reload} backTo={from} />
          </Suspense>
        </div>
        <aside className="live-side">
          <LiveSessionInfo session={session} />
        </aside>
      </div>
      <LiveDetails session={session} />
    </section>
  );
}
