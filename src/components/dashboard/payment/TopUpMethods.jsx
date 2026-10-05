import { PAYMENT_METHODS } from "../../../config/paymentConfig.js";
import { METHOD_ICONS } from "./icons.jsx";

// «شحن المحفظة» method list (course details → «اشحن رصيدك»): the existing
// payment methods (PAYMENT_METHODS), each opening its screen.
const ORDER = ["ccp", "slickpay", "baridimob"];
const TITLES = { slickpay: "الدفع الإلكتروني" };

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export default function TopUpMethods({ onChoose }) {
  const methods = ORDER.map((id) => PAYMENT_METHODS.find((method) => method.id === id)).filter(Boolean);
  return (
    <ul className="topup-list" aria-label="طرق شحن المحفظة">
      {methods.map((method) => {
        const Icon = METHOD_ICONS[method.id];
        return (
          <li key={method.id}>
            <button type="button" className="topup-row" data-method={method.id} onClick={() => onChoose(method.id)}>
              <span className={`pay-tile tone-${method.tone}`}><Icon /></span>
              <span className="topup-text">
                <span className="topup-title">{TITLES[method.id] || method.title}</span>
                <span className="topup-sub">{method.subtitle}</span>
              </span>
              <span className="topup-arrow"><Arrow /></span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
