import { useId } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatPrice } from "../../../config/paymentConfig.js";
import { useCourseProgress } from "../../../features/courses/progress.js";
import { useCourseAccess } from "../../../features/payments/courseAccess.js";
import { REVIEW_STATUSES } from "../../../services/paymentService.js";
import CourseGlyph from "./CourseGlyph.jsx";

// Course tile, built to the reference card: cover photo with a subject tile
// beside it, a tinted panel whose top edge rises into tabs on both sides (an
// accent layer behind the right one), then title, unit and a bottom row that
// depends on the student's purchase (see CARD_STATE). The card is coloured by
// its legacy .diff-* class.
// The whole card is one action. Units are paid: an owned unit opens its study
// page, any other opens its checkout (a «قيد المراجعة» badge shows while a
// request is checked). While access is still loading the card goes to the
// study route, whose access gate decides.

// Bottom row of the card, from the server-side access (paymentService):
//   NOT_PURCHASED → the unit's price + «انضم للدورة»
//   PURCHASED     → lesson count + the student's progress
//   LOADING       → empty row of the same height, so nothing flips once access arrives
const CARD_STATE = { LOADING: "loading", NOT_PURCHASED: "not_purchased", PURCHASED: "purchased" };

// Card silhouette in the reference card's units (1000 × 727).
const PANEL_PATH =
  "M0 727V355C0 341 11 330 25 330H170C186 330 194 340 200 352L224 392C230 402 240 405 252 405H637C650 405 658 400 664 390L690 346C698 330 708 321 726 321H958C978 321 990 333 992 352L1000 400V727Z";
const PANEL_EDGE =
  "M0 355C0 341 11 330 25 330H170C186 330 194 340 200 352L224 392C230 402 240 405 252 405H637C650 405 658 400 664 390L690 346C698 330 708 321 726 321H958C978 321 990 333 992 352L1000 400";
const LAYER_PATH = "M636 410C650 410 658 400 662 388L700 280C707 258 720 246 744 246H948C964 246 975 257 975 273V410Z";
const TAB_TOP_PATH = "M664 390L690 346C698 330 708 321 726 321H958C978 321 990 333 992 352";

export default function CourseCard({ course }) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const uid = useId();
  const access = useCourseAccess(course.id);
  const ready = access.status === "ready";
  const owned = ready && access.hasAccess;
  const inReview = ready && REVIEW_STATUSES.includes(access.accessStatus);
  const target = ready && !owned ? `/dashboard/payment/course/${course.id}` : `/dashboard/study/${course.id}`;
  // «رجوع» on the next page returns to this exact list (e.g. ?view=my).
  const open = () => navigate(target, { state: { from: pathname + search } });

  // Payments unavailable (error) still offers the unit; its gate then explains.
  const state = owned ? CARD_STATE.PURCHASED : ready || access.status === "error" ? CARD_STATE.NOT_PURCHASED : CARD_STATE.LOADING;
  const { total: lessons, pct: progress } = useCourseProgress(course.id);
  const ids = { layer: uid + "l", panel: uid + "p", glow: uid + "g", blur: uid + "b", shade: uid + "s" };

  return (
    <div
      className={"unit-card " + course.accent}
      role="link"
      tabIndex={0}
      aria-label={course.title}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === "Enter") open();
      }}
    >
      <div className="unit-card-img">
        <img src={course.image} alt={course.title} />
      </div>
      <div className="unit-card-tile" aria-hidden="true">
        <CourseGlyph courseId={course.id} />
      </div>

      <svg className="unit-card-shape" viewBox="0 0 1000 727" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={ids.layer} gradientUnits="userSpaceOnUse" x1="0" y1="246" x2="0" y2="330">
            <stop className="uc-layer-hi" offset="0" />
            <stop className="uc-layer-lo" offset="1" />
          </linearGradient>
          <linearGradient id={ids.panel} gradientUnits="userSpaceOnUse" x1="0" y1="321" x2="0" y2="727">
            <stop className="uc-panel-hi" offset="0" />
            <stop className="uc-panel-lo" offset=".85" />
          </linearGradient>
          <radialGradient id={ids.glow} gradientUnits="userSpaceOnUse" cx="560" cy="460" r="260" gradientTransform="matrix(1 0 0 .45 0 253)">
            <stop className="uc-glow-in" offset="0" />
            <stop className="uc-glow-out" offset="1" />
          </radialGradient>
          <filter id={ids.blur} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id={ids.shade} x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        {/* Accent layer behind the right tab, with its glow. */}
        <path className="uc-layer-glow" filter={`url(#${ids.blur})`} transform="translate(10 14)" d={LAYER_PATH} />
        <path fill={`url(#${ids.layer})`} d={LAYER_PATH} />
        <path className="uc-tab-shade" filter={`url(#${ids.shade})`} transform="translate(0 -4)" d={TAB_TOP_PATH} />
        {/* The panel sliding over the photo: tinted, with a soft glow and a top highlight. */}
        <path fill={`url(#${ids.panel})`} d={PANEL_PATH} />
        <path fill={`url(#${ids.glow})`} d={PANEL_PATH} />
        <path className="uc-panel-rim" d={PANEL_EDGE} />
      </svg>

      {inReview && <span className="unit-card-badge is-review">قيد المراجعة</span>}

      <div className="unit-card-body">
        <h3 className="unit-card-title">{course.title}</h3>
        <p className="unit-card-unit">{course.unit}</p>

        {state === CARD_STATE.PURCHASED && (
          <div className="unit-card-footer">
            <span className="unit-card-lessons">
              <svg className="unit-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="6" width="14" height="12" rx="3" />
                <path d="m16 10.5 5-3v9l-5-3" />
                <path d="M7.5 9.8v4.4l3.6-2.2z" fill="currentColor" strokeWidth="1.4" />
              </svg>
              {lessons} {lessons >= 3 && lessons <= 10 ? "دروس" : "درس"}
            </span>
            <div className="unit-card-progress" role="progressbar" aria-label="التقدم" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
              <span className="unit-card-track">
                <span className="unit-card-fill" style={{ width: progress + "%" }}></span>
              </span>
              <span className="unit-card-pct">{progress}%</span>
            </div>
          </div>
        )}

        {state === CARD_STATE.NOT_PURCHASED && (
          <div className="unit-card-footer unit-card-buy">
            {access.price && (
              <span className="unit-card-price">
                <span className="unit-card-price-label">سعر الدورة</span>
                <span className="unit-card-price-value">{formatPrice(access.price.amount)}</span>
              </span>
            )}
            {/* Same action as the card (checkout); the click bubbles to it. */}
            <button type="button" className="unit-card-join" tabIndex={-1}>
              انضم للدورة
            </button>
          </div>
        )}

        {state === CARD_STATE.LOADING && <div className="unit-card-footer" aria-hidden="true"></div>}
      </div>
    </div>
  );
}
