import { COURSE_EXERCISES, getCourse, getCourseLessons } from "../../data/courses.js";
import { AI_DECKS } from "../../data/ai.js";
import { getFlashCards } from "../../data/flashcards.js";
import { allLiveSessions } from "../../services/liveService.js";
import { publishedExercises } from "../../services/contentService.js";
import { sessionBelongsToCourse } from "../live/access.js";

// «محتوى الدورة»: everything a course contains, gathered from the sources that
// already exist — nothing is counted by hand. The course is the container:
//
//   Course
//   ├── lessons    getCourseLessons(id)                   → study/:id/:lessonId
//   ├── live       liveService sessions (sessionBelongsToCourse) → live/:sessionId
//   ├── qcm        AI_DECKS with courseId = id; questions = getFlashCards(deck)
//   │                                                     → flash/:deckId
//   └── exercises  COURSE_EXERCISES + the professor's uploads (contentService) → pdf/:id
//
// When these come from the backend (professor/admin dashboards), only the
// sources change; counts and links follow.

export function getCourseContent(courseId) {
  const course = getCourse(courseId);
  if (!course) return null;
  const decks = AI_DECKS.filter((deck) => deck.courseId === courseId);
  return {
    lessons: getCourseLessons(courseId).map((l) => ({ id: l.id, title: l.title, meta: l.duration || null, to: `/dashboard/study/${courseId}/${l.id}` })),
    live: allLiveSessions().filter((s) => sessionBelongsToCourse(s, course)).map((s) => ({
      id: s.id,
      title: s.title,
      meta: `${s.startsAt} - ${s.endsAt}`,
      session: s, // its status (قريبًا / مباشر / انتهت) comes from the schedule
      to: `/dashboard/live/${s.id}`,
    })),
    qcm: decks.map((d) => ({ id: d.id, title: d.title, questions: getFlashCards(d.id).length, to: `/dashboard/flash/${d.id}` })),
    exercises: [...COURSE_EXERCISES, ...publishedExercises()].filter((e) => e.courseId === courseId).map((e) => ({ id: e.id, title: e.title, meta: e.meta, to: `/dashboard/pdf/${e.id}` })),
  };
}

/** Arabic count: 1 → one, 2 → two, 3–10 → n few, 11+ → n many. */
export const countAr = (n, [one, two, few, many]) => (n === 1 ? one : n === 2 ? two : n >= 3 && n <= 10 ? `${n} ${few}` : `${n} ${many}`);

export const COUNT_WORDS = {
  lessons: ["درس واحد", "درسان", "دروس", "درسًا"],
  live: ["جلسة واحدة", "جلستان", "جلسات", "جلسة"],
  qcm: ["سؤال واحد", "سؤالان", "أسئلة", "سؤالًا"],
  exercises: ["ملف PDF واحد", "ملفا PDF", "ملفات PDF", "ملف PDF"],
};
