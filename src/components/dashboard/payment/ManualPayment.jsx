import { useRef, useState } from "react";
import { formatPrice } from "../../../config/paymentConfig.js";
import { createPurchase, submitManualPayment } from "../../../services/paymentService.js";
import PaymentProofUpload, { proofFileError } from "./PaymentProofUpload.jsx";
import { AlertIcon, CopyIcon } from "./icons.jsx";
import { paymentErrorMessage } from "./messages.js";

// CCP and BaridiMob share one two-pane step, driven by the method's config:
//   «طريقة الدفع» — numbered instructions, amount and the recipient account
//   the request form — reference, date, receipt photo, optional note,
//   «مسح» / «إرسال الطلب».
// Sending the request does NOT unlock anything: the Yak team verifies first.

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function CopyValue({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={"payment-copy" + (done ? " is-done" : "")}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          // clipboard blocked: the value is still visible and selectable
        }
      }}
    >
      <CopyIcon />
      {done ? "تم النسخ" : "نسخ"}
    </button>
  );
}

// `copy` overrides what the copy button copies (e.g. the amount without «دج»).
function Detail({ label, value, ltr, amount, copy }) {
  return (
    <div className={"payment-detail" + (amount ? " is-amount" : "")}>
      <div className="min-w-0">
        <div className="payment-detail-label">{label}</div>
        {value ? (
          <div className="payment-detail-value" dir={ltr ? "ltr" : undefined} style={ltr ? { textAlign: "right" } : undefined}>{value}</div>
        ) : (
          <div className="payment-detail-value is-missing">سيتم إضافتها قريباً</div>
        )}
      </div>
      {value && <CopyValue text={copy ?? String(value)} />}
    </div>
  );
}

const FIELD_MESSAGES = {
  reference: (v) => (!v.trim() ? "أدخل رقم العملية كما يظهر في الوصل." : v.trim().length < 4 ? "رقم العملية قصير جداً." : null),
  paidOn: (v) => (!v ? "اختر تاريخ الدفع." : v > today() ? "تاريخ الدفع لا يمكن أن يكون في المستقبل." : null),
};
const EMPTY = { reference: "", paidOn: today(), note: "" };

export default function ManualPayment({ method, course, price, onSubmitted }) {
  const [form, setForm] = useState(EMPTY);
  const [proofFile, setProofFile] = useState(null);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [uploadKey, setUploadKey] = useState(0); // remount the upload area on «مسح»
  const refs = { reference: useRef(null), paidOn: useRef(null), proof: useRef(null) };

  const errors = {
    reference: FIELD_MESSAGES.reference(form.reference),
    paidOn: FIELD_MESSAGES.paidOn(form.paidOn),
    proof: proofFileError(proofFile),
  };
  const shown = (key) => (touched[key] ? errors[key] : null);
  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setServerError(null);
  };
  const clear = () => {
    setForm({ ...EMPTY, paidOn: today() });
    setProofFile(null);
    setTouched({});
    setServerError(null);
    setUploadKey((k) => k + 1);
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched({ reference: true, paidOn: true, proof: true });
    const firstInvalid = ["reference", "paidOn", "proof"].find((key) => errors[key]);
    if (firstInvalid) {
      refs[firstInvalid].current?.querySelector("input:not([type=file]), [role=button], button")?.focus();
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      const purchase = await createPurchase("course", course.id, method.id);
      const submitted = await submitManualPayment(purchase.id, { reference: form.reference.trim(), paidOn: form.paidOn, note: form.note.trim(), proofFile });
      onSubmitted(submitted);
    } catch (error) {
      setServerError(paymentErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <form className="pay-split" noValidate onSubmit={handleSubmit} data-panel={method.id}>
      <section className="pay-pane pay-pane-info" aria-label="طريقة الدفع">
        <div className="pay-pane-title">طريقة الدفع</div>
        <ol className="payment-steps">
          {method.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div className="payment-details">
          <Detail label="المبلغ المطلوب" value={formatPrice(price.amount)} copy={String(price.amount)} amount />
          {method.recipient.map((field) => (
            <Detail key={field.key} label={field.label} value={field.value} ltr={field.ltr} />
          ))}
        </div>
      </section>

      <section className="pay-pane pay-pane-form" aria-label="طلب الدفع">
        <div className="payment-form-grid">
          <div className="payment-field" ref={refs.reference}>
            <label htmlFor="payReference">رقم العملية</label>
            <input
              id="payReference"
              className={"payment-input" + (shown("reference") ? " is-invalid" : "")}
              value={form.reference}
              onChange={(e) => update("reference", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, reference: true }))}
              placeholder="كما يظهر في الوصل"
              autoComplete="off"
              dir="auto"
              maxLength={40}
              aria-invalid={Boolean(shown("reference"))}
            />
            {shown("reference") && <span className="payment-field-error" role="alert"><AlertIcon />{shown("reference")}</span>}
          </div>
          <div className="payment-field" ref={refs.paidOn}>
            <label htmlFor="payDate">تاريخ الدفع</label>
            <input
              id="payDate"
              type="date"
              className={"payment-input" + (shown("paidOn") ? " is-invalid" : "")}
              value={form.paidOn}
              max={today()}
              onChange={(e) => update("paidOn", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, paidOn: true }))}
              aria-invalid={Boolean(shown("paidOn"))}
            />
            {shown("paidOn") && <span className="payment-field-error" role="alert"><AlertIcon />{shown("paidOn")}</span>}
          </div>
        </div>

        <div className="mt-3" ref={refs.proof}>
          <PaymentProofUpload
            key={uploadKey}
            file={proofFile}
            onChange={(file) => {
              setProofFile(file);
              setServerError(null);
              if (file) setTouched((t) => ({ ...t, proof: true }));
            }}
            error={shown("proof")}
          />
        </div>

        <div className="payment-field mt-3">
          <label htmlFor="payNote">
            ملاحظة<small>(اختياري)</small>
          </label>
          <textarea
            id="payNote"
            className="payment-input"
            value={form.note}
            onChange={(e) => update("note", e.target.value)}
            maxLength={300}
            placeholder="أي تفاصيل تساعد الفريق على إيجاد دفعتك، مثل اسم صاحب الحساب."
          />
        </div>

        {serverError && (
          <div className="payment-inline-error" role="alert"><AlertIcon />{serverError}</div>
        )}

        <div className="pay-actions">
          <button
            type="submit"
            className="btn-violet payment-btn"
            disabled={submitting}
            // Keep focus in the field on mouse-down: blurring it first would show its
            // error, push this button down, and the click would miss it.
            onMouseDown={(event) => event.preventDefault()}
          >
            {submitting && <span className="payment-spinner" aria-hidden="true"></span>}
            {submitting ? "جاري الإرسال..." : "إرسال الطلب"}
          </button>
          <button type="button" className="btn-outline payment-btn" onClick={clear} disabled={submitting}>مسح</button>
        </div>
        <p className="payment-field-hint pay-actions-hint">بعد الإرسال يتحقق فريق Yak Academy من الدفع، ثم تُفعَّل الوحدة على حسابك.</p>
      </section>
    </form>
  );
}
