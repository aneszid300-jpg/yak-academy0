import { PAYMENT_METHODS } from "../../../config/paymentConfig.js";
import { ChevronIcon, METHOD_ICONS } from "./icons.jsx";

/**
 * «اختر طريقة الدفع»: one full-width row per method — tinted icon square,
 * title, subtitle, verification tag and a chevron — like the reference
 * method picker. Choosing a row opens that method's step.
 */
export default function PaymentMethods({ onChoose }) {
  return (
    <ul className="pay-methods" aria-label="طرق الدفع">
      {PAYMENT_METHODS.map((method) => {
        const Icon = METHOD_ICONS[method.id];
        return (
          <li key={method.id}>
            <button type="button" className="pay-method-row" data-method={method.id} onClick={() => onChoose(method.id)}>
              <span className={`pay-tile tone-${method.tone}`}><Icon /></span>
              <span className="pay-method-text">
                <span className="pay-method-title">{method.title}</span>
                <span className="pay-method-sub">{method.subtitle}</span>
              </span>
              <span className={"payment-tag" + (method.verification === "automatic" ? " is-auto" : "")}>
                {method.verification === "automatic" ? "تفعيل تلقائي" : "تحقق من فريق Yak"}
              </span>
              <span className="pay-method-chevron"><ChevronIcon /></span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
