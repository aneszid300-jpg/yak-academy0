// What a professor can upload from «رفع الملفات» (/prof/upload).
// Public rules only: the backend checks them again.

export const PROF_UPLOAD = {
  maxBytes: 20 * 1024 * 1024,
  maxLabel: "20 MB",
  types: ["application/pdf"],
  typesLabel: "PDF فقط",
};

// The two kinds of file. `exercises` appear to students in «تمارين الدورات»;
// `flashcards` are read by the AI to build the unit's review cards (باك AI).
export const UPLOAD_KINDS = [
  { key: "exercises", label: "تمارين الدورات", drop: "ارفع PDF تمارين الدورة", badge: "تمارين" },
  { key: "flashcards", label: "AI Flashcards", drop: "ارفع PDF للبطاقات (AI Flashcards)", badge: "AI" },
];

// The four categories of Live session (SessionForm, the professor's calendar).
// `label` is stored as the session's `kind` (what students read); `tone` colours
// it in the calendar. Older kinds are matched by their words (liveCategory).
export const LIVE_CATEGORIES = [
  { key: "lesson", label: "حصة عادية", tone: "violet" },
  { key: "review", label: "مراجعة", tone: "amber" },
  { key: "qa", label: "حصة أسئلة وأجوبة", tone: "teal" },
  { key: "exercises", label: "تمارين", tone: "rose" },
];

/** The category of a session, from its kind (unknown → «حصة عادية»). */
export function liveCategory(session) {
  const k = String(session?.kind || "");
  if (k.includes("مراجعة")) return LIVE_CATEGORIES[1];
  if (k.includes("أسئلة")) return LIVE_CATEGORIES[2];
  if (k.includes("تمارين")) return LIVE_CATEGORIES[3];
  return LIVE_CATEGORIES[0];
}

export const getUploadKind = (key) => UPLOAD_KINDS.find((k) => k.key === key) || UPLOAD_KINDS[0];
