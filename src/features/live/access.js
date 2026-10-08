import { ALL_COURSES } from "../../data/courses.js";

// Live sessions and courses. Live sessions come with the units («الحصص
// المباشرة» are part of a unit): a session tied to a unit (session.courseId)
// belongs to that unit; a session without one belongs to every unit of its
// subject. The same rule decides who can see it.

/** Is this session part of this course («محتوى الدورة», access)? */
export function sessionBelongsToCourse(session, course) {
  return session.courseId ? session.courseId === course.id : session.subjectKey === course.subjectKey;
}

/** Can the student see it? `access` is useCoursesAccess() (server-side); nothing while unknown. */
export function canSeeLiveSession(session, access) {
  if (access.status !== "ready") return false;
  return ALL_COURSES.some((course) => sessionBelongsToCourse(session, course) && Boolean(access.access[course.id]?.hasAccess));
}
