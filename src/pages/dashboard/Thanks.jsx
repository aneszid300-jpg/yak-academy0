import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getFullName } from "../../utils/userName.js";
import { getCourse } from "../../data/courses.js";
import { useCoursesAccess } from "../../features/payments/courseAccess.js";
import { thanksDate } from "../../features/thanks/letters.js";
import { yakLogoPurple } from "../../assets/images/index.js";

// رسالة الشكر — /dashboard/thanks?course=<id>. After a course is bought:
// a sealed paper envelope (real folds, paper grain, a thread under the
// wax) addressed to the student; the seal is broken, the flap
// opens and a thank-you letter for that course comes out — the same paper:
// letterhead, the letter, our signature and the gold seal. Not the welcome card's flip: an envelope.
// Opens by itself, full screen, when a course becomes the student's
// (DashboardLayout + features/thanks/letters.js); again from الإعدادات, where
// every letter is kept. Only for a course the student owns.
// Motion: CSS only (seal, flap, the letter unfolding), off with
// prefers-reduced-motion — the letter then opens at once.

const MONTHS = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const dayAr = (iso) => {
  const d = iso ? new Date(iso) : new Date();
  return Number.isNaN(d.getTime()) ? null : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const OPEN_MS = 1650; // seal → flap → paper rises → envelope sinks, then the letter

export default function Thanks() {
  const { user } = useAuth();
  const first = getFullName(user).split(/\s+/)[0] || "";
  const [params] = useSearchParams();
  const { status, access } = useCoursesAccess();
  const afterPurchase = useLocation().state?.afterPurchase === true;

  const course = getCourse(params.get("course"));
  const owned = Boolean(course && access[course.id]?.hasAccess);
  const date = dayAr(course ? thanksDate(access[course.id]) : null);

  // closed → opening (envelope animates) → open (the letter)
  const [phase, setPhase] = useState("closed");
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const open = () => {
    if (phase !== "closed") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setPhase("open");
    setPhase("opening");
    timer.current = setTimeout(() => setPhase("open"), OPEN_MS);
  };
  const replay = () => {
    clearTimeout(timer.current);
    setPhase("closed");
  };

  // A letter only for a course that is the student's.
  if (status === "ready" && !owned) return <Navigate to="/dashboard/settings" replace />;
  if (!owned) return <section className="ty-page" />;

  return (
    <section className="ty-page">
      {phase !== "open" ? (
        <div className={"ty-stage" + (phase === "opening" ? " is-opening" : "")}>
          <button
            type="button"
            className={"ty-env" + (phase === "opening" ? " is-opening" : "")}
            onClick={open}
            aria-label="افتح رسالة الشكر"
          >
            <span className="ty-env-back" aria-hidden="true" />
            <span className="ty-env-paper" aria-hidden="true">
              <span className="ty-env-paper-title">شكرًا لك</span>
              <span className="ty-env-paper-line" />
              <span className="ty-env-paper-line" />
              <span className="ty-env-paper-line is-short" />
            </span>
            {/* paper folds: two side flaps, the bottom flap, then the top flap */}
            <span className="ty-fold is-left" aria-hidden="true"><span /></span>
            <span className="ty-fold is-right" aria-hidden="true"><span /></span>
            <span className="ty-fold is-bottom" aria-hidden="true"><span /></span>
            <span className="ty-env-flap" aria-hidden="true"><span /></span>
            {/* the thread pressed under the wax */}
            <svg className="ty-thread" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path className="ty-thread-shadow" d="M50 58 C 47 72, 45 86, 48 96 C 51 105, 62 110, 70 104 C 74 101, 78 104, 80 109" />
              <path d="M50 58 C 47 72, 45 86, 48 96 C 51 105, 62 110, 70 104 C 74 101, 78 104, 80 109" />
              <path className="ty-thread-tail" d="M50 58 C 53 52, 56 49, 60 48" />
            </svg>
            <span className="ty-seal" aria-hidden="true" />
            <span className="ty-env-light" aria-hidden="true" />
            <span className="ty-env-to">
              <span>{first ? `إلى ${first}` : "إليك"}</span>
              <small>من فريق Yak Academy</small>
            </span>
          </button>
          <p className="ty-hint">رسالة صغيرة، بمناسبة خطوتك الكبيرة</p>
          <button type="button" className="ty-open-btn" onClick={open} disabled={phase !== "closed"}>
            افتح الرسالة
          </button>
        </div>
      ) : (
        <div className="ty-result">
          <article className="ty-letter">
            <span className="ty-letter-folds" aria-hidden="true" />

            <header className="ty-head">
              <img className="ty-logo" src={yakLogoPurple} alt="Yak Academy" />
              {date && <span className="ty-date">{date}</span>}
            </header>

            <div className="ty-body">
              <h2 className="ty-title">شكرًا لثقتك{first ? ` يا ${first}` : ""}</h2>
              <p className="ty-line">اخترت اليوم أن تستثمر في نفسك، وهذا أجمل قرار يمكن أن تتخذه من أجل حلمك.</p>
              <p className="ty-line">
                دورة <b>{course.title}</b> أصبحت لك الآن، وكل درس فيها حضّرناه كأننا نحضّره لك وحدك.
              </p>

              <p className="ty-promise">لن نخذل ثقتك. ابدأ الآن، ونحن معك حتى آخر درس… وحتى يوم النجاح.</p>

              <footer className="ty-foot">
                <span className="ty-sign">
                  <span className="ty-sign-by">بكل حب</span>
                  <span className="ty-signature" role="img" aria-label="توقيع Yak Academy" />
                  <b>فريق Yak Academy</b>
                </span>
                <span className="ty-letter-seal" aria-hidden="true" />
              </footer>
            </div>
          </article>

          <div className="ty-actions">
            <Link to={`/dashboard/study/${course.id}`} className="ty-start">
              ابدأ الدورة الآن
            </Link>
            {afterPurchase ? (
              <Link to="/dashboard" replace className="ty-replay">
                الرئيسية
              </Link>
            ) : (
              <button type="button" className="ty-replay" onClick={replay}>
                أعد فتح الرسالة
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
