import { useState } from "react";
import { getPaymentMethod } from "../../../config/paymentConfig.js";
import { EMPTY_CCP_TOPUP, ccpTopUpErrors } from "../../../features/payments/ccpTopUp.js";
import { useTopUpAmount } from "../../../features/payments/topUpAmount.js";
import PayerFields, { AmountField, Field } from "./PayerFields.jsx";
import ProofChannels from "./ProofChannels.jsx";

// «حوالة بريدية (CCP)» screen of «شحن المحفظة»: how to pay on the right, the
// student's form on the left. The CCP recipient details come from
// paymentConfig (shown «سيتم إضافتها قريباً» until they are filled in). The
// amount is the unit's price (read-only), or typed when opened from «محفظتي». The receipt is not uploaded: the
// student sends it to Yak on WhatsApp or Telegram (PROOF_CHANNELS). Sending
// the form is not available yet (no top-up backend): «إرسال الطلب» stays disabled.
const STEPS = [
  "توجه الى اقرب مركز بريد امامك و اطلب حوالة بريدية.",
  "املأ الحوالة بمعلوماتك الشخصية و معلومات حساب Yak Academy.",
  "صور الوصل وارفقه في الاستمارة المقابلة.",
];

export default function CcpTopUp({ course, price }) {
  const ccp = getPaymentMethod("ccp");
  const [form, setForm] = useState(EMPTY_CCP_TOPUP);
  const [touched, setTouched] = useState(false);
  const top = useTopUpAmount(price);
  const errors = touched ? ccpTopUpErrors(form) : {};
  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  return (
    <div className="ccp-topup">
      <section className="ccp-topup-guide" aria-labelledby="ccpGuideTitle">
        <h3 className="ccp-topup-guide-title" id="ccpGuideTitle">طريقة الدفع</h3>
        <ol className="ccp-topup-steps">
          <li><span className="ccp-topup-num">1</span>{STEPS[0]}</li>
          <li><span className="ccp-topup-num">2</span>{STEPS[1]}</li>
        </ol>
        <dl className="ccp-topup-recipient">
          {ccp.recipient.map((row) => (
            <div key={row.key} className="ccp-topup-recipient-row">
              <dt>{row.label}</dt>
              <dd dir={row.ltr && row.value ? "ltr" : undefined}>{row.value || "سيتم إضافتها قريباً"}</dd>
            </div>
          ))}
        </dl>
        <ol className="ccp-topup-steps" start={3}>
          <li><span className="ccp-topup-num">3</span>{STEPS[2]}</li>
        </ol>
      </section>

      <form
        className="ccp-topup-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setTouched(true);
        }}
      >
        <PayerFields form={form} errors={errors} onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}>
          <AmountField top={top} touched={touched} />
        </PayerFields>

        <ProofChannels
          methodLabel="حوالة CCP"
          payerName={[form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(" ")}
          course={course}
          price={top.amount}
        />

        <Field label="ملاحظة (اختياري)">
          <textarea className="payment-input" placeholder="أدخل أي تفاصيل إضافية إن وجدت..." value={form.note} onChange={set("note")} rows={3} />
        </Field>

        <div className="ccp-topup-actions">
          <button type="button" className="course-modal-btn is-secondary" onClick={() => { setForm(EMPTY_CCP_TOPUP); top.setInput(""); setTouched(false); }}>
            مسح
          </button>
          <button type="submit" className="course-modal-btn is-primary" disabled aria-disabled="true" title="قريباً">
            إرسال الطلب
          </button>
        </div>
        <p className="ccp-topup-soon">إرسال طلبات الشحن سيتوفر قريباً.</p>
      </form>
    </div>
  );
}
