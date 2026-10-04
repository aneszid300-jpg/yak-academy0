import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../../config/paymentConfig.js";
import { createPurchase, createSlickPayPayment } from "../../../services/paymentService.js";
import { yakLogoPurple } from "../../../assets/images/index.js";
import { AlertIcon, CardIcon } from "./icons.jsx";
import { paymentErrorMessage } from "./messages.js";

// Slick-Pay: the server creates the purchase and the Slick-Pay invoice and
// returns its payment URL → the student pays on Slick-Pay's page → comes back
// to /dashboard/payment/return/:purchaseId, where the SERVER verifies it.
// `resumePurchase` continues an unfinished Slick-Pay attempt.

export async function startSlickPay(courseId, resumePurchase) {
  const purchase = resumePurchase || (await createPurchase("course", courseId, "slickpay"));
  const { paymentUrl } = await createSlickPayPayment(purchase.id);
  return paymentUrl;
}

export function goToPaymentUrl(paymentUrl, navigate) {
  // The real backend returns Slick-Pay's external page; the mock an internal one.
  if (paymentUrl.startsWith("/")) navigate(paymentUrl);
  else window.location.assign(paymentUrl);
}

export default function SlickPayPayment({ method, course, price, onCancel }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handlePay() {
    setBusy(true);
    setError(null);
    try {
      goToPaymentUrl(await startSlickPay(course.id), navigate);
    } catch (err) {
      setError(paymentErrorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="pay-split" data-panel={method.id}>
      <section className="pay-pane pay-pane-brand" aria-label="المبلغ">
        <img src={yakLogoPurple} alt="Yak Academy" className="pay-brand-logo" />
        <hr className="payment-divider" />
        <div className="pay-brand-label">المبلغ</div>
        <div className="pay-brand-amount">{formatPrice(price.amount)}</div>
        <div className="pay-brand-meta">{`${course.title} · ${course.unit}`}</div>
      </section>

      <section className="pay-pane pay-pane-form" aria-label="الدفع عبر Slick-Pay">
        <div className="pay-pane-title">كيف يتم الدفع؟</div>
        <ol className="payment-steps">
          {method.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        {error && <div className="payment-inline-error" role="alert"><AlertIcon />{error}</div>}

        <div className="pay-actions">
          <button type="button" className="btn-violet payment-btn" onClick={handlePay} disabled={busy}>
            {busy ? <span className="payment-spinner" aria-hidden="true"></span> : <CardIcon width={16} height={16} />}
            {busy ? "جاري تجهيز عملية الدفع..." : "ادفع الآن"}
          </button>
          <button type="button" className="btn-outline payment-btn" onClick={onCancel} disabled={busy}>إلغاء</button>
        </div>
        <p className="payment-field-hint pay-actions-hint" role="status">
          لن يُخصم أي مبلغ قبل تأكيدك في صفحة Slick-Pay، ولا تُفعَّل الوحدة إلا بعد تحققنا من الدفع.
        </p>
      </section>
    </div>
  );
}
