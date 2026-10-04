import { COURSE_EXERCISES, SAMPLE_PDF } from "./courses.js";
import { BAC_YEARS, getBacStreams, getBacSubject, streamShortName } from "./library.js";

// PDF viewer data. Legacy had no PDF registry: whoever opened the viewer
// passed a title and a meta line, and every file was the same external sample
// (SAMPLE_PDF). This module resolves the IDs the React pages link to into
// exactly those legacy titles/meta lines — no extra data is stored.
//
//   courses-ex-…                  «تمارين الدورات» sticker
//   bac-<subject>-<stream>-<year>  Library year card (stream = 1-based)

const BAC_ID = /^bac-([a-z]+)-(\d+)-(\d{4})$/;

export function getPdf(pdfId) {
  const exercise = COURSE_EXERCISES.find((e) => e.id === pdfId);
  if (exercise) {
    // legacy openFromSticker(): meta = chip + " · " + sticker meta
    return { title: exercise.title, meta: exercise.chip + " · " + exercise.meta, url: SAMPLE_PDF };
  }

  const match = BAC_ID.exec(pdfId || "");
  if (match) {
    const subject = getBacSubject(match[1]);
    const stream = subject ? getBacStreams(subject.id)[parseInt(match[2], 10) - 1] : null;
    const year = parseInt(match[3], 10);
    if (subject && stream && BAC_YEARS.includes(year)) {
      // legacy year card: its title text, and «BAC <year> · موضوع + حل تجريبي»
      return {
        title: "موضوع " + subject.name + " – " + streamShortName(stream.name),
        meta: "BAC " + year + " · موضوع + حل تجريبي",
        url: SAMPLE_PDF,
      };
    }
  }
  return null;
}
