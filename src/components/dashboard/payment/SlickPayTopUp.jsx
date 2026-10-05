import { useState } from "react";
import { CURRENCY, TERMS_URL } from "../../../config/paymentConfig.js";
import { yakLogoPurple } from "../../../assets/images/index.js";
import { EMPTY_PAYER, cleanPayer, payerErrors } from "../../../features/payments/payer.js";
import { SLICKPAY_CONNECTED, requestSlickPayCheckout } from "../../../features/payments/slickPay.js";
import { useTopUpAmount } from "../../../features/payments/topUpAmount.js";
import PayerFields, { AmountField } from "./PayerFields.jsx";
import { AlertIcon, CardIcon } from "./icons.jsx";
import { paymentErrorMessage } from "./messages.js";

// Shown when «إدفع الآن» is pressed while Slick-Pay is not connected.
const NOT_CONNECTED = "الدفع الإلكتروني عبر Slick-Pay غير متاح بعد. لم تتم أي عملية دفع ولم يُسجَّل أي طلب.";

// «الدفع الإلكتروني» screen of «شحن المحفظة»: the amount on the right, the
// student's form on the left. «إدفع الآن» → handleSlickPayPayment():
// validates the form, then calls requestSlickPayCheckout (features/payments/
// slickPay.js). Slick-Pay is NOT CONNECTED yet: that call always fails, the
// screen says so, and nothing is created, paid or unlocked. Once connected it
// returns the SATIM page URL to redirect to. The amount is the unit's price
// (server-set, read-only), or typed when opened from «محفظتي».
export default function SlickPayTopUp({ course, price }) {
  const [form, setForm] = useState(EMPTY_PAYER);
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const top = useTopUpAmount(price);
  const errors = touched ? payerErrors(form) : {};
  const termsMissing = touched && !agreed;

  async function handleSlickPayPayment(event) {
    event.preventDefault();
    setTouched(true);
    if (Object.keys(payerErrors(form)).length || !agreed || !top.amount) return;
    setBusy(true);
    setError(null);
    try {
      const { paymentUrl } = await requestSlickPayCheckout({ courseId: course?.id ?? null, amount: top.amount, payer: cleanPayer(form) });
      window.location.assign(paymentUrl); // SATIM hosted payment page
    } catch (err) {
      setError(err?.code === "unavailable" ? NOT_CONNECTED : paymentErrorMessage(err));
      setBusy(false);
    }
  }

  function clear() {
    setForm(EMPTY_PAYER);
    top.setInput("");
    setAgreed(false);
    setTouched(false);
    setError(null);
  }

  return (
    <div className="ccp-topup">
      <section className="slick-topup-amount" aria-label="المبلغ">
        <img src={yakLogoPurple} alt="Yak Academy" className="slick-topup-logo" />
        <hr className="slick-topup-divider" />
        <div className="slick-topup-label">المبلغ</div>
        <div className="slick-topup-value">
          <strong>{top.amount ? top.amount.amount : "—"}</strong>
          <span>{CURRENCY.label}</span>
        </div>
      </section>

      <form className="ccp-topup-form" noValidate onSubmit={handleSlickPayPayment}>
        <PayerFields form={form} errors={errors} onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}>
          <AmountField top={top} touched={touched} />
        </PayerFields>

        <div className="payment-field">
          <label className={"slick-topup-terms" + (termsMissing ? " is-invalid" : "")}>
            <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
            <span>
              أوافق على{" "}
              {TERMS_URL ? (
                <a href={TERMS_URL} target="_blank" rel="noopener noreferrer">الشروط العامة</a>
              ) : (
                "الشروط العامة"
              )}
            </span>
          </label>
          {termsMissing && <span className="payment-field-error" role="alert">يجب الموافقة على الشروط العامة للمتابعة.</span>}
        </div>

        {!SLICKPAY_CONNECTED && !error && (
          <p className="ccp-topup-soon">الدفع الإلكتروني عبر Slick-Pay قيد الربط وسيتوفر قريباً.</p>
        )}
        {error && <div className="payment-inline-error" role="alert"><AlertIcon />{error}</div>}

        <div className="ccp-topup-actions">
          <button type="button" className="course-modal-btn is-secondary" onClick={clear} disabled={busy}>
            مسح
          </button>
          <button type="submit" className="course-modal-btn is-primary" disabled={busy}>
            {busy ? <span className="payment-spinner" aria-hidden="true"></span> : <CardIcon width={17} height={17} />}
            {busy ? "جاري تجهيز عملية الدفع..." : "إدفع الآن"}
          </button>
        </div>
      </form>
    </div>
  );
}
