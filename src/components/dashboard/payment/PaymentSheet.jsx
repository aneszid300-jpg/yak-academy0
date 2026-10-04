import { PAYMENT_FOOTNOTE } from "../../../config/paymentConfig.js";
import { ArrowBackIcon, CloseIcon, ShieldIcon } from "./icons.jsx";

/**
 * The Yak payment "sheet": a notebook page with its binding (dashed edge +
 * ring holes) on the left, a kicker line with back / close, a title block,
 * the step's content and a footnote. Every payment step and state is drawn
 * inside one of these, so the whole flow reads as one object.
 *
 *   kicker   small line above the title (e.g. «YAK · الدفع»)
 *   icon     optional element shown in a tinted square before the title
 *   tone     tint of that square: "violet" | "blue" | "amber" | "green"
 *   wide     two-pane steps (instructions + form) get more room
 */
export default function PaymentSheet({ kicker = "YAK · الدفع", title, subtitle, icon, tone = "violet", aside, onBack, onClose, wide, footnote = PAYMENT_FOOTNOTE, children, testId }) {
  return (
    <div className={"pay-sheet" + (wide ? " is-wide" : "")} data-state={testId}>
      <div className="pay-sheet-main">
        <header className="pay-sheet-head">
          <div className="pay-sheet-bar">
            {onBack && (
              <button type="button" className="pay-icon-btn" aria-label="رجوع" onClick={onBack}>
                <ArrowBackIcon />
              </button>
            )}
            <span className="pay-sheet-kicker">{kicker}</span>
            {onClose && (
              <button type="button" className="pay-icon-btn pay-sheet-close" aria-label="إغلاق" onClick={onClose}>
                <CloseIcon />
              </button>
            )}
          </div>
          {title && (
            <div className="pay-sheet-title-row">
              {icon && <span className={`pay-tile tone-${tone}`}>{icon}</span>}
              <div className="min-w-0 flex-1">
                <h1 className="pay-sheet-title">{title}</h1>
                {subtitle && <p className="pay-sheet-sub">{subtitle}</p>}
              </div>
              {aside}
            </div>
          )}
        </header>
        <div className="pay-sheet-body">{children}</div>
        {footnote && (
          <footer className="pay-sheet-foot">
            <ShieldIcon />
            {footnote}
          </footer>
        )}
      </div>
      <div className="pay-sheet-binding" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}
