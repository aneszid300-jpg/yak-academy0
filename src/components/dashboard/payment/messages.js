// Student-facing Arabic wording for payment errors and statuses.

export function paymentErrorMessage(error) {
  switch (error?.code) {
    case "unavailable":
      return "الدفع غير متاح حالياً. نعمل على تفعيله، حاول لاحقاً.";
    case "not_found":
      return "لم نعثر على عملية الدفع هذه في حسابك.";
    case "duplicate":
      return "لديك طلب اشتراك سابق لهذه الوحدة.";
    case "invalid":
      return "بعض المعلومات غير صحيحة. راجعها وحاول مرة أخرى.";
    case "unauthenticated":
      return "انتهت جلستك. سجّل الدخول من جديد.";
    default:
      return "تعذر الاتصال. تحقق من الإنترنت وحاول مرة أخرى.";
  }
}

export const METHOD_LABELS = { baridimob: "BaridiMob", ccp: "CCP", slickpay: "Slick-Pay" };

// Status chips (wallet, history, facts): label + tone.
export const STATUS_CHIPS = {
  approved: { label: "مفعّلة", tone: "ok" },
  submitted: { label: "قيد المراجعة", tone: "wait" },
  under_review: { label: "قيد المراجعة", tone: "wait" },
  pending: { label: "في انتظار الدفع", tone: "wait" },
  rejected: { label: "مرفوضة", tone: "bad" },
  cancelled: { label: "ملغاة", tone: "muted" },
};

// 2026-09-30 → «30 سبتمبر 2026» (same month names as the Focus calendar).
export function formatPayDate(isoDate) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  const months = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  return `${d} ${months[m - 1]} ${y}`;
}
