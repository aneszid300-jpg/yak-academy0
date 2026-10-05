import { getCourse } from "../../data/courses.js";

// «سجل المحفظة»: one activity model for every wallet operation, built from
// paymentService.getWallet() — the single source of truth.
//
//   ActivityItem { id, kind, amount, method, date, status, note }
//     kind   "topup"    — a payment request through CCP / BaridiMob / Slick-Pay
//                          (each method keeps its own status flow: Slick-Pay
//                          pending → approved, manual ones submitted →
//                          under_review → approved | rejected)
//            "transfer" — a movement of the wallet balance, with
//                          direction "in" (credit) | "out" (debit).
//                          The payment contract does not expose these yet; when
//                          getWallet() returns them, map them here and they show
//                          up in «جميع التحويلات» with no UI change.
//     method payment method id (topups) or null
//     note   context line (the unit the payment is for)

export const ACTIVITY_KINDS = { TOPUP: "topup", TRANSFER: "transfer" };

/** wallet (from useWallet) → ActivityItem[], newest first. */
export function toActivity(wallet) {
  if (!wallet) return [];
  const topups = wallet.history.map((p) => ({
    id: p.id,
    kind: ACTIVITY_KINDS.TOPUP,
    amount: p.amount,
    method: p.paymentMethod,
    date: p.updatedAt,
    status: p.status,
    note: getCourse(p.contentId)?.title || null,
  }));
  const transfers = []; // not provided by the payment contract yet (see above)
  return [...topups, ...transfers].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
