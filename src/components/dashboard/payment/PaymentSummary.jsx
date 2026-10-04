import { UNIT_INCLUDES } from "../../../config/paymentConfig.js";
import { CheckIcon } from "./icons.jsx";

/** What a unit includes (success state after payment). */
export function UnitIncludes({ compact = false }) {
  return (
    <ul className="payment-includes">
      {UNIT_INCLUDES.map((item) => (
        <li key={item.key}>
          <span className="payment-check"><CheckIcon /></span>
          <span>
            {item.label}
            {!compact && <small>{item.hint}</small>}
          </span>
        </li>
      ))}
    </ul>
  );
}
