import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SUBJECT_NAMES } from "../../../data/courses.js";
import { listLiveSessions } from "../../../services/liveService.js";
import { useCoursesAccess } from "../../../features/payments/courseAccess.js";
import { canSeeLiveSession } from "../../../features/live/access.js";
import { useLiveStatus } from "../../../features/live/status.js";

// Home → the student's live sessions, one card at a time (the legacy live
// card), cycling every ROTATE_MS in an endless loop with a fade + slight
// slide. Sessions come from liveService; only those the student has access to
// (features/live/access.js) are shown. Dots jump to a session; on touch
// screens a swipe moves too. Any manual move, hover or keyboard focus pauses
// the rotation, which resumes RESUME_MS later; it also stops while the tab is
// hidden or the student prefers reduced motion. One session → no dots, no
// rotation. «انضم الآن» opens /dashboard/live/:sessionId of the card shown.

const ROTATE_MS = 5500;
const RESUME_MS = 8000;
const CARD =
  "flex items-center justify-between gap-3 rounded-2xl border border-hero-border bg-hero-bg px-4 py-3 shadow-(--shadow-subtle) transition-[background,border-color] duration-300";
const BADGE_BG = { live: "bg-[#EF4444]", soon: "bg-[#D97706]", ended: "bg-[#9CA3AF]" };
const BUTTON_STYLE = { padding: "8px 16px", fontSize: 12, whiteSpace: "nowrap", flexShrink: 0 };

function LiveCard({ session, index, total }) {
  const navigate = useNavigate();
  const status = useLiveStatus(session);
  const subject = SUBJECT_NAMES[session.subjectKey];
  return (
    <div className={CARD + " live-carousel-card"} role="group" aria-roledescription="شريحة" aria-label={`${index + 1} من ${total}: ${session.title}`}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className={"rounded-[20px] px-[9px] py-[3px] text-[10px] font-bold whitespace-nowrap text-white " + BADGE_BG[status.key]}>{status.short}</div>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[13px] font-extrabold text-text-main">{session.title}</span>
            {subject && <span className="live-carousel-subject">{subject}</span>}
          </div>
          <div className="mt-0.5 text-[11px] text-text-muted" dir="ltr" style={{ textAlign: "right" }}>{`${session.startsAt} - ${session.endsAt}`}</div>
        </div>
      </div>
      <button
        type="button"
        className="btn-violet"
        style={BUTTON_STYLE}
        onClick={() => navigate(`/dashboard/live/${session.id}`, { state: { from: "/dashboard" } })}
      >
        انضم الآن
      </button>
    </div>
  );
}

function useSessions() {
  const [data, setData] = useState({ state: "loading", sessions: [] });
  const load = useCallback(async () => {
    setData({ state: "loading", sessions: [] });
    try {
      setData({ state: "ready", sessions: await listLiveSessions() });
    } catch {
      setData({ state: "error", sessions: [] });
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return { ...data, reload: load };
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function LiveCarousel() {
  const { state, sessions: all, reload } = useSessions();
  const access = useCoursesAccess();
  const sessions = all.filter((s) => canSeeLiveSession(s, access));
  const total = sessions.length;

  const [index, setIndex] = useState(0);
  const [pausedUntil, setPausedUntil] = useState(0); // manual move → pause until then
  const [hovered, setHovered] = useState(false);
  const touchX = useRef(null);
  const current = total ? index % total : 0;

  const go = (next) => {
    setIndex((next + total) % total);
    setPausedUntil(Date.now() + RESUME_MS);
  };

  // Auto-play: one step every ROTATE_MS while nothing pauses it.
  useEffect(() => {
    if (total < 2 || hovered || reducedMotion()) return undefined;
    const wait = Math.max(ROTATE_MS, pausedUntil - Date.now());
    const id = setTimeout(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % total);
      else setPausedUntil(Date.now()); // try again on the next tick
    }, wait);
    return () => clearTimeout(id);
  }, [index, total, hovered, pausedUntil]);

  if (state === "loading" || (state === "ready" && access.status !== "ready" && access.status !== "error")) {
    return <div className={CARD + " mb-1 payment-skeleton"} style={{ height: 62 }} aria-label="جاري تحميل الجلسات المباشرة" />;
  }
  if (state === "error") {
    return (
      <div className={CARD + " mb-1"} role="alert">
        <div className="text-[12.5px] font-bold text-text-muted">تعذر تحميل الجلسات المباشرة.</div>
        <button type="button" className="btn-outline" style={BUTTON_STYLE} onClick={reload}>إعادة المحاولة</button>
      </div>
    );
  }
  if (total === 0) {
    return (
      <div className={CARD + " mb-1"}>
        <div className="min-w-0">
          <div className="text-[13px] font-extrabold text-text-main">لا توجد جلسات مباشرة متاحة لك حاليًا</div>
          <div className="mt-0.5 text-[11px] text-text-muted">الحصص المباشرة تأتي مع الدورات التي تشترك فيها.</div>
        </div>
        <Link to="/dashboard/courses" className="btn-outline" style={BUTTON_STYLE}>تصفح الدورات</Link>
      </div>
    );
  }

  return (
    <section
      className="live-carousel mb-1"
      aria-roledescription="عرض متتابع"
      aria-label="الجلسات المباشرة"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null || total < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(current + (dx > 0 ? 1 : -1)); // RTL: swipe right → next
      }}
    >
      <div aria-live={pausedUntil > Date.now() ? "polite" : "off"}>
        {/* keyed: each session enters with the fade + slide */}
        <LiveCard key={sessions[current].id} session={sessions[current]} index={current} total={total} />
      </div>
      {total > 1 && (
        <div className="live-carousel-dots" role="tablist" aria-label="اختر الجلسة">
          {sessions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={s.title}
              className={"live-carousel-dot" + (i === current ? " is-active" : "")}
              onClick={() => go(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
