import { formatPrice } from "../../../config/paymentConfig.js";
import { devTools, isMockPayments } from "../../../services/paymentService.js";
import { AlertIcon, BigCheckIcon, ClockIcon, CrossIcon, LockIcon, SendIcon } from "./icons.jsx";
import { METHOD_LABELS, formatPayDate } from "./messages.js";

const TONE_ICONS = { ok: BigCheckIcon, wait: ClockIcon, bad: CrossIcon, sent: SendIcon, lock: LockIcon, alert: () => <AlertIcon width={28} height={28} /> };

/**
 * One payment state, centred in a Yak card: icon, title, text, optional status
 * chip, body (facts / includes) and actions.
 *   tone: "ok" | "wait" | "bad" | "info"; icon: key of TONE_ICONS
 */
export function StatusCard({ tone = "info", icon, title, text, chip, children, actions, note, testId, bare = false }) {
  const Icon = TONE_ICONS[icon || { ok: "ok", wait: "wait", bad: "bad" }[tone] || "lock"];
  // `bare`: drawn inside a payment sheet, so no card of its own.
  return (
    <div className={`${bare ? "" : "section-card "}payment-status tone-${tone}`} data-state={testId} role="status">
      <div className="payment-status-icon"><Icon /></div>
      <div className="payment-status-title">{title}</div>
      {text && <p className="payment-status-text">{text}</p>}
      {chip && <span className={`payment-chip tone-${chip.tone}`}>{chip.label}</span>}
      {children && <div className="payment-status-body">{children}</div>}
      {actions && <div className="payment-actions">{actions}</div>}
      {note && <div className="payment-status-note">{note}</div>}
    </div>
  );
}

/** Purchase facts: method, amount, reference, date. */
export function PurchaseFacts({ purchase }) {
  const rows = [
    ["طريقة الدفع", METHOD_LABELS[purchase.paymentMethod]],
    ["المبلغ", formatPrice(purchase.amount)],
    purchase.reference && ["رقم العملية", purchase.reference],
    purchase.paidOn && ["تاريخ الدفع", formatPayDate(purchase.paidOn)],
    ["رقم الطلب", purchase.id],
  ].filter(Boolean);
  return (
    <dl className="payment-facts">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd dir="auto">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Shown on payment pages while the development mock is active. */
export function MockNotice() {
  if (!isMockPayments) return null;
  return (
    <div className="payment-mock-note" role="note">
      وضع تجريبي (Mock): لا تتم أي عملية دفع حقيقية، والبيانات محفوظة في هذا التبويب فقط.
    </div>
  );
}

/** Mock only: simulate the Yak team's decision on a submitted proof. */
export function MockReviewTools({ purchase }) {
  if (!devTools || !purchase) return null;
  return (
    <div className="payment-mock-tools">
      <span>محاكاة قرار فريق Yak (وضع تجريبي فقط)</span>
      <button type="button" className="payment-link-btn" onClick={() => devTools.review(purchase.id, "under_review")}>قيد المراجعة</button>
      <button type="button" className="payment-link-btn" onClick={() => devTools.review(purchase.id, "approved")}>قبول الدفع</button>
      <button type="button" className="payment-link-btn is-danger" onClick={() => devTools.review(purchase.id, "rejected")}>رفض الدفع</button>
    </div>
  );
}
