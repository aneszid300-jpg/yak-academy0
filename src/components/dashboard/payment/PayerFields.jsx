import { CURRENCY } from "../../../config/paymentConfig.js";
import { WILAYAS, getCommunes } from "../../../data/algeria.js";
import YakSelect from "./YakSelect.jsx";

const WILAYA_OPTIONS = WILAYAS.map((w) => ({ value: w.code, label: `${w.code} - ${w.name}` }));

// Payer fields of the wallet top-up screens (CCP, Slick-Pay), two per row:
// الاسم / اللقب, الولاية / البلدية, رقم الهاتف / `children` (the amount).
// Wilaya: searchable Yak dropdown. Commune: dropdown (no search) of the chosen
// wilaya's communes (disabled until a wilaya is chosen). Changing the wilaya
// resets the commune.
//   form, errors — from features/payments/payer.js
//   onChange(key, value)

export function Field({ label, error, children }) {
  return (
    <div className="payment-field">
      <label>{label}</label>
      {children}
      {error && <span className="payment-field-error" role="alert">{error}</span>}
    </div>
  );
}

/** «المبلغ (دج)»: read-only when fixed (a course price), typed otherwise. `top` = useTopUpAmount(price). */
export function AmountField({ top, touched }) {
  return (
    <Field label={`المبلغ (${CURRENCY.label})`} error={top.error(touched)}>
      {top.fixed ? (
        <input className="payment-input ccp-topup-amount" value={top.amount.amount} readOnly aria-readonly="true" dir="ltr" />
      ) : (
        <input
          className={"payment-input" + (top.error(touched) ? " is-invalid" : "")}
          value={top.input}
          onChange={(event) => top.setInput(event.target.value.replace(/[^\d]/g, ""))}
          inputMode="numeric"
          placeholder="مثال: 2500"
          dir="ltr"
        />
      )}
    </Field>
  );
}

export default function PayerFields({ form, errors, onChange, children }) {
  const set = (key) => (event) => onChange(key, event.target.value);
  const input = (key) => "payment-input" + (errors[key] ? " is-invalid" : "");
  const communes = form.wilaya ? getCommunes(form.wilaya) : [];

  return (
    <div className="ccp-topup-grid">
      <Field label="الاسم" error={errors.firstName}>
        <input className={input("firstName")} placeholder="الاسم" value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
      </Field>
      <Field label="اللقب" error={errors.lastName}>
        <input className={input("lastName")} placeholder="اللقب" value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
      </Field>
      <Field label="الولاية" error={errors.wilaya}>
        <YakSelect
          options={WILAYA_OPTIONS}
          value={form.wilaya}
          onChange={(code) => {
            if (code !== form.wilaya) onChange("commune", "");
            onChange("wilaya", code);
          }}
          placeholder="اختر الولاية"
          searchable
          searchPlaceholder="ابحث عن ولاية..."
          invalid={Boolean(errors.wilaya)}
        />
      </Field>
      <Field label="البلدية" error={errors.commune}>
        <YakSelect
          options={communes.map((name) => ({ value: name, label: name }))}
          value={form.commune}
          onChange={(name) => onChange("commune", name)}
          placeholder={form.wilaya ? "اختر البلدية" : "اختر الولاية أولاً"}
          invalid={Boolean(errors.commune)}
          disabled={!form.wilaya}
        />
      </Field>
      <Field label="رقم الهاتف" error={errors.phone}>
        <input className={input("phone")} placeholder="055XXXXXXX" value={form.phone} onChange={set("phone")} inputMode="tel" dir="ltr" autoComplete="tel" />
      </Field>
      {children}
    </div>
  );
}
