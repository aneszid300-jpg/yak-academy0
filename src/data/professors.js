import { ALL_COURSES } from "./courses.js";
import { DEMO_PROFESSORS } from "./demoProfessors.js";
import { photoZidAnes } from "../assets/images/index.js";

// Yak Academy professors — one subject each, shown in the course details window and on their
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
//     courseIds: [],               // optional: more courses to show on the profile
//     experience: "",              // optional, e.g. "12 سنة في تدريس الباك"
//     qualifications: [],          // optional, e.g. ["ماستر في الرياضيات"]
//     approach: "",                // optional: «أسلوب التدريس», a few lines
//   Optional fields left empty are simply not shown on the profile.
//   }
//
export const PROFESSORS = [
  { id: "zid-anes", name: "زيد انس", photo: photoZidAnes, subject: "physics", specialty: "أستاذ فيزياء", bio: "" },
  ...DEMO_PROFESSORS, // DEMO ONLY (UI preview) — remove this line to hide them
];

export function getProfessor(professorId) {
  return PROFESSORS.find((professor) => professor.id === professorId) || null;
}

/** The courses a professor teaches, in the Courses page order. */
export function getProfessorCourses(professorId) {
  const extra = getProfessor(professorId)?.courseIds || [];
  return ALL_COURSES.filter((course) => course.professorId === professorId || extra.includes(course.id));
}
