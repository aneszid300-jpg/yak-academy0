// باك AI — «بطاقات المراجعة», copied from legacy/dashboard.html (#page-ai).
// Legacy's "AI" page is a board of revision-card decks (no chat, no API):
// opening a deck starts its flashcards (QCM) at /dashboard/flash/:deckId.
// Deck IDs are new fixed slugs (legacy keyed decks by their Arabic title).

export { EXERCISE_TABS as AI_TABS } from "./courses.js"; // same side tabs as تمارين الدورات

// Flashcards are not sold on their own: each deck comes with its unit
// (`courseId`), and owning the unit opens the deck.
// PROVISIONAL mapping, to be confirmed by the content team / backend. «الدوال
// الأسية» has no matching unit yet (null), so it cannot be opened for now.
export const AI_DECKS = [
  { id: "integral", subject: "math", chip: "الرياضيات", title: "التكامل", meta: "64 بطاقة · 78% مكتمل · أمس", courseId: "math-definite-integral" },
  { id: "electricity", subject: "physics", chip: "الفيزياء", title: "الكهرباء", meta: "25 بطاقة · 90% مكتمل · اليوم", courseId: "physics-electric-current" },
  { id: "genetics", subject: "science", chip: "علوم الطبيعة", title: "الوراثة", meta: "28 بطاقة · 35% مكتمل · منذ أسبوع", courseId: "science-genetics" },
  { id: "grammar", subject: "arabic", chip: "اللغة العربية", title: "النحو", meta: "40 بطاقة · 60% مكتمل · منذ 3 أيام", courseId: "arabic-grammar" },
  { id: "circular-motion", subject: "physics", chip: "الفيزياء", title: "الحركة الدائرية", meta: "30 بطاقة · 45% مكتمل · منذ 4 أيام", courseId: "physics-mechanics" },
  { id: "exponential-functions", subject: "math", chip: "الرياضيات", title: "الدوال الأسية", meta: "22 بطاقة · 50% مكتمل · منذ 5 أيام", courseId: null },
];

export const getAiDeck = (id) => AI_DECKS.find((deck) => deck.id === id) || null;
