// Subject colours — ported unchanged from legacy/dashboard.html
// (FOCUS_SUBJECT_COLORS, YAK_SUBJECTS, colorForSubject, resolveTaskColor, …).
// Functions take the saved colour map (`yak_subject_colors`) as an argument
// instead of reading localStorage themselves.

export const SUBJECT_PALETTE = [
  "#3B82F6", "#EC4899", "#EF4444", "#84CC16",
  "#F59E0B", "#8B5CF6", "#14B8A6", "#F97316",
  "#06B6D4", "#A855F7",
];

export const YAK_SUBJECTS = [
  { key: "math", name: "الرياضيات" },
  { key: "physics", name: "الفيزياء" },
  { key: "science", name: "علوم الطبيعة والحياة" },
  { key: "arabic", name: "اللغة العربية" },
  { key: "french", name: "الفرنسية" },
  { key: "english", name: "الإنجليزية" },
  { key: "history", name: "التاريخ والجغرافيا" },
  { key: "islamic", name: "التربية الإسلامية" },
  { key: "literature", name: "الأدب العربي" },
];

export function normalizeSubjectKey(name) {
  return String(name || "عام").trim().toLowerCase().replace(/\s+/g, " ");
}

export function defaultColorForSubjectIndex(i) {
  return SUBJECT_PALETTE[i % SUBJECT_PALETTE.length];
}

// Matches a subject even when only part of its name was typed.
function matchYakSubject(name) {
  const key = normalizeSubjectKey(name);
  if (!key || key === "عام") return null;
  for (const subject of YAK_SUBJECTS) {
    if (normalizeSubjectKey(subject.name) === key) return subject;
  }
  for (const subject of YAK_SUBJECTS) {
    const sn = normalizeSubjectKey(subject.name);
    if (key.indexOf(sn) === 0 || sn.indexOf(key) === 0) return subject;
  }
  for (const subject of YAK_SUBJECTS) {
    const sn = normalizeSubjectKey(subject.name);
    if (key.indexOf(sn) !== -1 || sn.indexOf(key) !== -1) return subject;
  }
  return null;
}

export function colorForSubject(name, colorMap) {
  const key = normalizeSubjectKey(name);
  if (colorMap[key]) return colorMap[key];
  const matched = matchYakSubject(name);
  if (matched) {
    const mkey = normalizeSubjectKey(matched.name);
    if (colorMap[mkey]) return colorMap[mkey];
    let idx = YAK_SUBJECTS.findIndex((s) => s.key === matched.key);
    if (idx < 0) idx = 0;
    return defaultColorForSubjectIndex(idx);
  }
  // Stable fallback from the name's hash.
  let h = 0;
  for (let i = 0; i < key.length; i++) h = ((h << 5) - h + key.charCodeAt(i)) | 0;
  return SUBJECT_PALETTE[Math.abs(h) % SUBJECT_PALETTE.length];
}

// The subject is the only source of a task's colour: subjectKey → name → fallback.
export function resolveTaskColor(todo, colorMap) {
  if (todo && todo.subjectKey) {
    const byKey = YAK_SUBJECTS.find((s) => s.key === todo.subjectKey);
    if (byKey) return colorForSubject(byKey.name, colorMap);
  }
  const name = (todo && (todo.title || todo.text)) || "";
  return colorForSubject(name, colorMap);
}

// Legacy lightenHex / darkenHex — used for the sticky notes' pin gradient
// and paper colour.
function parseHex(hex, fallback) {
  hex = String(hex || fallback).replace("#", "");
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  const num = parseInt(hex, 16);
  return Number.isNaN(num) ? null : [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
const toHex = (rgb) => "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");

export function lightenHex(hex, amount) {
  const rgb = parseHex(hex, "#EDE4FF");
  if (!rgb) return "#F3EEFF";
  return toHex(rgb.map((v) => Math.round(v + (255 - v) * amount)));
}

export function darkenHex(hex, amount) {
  const rgb = parseHex(hex, "#7B4FE0");
  if (!rgb) return "#5B3AA6";
  return toHex(rgb.map((v) => Math.round(v * (1 - amount))));
}
