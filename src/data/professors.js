import { ALL_COURSES } from "./courses.js";

// Yak Academy professors, shown in the course details window and on their
// profile page (/dashboard/professors/:professorId). A course points to its
// professor with `professorId` (data/courses.js).
//
// Shape of one professor:
//   {
//     id: "amine-benali",          // stable slug, used in the URL
//     name: "أمين بن علي",
//     photo: null,                 // imported image (src/assets/images) or URL; null → initial avatar
//     subject: "math",             // subject key (SUBJECT_NAMES in data/courses.js)
//     specialty: "أستاذ رياضيات",  // short title under the name
//     bio: "",                     // a few lines about the professor
//   }
//
export const PROFESSORS = [
  { id: "zid-anes", name: "زيد انس", photo: null, subject: null, specialty: "", bio: "" },
];

export function getProfessor(professorId) {
  return PROFESSORS.find((professor) => professor.id === professorId) || null;
}

/** The courses a professor teaches, in the Courses page order. */
export function getProfessorCourses(professorId) {
  return ALL_COURSES.filter((course) => course.professorId === professorId);
}
