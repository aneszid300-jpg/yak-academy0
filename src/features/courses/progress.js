import { useSyncExternalStore } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { getCourseLessons } from "../../data/courses.js";
import { createStoredValue, parseJson } from "../../utils/storedValue.js";

// Lesson progress per student: which lessons of a unit are done («✓ تمّ الدرس»
// on the study page). Shared by the study page, the course cards and «دوراتي»,
// so they always agree. Kept in localStorage like the todos (there is no
// progress backend yet), one entry per signed-in user:
//   { [userId]: { [courseId]: { [lessonId]: true } } }
export const PROGRESS_KEY = "yak_course_progress";

const store = createStoredValue(PROGRESS_KEY, parseJson({}, (v) => typeof v === "object" && !Array.isArray(v)));
const NONE = {};

/** One unit: { done: { [lessonId]: true }, doneCount, total, pct, markDone(lessonId) } */
export function useCourseProgress(courseId) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const all = useSyncExternalStore(store.subscribe, store.get);
  const done = (userId && all[userId]?.[courseId]) || NONE;
  const total = getCourseLessons(courseId).length;
  const doneCount = Object.values(done).filter(Boolean).length;

  return {
    done,
    doneCount,
    total,
    pct: Math.min(100, Math.round((doneCount / (total || 1)) * 100)),
    markDone: (lessonId) => {
      if (!userId) return;
      const current = store.get();
      const mine = current[userId] || {};
      store.set({ ...current, [userId]: { ...mine, [courseId]: { ...mine[courseId], [lessonId]: true } } });
    },
  };
}
