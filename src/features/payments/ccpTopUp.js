import { EMPTY_PAYER, cleanPayer, payerErrors } from "./payer.js";

// «حوالة بريدية (CCP)» wallet top-up form (course details → «اشحن رصيدك»).
// The form only exists in the UI for now: there is no top-up backend, so it is
// validated and shaped here but not sent. When the backend exists, send
// toCcpTopUpRequest(form, courseId, price) through paymentService.
//
//   CcpTopUpRequest {
//     method: "ccp",
//     courseId,                       // the unit the student is buying
//     firstName, lastName,
//     wilaya,                         // official code, data/algeria.js
//     commune,
//     phone,                          // 10 digits, 05/06/07…
//     amount, currency,               // the unit's price (server-set, never typed)
//     note,                           // optional
//   }
// The receipt itself is not uploaded: the student sends it to Yak on WhatsApp
// or Telegram (PROOF_CHANNELS in config/paymentConfig.js).

export const EMPTY_CCP_TOPUP = { ...EMPTY_PAYER, note: "" };

/** { field: Arabic message } for every invalid field; empty when the form is complete. */
export const ccpTopUpErrors = payerErrors;

export function toCcpTopUpRequest(form, courseId, price) {
  return {
    method: "ccp",
    courseId,
    ...cleanPayer(form),
    amount: price.amount,
    currency: price.currency,
    note: form.note.trim(),
  };
}
