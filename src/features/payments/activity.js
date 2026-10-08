import { getCourse } from "../../data/courses.js";
import { PURCHASE_STATUS } from "../../services/paymentService.js";

// «محفظتي» data, built from paymentService.getWallet() — two separate lists:
//
//   toTopUpRequests(wallet) → «طلبات الشحن»: payment requests through
//     CCP / BaridiMob / Slick-Pay (CIB-الذهبية), each with its own status flow
//     (Slick-Pay pending → approved; manual: submitted → under_review →
//     approved | rejected).
//     Request { id, method, amount, date, status }
//
//   toTransfers(wallet) → «جميع التحويلات»: the student's course purchases —
//     one entry per purchase record of getWallet().history (the server's
//     getPurchaseHistory() for the signed-in student), so a purchase never
//     shows twice. Cancelled attempts are left out.
//     Transfer { id, type: "purchase", courseId, course, image, amount,
//                date, status }
//
// Both newest first.

const byNewest = (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

export function toTopUpRequests(wallet) {
  if (!wallet) return [];
  return wallet.history
    .map((p) => ({ id: p.id, method: p.paymentMethod, amount: p.amount, date: p.updatedAt, status: p.status }))
    .sort(byNewest);
}

export function toTransfers(wallet) {
  if (!wallet) return [];
  return wallet.history
    .filter((p) => p.status !== PURCHASE_STATUS.CANCELLED)
    .map((p) => {
      const course = getCourse(p.contentId);
      return {
        id: p.id,
        type: "purchase",
        courseId: p.contentId,
        course: course?.title || "دورة",
        image: course?.image || null,
        amount: p.amount,
        date: p.updatedAt,
        status: p.status,
      };
    })
    .sort(byNewest);
}
