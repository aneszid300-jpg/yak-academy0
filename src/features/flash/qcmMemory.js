import { readRaw, removeRaw, writeRaw } from "../../utils/storedValue.js";

// QCM progress per deck — legacy loadQcmMemory / saveQcmMemory /
// resetQcmMemory, same keys and format:
//   localStorage["yak_qcm_<deck title>::<userId>"] =
//     { score, answered: { "<card index>": { selected, ok } }, index, updatedAt }
// The key uses the deck's Arabic title, like legacy, per account (storedValue.js).

export const qcmStorageKey = (title) => "yak_qcm_" + String(title || "default").trim();

export function loadQcmMemory(title, totalCards) {
  const empty = { score: 0, answered: {}, index: 0 };
  try {
    const raw = readRaw(qcmStorageKey(title));
    if (!raw) return empty;
    const data = JSON.parse(raw);
    const answered = (data && data.answered) || {};
    // The score is recomputed from the correct answers (legacy).
    let score = 0;
    Object.keys(answered).forEach((k) => {
      if (answered[k] && answered[k].ok) score += 1;
    });
    let index = typeof data.index === "number" ? data.index : 0;
    if (index < 0) index = 0;
    if (totalCards && index >= totalCards) index = totalCards - 1;
    return { score, answered, index };
  } catch {
    return empty;
  }
}

export function saveQcmMemory(title, { score, answered, index }) {
  writeRaw(qcmStorageKey(title), JSON.stringify({ score, answered, index, updatedAt: Date.now() }));
}

export function resetQcmMemory(title) {
  removeRaw(qcmStorageKey(title));
}
