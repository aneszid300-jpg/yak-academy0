// Flashcard questions (QCM) — copied from legacy/dashboard.html FLASH_DECKS.
// The decks themselves (titles, subjects) live in ./ai.js; this file only
// holds their questions. Legacy had questions for «التكامل» and «الكهرباء»;
// every other deck used its «default» set.

const FLASH_CARDS = {
  integral: [
    { q: "ما صيغة التكامل بالتجزئة؟", choices: ["∫u dv = uv − ∫v du", "∫u dv = uv + ∫v du", "∫u dv = u/v + C", "∫u dv = du/dv"], correct: 0 },
    { q: "∫x^n dx (حيث n ≠ −1) يساوي؟", choices: ["n·x^(n−1) + C", "x^(n+1)/(n+1) + C", "ln|x| + C", "x^n / n + C"], correct: 1 },
    {
      q: "متى نستعمل طريقة التعويض في التكامل؟",
      choices: ["عندما تكون الدالة خطية فقط", "عندما تظهر مشتقة جزء من الدالة داخل التكامل", "فقط في التكامل المحدد", "عندما تكون النتيجة سالبة"],
      correct: 1,
    },
    { q: "التكامل المحدد يحسب غالباً؟", choices: ["المشتقة الثانية", "المساحة تحت المنحنى على مجال", "ميل المماس", "نقطة الانعطاف"], correct: 1 },
  ],
  electricity: [
    { q: "ما قانون أوم؟", choices: ["U = R × I", "P = R / I", "U = R / I", "I = R × U"], correct: 0 },
    { q: "ما وحدة شدة التيار الكهربائي؟", choices: ["الفولت (V)", "الأوم (Ω)", "الأمبير (A)", "الواط (W)"], correct: 2 },
    {
      q: "قانون كيرشوف للتيار عند عقدة؟",
      choices: ["مجموع الجهود = 0", "مجموع التيارات الداخلة = مجموع التيارات الخارجة", "U = R × I فقط", "التيار يتضاعف دائماً"],
      correct: 1,
    },
    { q: "القدرة الكهربائية P في دارة مقاوميه تُكتب؟", choices: ["P = U / I", "P = U × I", "P = U + I", "P = R − I"], correct: 1 },
  ],
};

const DEFAULT_CARDS = [
  { q: "ما الهدف من تمارين QCM في ياك؟", choices: ["تضييع الوقت", "مراجعة سريعة وتثبيت المفاهيم", "تعويض الامتحان الرسمي", "حساب المعدل النهائي فقط"], correct: 1 },
  {
    q: "أفضل طريقة بعد جواب خاطئ؟",
    choices: ["تجاهل السؤال", "قراءة التصحيح وفهم السبب ثم المراجعة لاحقاً", "تغيير الجواب عشوائياً", "إغلاق التطبيق"],
    correct: 1,
  },
  { q: "كم اختيار في كل سؤال QCM هنا؟", choices: ["2", "3", "4", "5"], correct: 2 },
  { q: "ماذا يفعل زر «التالي»؟", choices: ["يحذف المجموعة", "ينتقل للسؤال الموالي", "يغيّر المادة", "يغلق الحساب"], correct: 1 },
];

export const getFlashCards = (deckId) => FLASH_CARDS[deckId] || DEFAULT_CARDS;
export const CHOICE_LETTERS = ["أ", "ب", "ج", "د"];
