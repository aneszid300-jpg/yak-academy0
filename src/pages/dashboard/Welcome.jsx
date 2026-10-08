import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getFullName } from "../../utils/userName.js";
import { yakLogoPurple } from "../../assets/images/index.js";

// بطاقة الترحيب — /dashboard/welcome. A business-card-sized welcome: the
// front greets the student by name; a click (or Enter / Space) turns it over
// to a letter from the Yak team with our signature. Made to be screenshotted
// and kept. Opens once, on the student's first visit (DashboardLayout +
// features/welcome/firstVisit.js); after that, from الإعدادات.
// Motion: entrance, idle float, pointer tilt + light sheen, 3D flip — CSS
// transforms only; tilt/float off with prefers-reduced-motion.

const MONTHS = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const dayAr = (iso) => {
  const d = iso ? new Date(iso) : new Date();
  return Number.isNaN(d.getTime()) ? null : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const FlipIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const Underline = () => (
  <svg className="wc-underline" viewBox="0 0 120 15" fill="none" stroke="#FACC15" strokeWidth="6" strokeLinecap="round" aria-hidden="true">
    <path d="M 4 5 C 35 2, 85 8, 116 4" />
    <path d="M 12 11 C 45 9, 75 12, 108 10" />
  </svg>
);

export default function Welcome() {
  const { user } = useAuth();
  const firstVisit = useLocation().state?.firstVisit === true;
  const fullName = getFullName(user);
  const first = fullName.split(/\s+/)[0] || "";
  const joined = dayAr(user?.created_at);
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef(null);
  const frame = useRef(0);

  const flip = useCallback(() => setFlipped((f) => !f), []);

  // Pointer tilt: a few degrees toward the cursor + a moving sheen.
  const onMove = (e) => {
    const el = cardRef.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${((y + 0.5) * 100).toFixed(1)}%`);
    });
  };
  const onLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <section className="wc-page">
      <div className="wc-stage">
        <div className="wc-tilt" ref={cardRef} onPointerMove={onMove} onPointerLeave={onLeave}>
          <button
            type="button"
            className={"wc-card" + (flipped ? " is-flipped" : "")}
            onClick={flip}
            aria-pressed={flipped}
            aria-label={flipped ? "اقلب البطاقة إلى الوجه الأمامي" : "اقلب البطاقة لقراءة رسالتك"}
          >
            {/* ---------- front ---------- */}
            <span className="wc-face wc-front" aria-hidden={flipped}>
              <span className="wc-marks" aria-hidden="true" />
              <span className="wc-sheen" aria-hidden="true" />
              <img className="wc-logo" src={yakLogoPurple} alt="Yak Academy" />
              <span className="wc-greet">
                <span className="wc-hello">مرحبًا بك</span>
                {first && <span className="wc-name">{first}</span>}
                <span className="wc-in">
                  في <span className="wc-yak">ياك<Underline /></span>
                </span>
                <span className="wc-tagline">من هنا تبدأ رحلتك نحو الباك</span>
              </span>
            </span>

            {/* ---------- back: the letter ---------- */}
            <span className="wc-face wc-back" aria-hidden={!flipped}>
              <span className="wc-back-mark" aria-hidden="true" />
              <span className="wc-back-logo" style={{ backgroundImage: `url(${yakLogoPurple})` }} aria-hidden="true" />
              <span className="wc-letter">
                <span className="wc-to">إلى {fullName || "صديقنا الجديد"}</span>
                <span className="wc-line">أهلًا بك في بيتك الجديد. من اليوم، لن يكون تعبك صامتًا، ولن تمشي طريقك وحدك.</span>
                <span className="wc-line">نعرف ثقل الحلم الذي تحمله، والليالي التي سألت فيها نفسك: «هل سأقدر؟»… وجوابنا لك من الآن: نعم، ستقدر. وسيأتي يومٌ تتذكّر فيه هذه البداية وتبتسم.</span>
                <span className="wc-promise">
                  نحن نؤمن بك، ومعك خطوةً بخطوة، حتى تقول بفخر: <b>«نجحت»</b>.
                </span>
              </span>
              <span className="wc-sign">
                <span className="wc-sign-by">بكل حب</span>
<span className="wc-signature" role="img" aria-label="توقيع Yak Academy" />
                <b>فريق Yak Academy</b>
              </span>
              {/* our gold seal, pressed on above the date */}
              <span className="wc-dated">
                <span className="wc-seal" aria-hidden="true" />
                {joined && <span className="wc-date">{joined}</span>}
              </span>
            </span>
          </button>
        </div>
      </div>

      <div className="wc-after">
        <button type="button" className="wc-flip-btn" onClick={flip}>
          <FlipIcon />
          {flipped ? "عرض الوجه الأمامي" : "رسالة كُتبت لك من القلب"}
        </button>
        {firstVisit && (
          <Link to="/dashboard" replace className="wc-start">
            ابدأ رحلتك في ياك
          </Link>
        )}
        <p className="wc-keep">
          صوّر بطاقتك واحتفظ بها، ذكرى من أول يوم لك في ياك.
        </p>
      </div>
    </section>
  );
}
