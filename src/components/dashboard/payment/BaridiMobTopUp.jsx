import { useState } from "react";
import { CURRENCY, getPaymentMethod } from "../../../config/paymentConfig.js";
import { EMPTY_PAYER, payerErrors } from "../../../features/payments/payer.js";
import { useTopUpAmount } from "../../../features/payments/topUpAmount.js";
import PayerFields, { AmountField } from "./PayerFields.jsx";
import ProofChannels from "./ProofChannels.jsx";
import { CheckIcon, CopyIcon } from "./icons.jsx";

// «BaridiMob» screen of «شحن المحفظة» — UI only (no BaridiMob integration).
// Step 1 (left pane): the student's details. Step 2: Yak's RIP + the amount,
// the BaridiMob app instructions, then «إثبات الدفع» on WhatsApp / Telegram.
// The RIP and the beneficiary come from PAYMENT_METHODS (paymentConfig.js);
// the amount is the unit's price, or typed when opened from «محفظتي». Nothing is marked paid here: the payment
// stays pending until Yak's team checks the receipt.
const GUIDE = [
  "املأ معلوماتك الشخصية في الاستمارة.",
  "افتح تطبيق BaridiMob وحوّل المبلغ بالضبط إلى الـ RIP المعروض.",
  "صوّر وصل التحويل وأرسله لنا عبر WhatsApp أو Telegram.",
];

function CopyValue({ label, value }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked: the value stays visible and selectable.
    }
  }
  return (
    <button type="button" className={"baridi-copy" + (copied ? " is-copied" : "")} onClick={copy} disabled={!value}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? "تم النسخ" : label}
    </button>
  );
}

export default function BaridiMobTopUp({ course, price }) {
  const baridimob = getPaymentMethod("baridimob");
  const rip = baridimob.recipient.find((row) => row.key === "rip");
  const beneficiary = baridimob.recipient.find((row) => row.key === "name");
  const [form, setForm] = useState(EMPTY_PAYER);
  const [touched, setTouched] = useState(false);
  const [step, setStep] = useState("details"); // "details" | "transfer"
  const top = useTopUpAmount(price);
  const errors = touched ? payerErrors(form) : {};

  function next(event) {
    event.preventDefault();
    setTouched(true);
    if (Object.keys(payerErrors(form)).length || !top.amount) return;
    setStep("transfer");
  }

  return (
    <div className="ccp-topup">
      <section className="ccp-topup-guide" aria-labelledby="baridiGuideTitle">
        <h3 className="ccp-topup-guide-title" id="baridiGuideTitle">طريقة الدفع</h3>
        <ol className="ccp-topup-steps">
          {GUIDE.map((text, i) => (
            <li key={text} className={i === (step === "details" ? 0 : 1) ? "is-current" : undefined}>
              <span className="ccp-topup-num">{i + 1}</span>
              {text}
            </li>
          ))}
        </ol>
        <div className="baridi-pending">
          لا تُعتبر العملية مدفوعة إلا بعد أن يتحقق فريق Yak Academy من وصل التحويل.
        </div>
      </section>

      {step === "details" ? (
        <form className="ccp-topup-form" noValidate onSubmit={next}>
          <PayerFields form={form} errors={errors} onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}>
            <AmountField top={top} touched={touched} />
          </PayerFields>
          <div className="ccp-topup-actions">
            <button type="button" className="course-modal-btn is-secondary" onClick={() => { setForm(EMPTY_PAYER); top.setInput(""); setTouched(false); }}>
              مسح
            </button>
            <button type="submit" className="course-modal-btn is-primary">
              متابعة إلى معلومات التحويل
            </button>
          </div>
        </form>
      ) : (
        <div className="ccp-topup-form">
          <div className="baridi-transfer">
            <div className="baridi-transfer-label">{rip.label} — Yak Academy</div>
            <div className="baridi-rip" dir={rip.value ? "ltr" : undefined}>{rip.value || "سيتم إضافته قريباً"}</div>
            {beneficiary && <div className="baridi-beneficiary">{`${beneficiary.label}: ${beneficiary.value || "سيتم إضافته قريباً"}`}</div>}
            <CopyValue label="نسخ RIP" value={rip.value} />
            <hr className="baridi-divider" />
            <div className="baridi-amount">
              <span>المبلغ المطلوب تحويله</span>
              <strong>
                {top.amount ? top.amount.amount : "—"} <small>{CURRENCY.label}</small>
              </strong>
            </div>
          </div>

          <div className="baridi-app">
            <i className="fa-solid fa-mobile-screen-button" aria-hidden="true"></i>
            <span>افتح تطبيق <b>BaridiMob</b> وحوّل المبلغ بالضبط إلى الـ RIP أعلاه، ثم عد إلى هنا لإرسال الوصل.</span>
          </div>

          <ProofChannels
            methodLabel="تحويل BaridiMob"
            payerName={[form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(" ")}
            course={course}
            price={top.amount}
          />

          <div className="ccp-topup-actions">
            <button type="button" className="course-modal-btn is-secondary" onClick={() => setStep("details")}>
              تعديل معلوماتي
            </button>
          </div>
          <p className="ccp-topup-soon">ستبقى عمليتك قيد المراجعة إلى أن يؤكدها فريق Yak Academy.</p>
        </div>
      )}
    </div>
  );
}
