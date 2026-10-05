import { useState } from "react";
import { CURRENCY } from "../../config/paymentConfig.js";

// Amount of a wallet top-up screen (CCP, Slick-Pay, BaridiMob).
//   - From a course (course details → «اشحن رصيدك»): the unit's price, fixed.
//   - From «محفظتي» (no course): typed by the student — a whole number of DZD.
// Returns { amount: Price|null, fixed, input, setInput, error(touched) }.
export function useTopUpAmount(price) {
  const [input, setInput] = useState("");
  const fixed = Boolean(price);
  const typed = /^\d+$/.test(input.trim()) && Number(input) > 0 ? { amount: Number(input), currency: CURRENCY.code } : null;
  const amount = fixed ? price : typed;
  return {
    amount,
    fixed,
    input,
    setInput,
    /** Arabic message for the amount field, or null. */
    error: (touched) => (touched && !amount ? "أدخل مبلغ الشحن بالدينار (رقم صحيح أكبر من 0)." : null),
  };
}
