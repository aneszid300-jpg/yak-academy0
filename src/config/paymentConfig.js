// Payment content shown to students: currency, what a unit includes, and the
// three payment methods with their instructions.
//
// ⚠️ PLACEHOLDERS: the recipient details below are intentionally empty (null).
// Replace them with the official Yak Academy BaridiMob / CCP details before
// launch. Until then the page says «سيتم إضافتها قريباً» instead of a number.
// This file holds public information only: never put API keys or secrets here.

export const CURRENCY = { code: "DZD", label: "دج" };

export const formatPrice = (amount) => `${amount} ${CURRENCY.label}`;

// A unit is sold as one package.
export const UNIT_INCLUDES = [
  { key: "lessons", label: "الدروس المسجلة", hint: "كل دروس الوحدة بالفيديو" },
  { key: "live", label: "الحصص المباشرة", hint: "حصص مباشرة مع الأستاذ" },
  { key: "flashcards", label: "بطاقات المراجعة بالذكاء الاصطناعي", hint: "بطاقات QCM خاصة بالوحدة" },
];

// Payment proof (BaridiMob / CCP).
export const PROOF_UPLOAD = {
  maxBytes: 5 * 1024 * 1024,
  maxLabel: "5 ميغابايت",
  types: ["image/jpeg", "image/png", "image/webp"],
  typesLabel: "PNG أو JPG أو WEBP",
};

// Exactly three methods, in this order. `title`/`subtitle` are the rows of
// «اختر طريقة الدفع»; `name` is the short label used in history and facts;
// `tone` tints the method's icon square.
export const PAYMENT_METHODS = [
  {
    id: "slickpay",
    name: "Slick-Pay",
    title: "الدفع الإلكتروني (Slick-Pay)",
    subtitle: "بطاقة CIB أو الذهبية عبر Slick-Pay",
    description: "الدفع الإلكتروني عبر Slick-Pay",
    verification: "automatic",
    tone: "blue",
    steps: [
      "اضغط «ادفع الآن» لتنتقل إلى صفحة الدفع الآمنة لـ Slick-Pay.",
      "أدخل معلومات بطاقة CIB أو الذهبية وأكّد الدفع.",
      "تعود تلقائياً إلى Yak، ونتحقق من الدفع ثم نفعّل الوحدة.",
    ],
  },
  {
    id: "ccp",
    name: "CCP",
    title: "حوالة بريدية (CCP)",
    subtitle: "إيداع يدوي في مكتب البريد",
    description: "الدفع عبر الحساب البريدي CCP",
    verification: "manual",
    tone: "amber",
    steps: [
      "توجّه إلى أقرب مكتب بريد واطلب حوالة بريدية.",
      "ادفع المبلغ بالضبط إلى الحساب البريدي أدناه، واحتفظ بالوصل.",
      "صوّر الوصل وأرفقه مع رقم العملية في الاستمارة.",
    ],
    recipient: [
      { key: "account", label: "رقم الحساب البريدي (CCP)", value: null, ltr: true }, // TODO(config)
      { key: "key", label: "المفتاح (Clé)", value: null, ltr: true }, // TODO(config)
      { key: "name", label: "صاحب الحساب", value: null }, // TODO(config)
    ],
  },
  {
    id: "baridimob",
    name: "BaridiMob",
    title: "BaridiMob",
    subtitle: "تحويل من تطبيق BaridiMob",
    description: "الدفع عبر BaridiMob",
    verification: "manual",
    tone: "green",
    steps: [
      "افتح تطبيق BaridiMob واختر «تحويل».",
      "حوّل المبلغ بالضبط إلى الحساب أدناه.",
      "خذ لقطة شاشة للوصل وأرفقها مع رقم العملية في الاستمارة.",
    ],
    recipient: [
      { key: "rip", label: "رقم الحساب (RIP)", value: null, ltr: true }, // TODO(config): official Yak RIP
      { key: "name", label: "اسم المستفيد", value: null }, // TODO(config): official account holder
    ],
  },
];

// Shown under each payment sheet (no claims we cannot guarantee).
export const PAYMENT_FOOTNOTE = "لا تُفعَّل أي وحدة إلا بعد تأكيد الدفع من طرف Yak Academy.";

export const getPaymentMethod = (id) => PAYMENT_METHODS.find((method) => method.id === id) || null;
