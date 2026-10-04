import { mathCover, mechanicsCover, physicsCover, scienceCover } from "../assets/images/index.js";

// Course data — copied from legacy/dashboard.html (#page-courses + STUDY_COURSES).
// Legacy had no IDs (it keyed everything by the Arabic title); the IDs below
// are fixed slugs so URLs stay stable: /dashboard/study/:courseId.
// Images are exactly as legacy mapped them (e.g. the Arabic courses reuse
// science-cover.png, الميكانيك الكلاسيكي uses oy.png → mechanics-cover.png).

// data-section keys → subject name passed to the study page (legacy map).
export const SUBJECT_NAMES = {
  math: "الرياضيات",
  physics: "الفيزياء",
  science: "علوم الطبيعة والحياة",
  arabic: "اللغة العربية",
  french: "الفرنسية",
  english: "الإنجليزية",
  history: "التاريخ والجغرافيا",
  islamic: "التربية الإسلامية",
  literature: "الأدب العربي",
};

// Subject filter chips (labels differ slightly from SUBJECT_NAMES in legacy).
export const SUBJECT_CHIPS = [
  { key: "all", label: "الكل" },
  { key: "math", label: "الرياضيات" },
  { key: "physics", label: "الفيزياء" },
  { key: "science", label: "علوم الطبيعة والحياة" },
  { key: "arabic", label: "اللغة العربية" },
  { key: "french", label: "اللغة الفرنسية" },
  { key: "english", label: "اللغة الإنجليزية" },
  { key: "history", label: "التاريخ والجغرافيا" },
  { key: "philosophy", label: "الفلسفة" },
  { key: "islamic", label: "التربية الإسلامية" },
  { key: "literature", label: "الأدب العربي" },
];

// `accent` is the legacy .diff-* class that colours the card.
export const COURSE_SECTIONS = [
  {
    key: "math",
    title: "الرياضيات",
    dot: null, // default dot colour (--electric-violet)
    courses: [
      { id: "math-equations", title: "المعادلات والمتراجحات", unit: "الوحدة 2", credit: "2500", image: mathCover, accent: "diff-easy" },
      { id: "math-limits", title: "النهايات والاتصال", unit: "الوحدة 3", credit: "2500", image: mathCover, accent: "diff-medium" },
      { id: "math-definite-integral", title: "التكامل المحدد", unit: "الوحدة 4", credit: "2500", image: mathCover, accent: "diff-advanced" },
    ],
  },
  {
    key: "physics",
    title: "الفيزياء",
    dot: "#F59E0B",
    courses: [
      { id: "physics-mechanics", title: "الميكانيك الكلاسيكي", unit: "الوحدة 2", credit: "2500", image: mechanicsCover, accent: "diff-orange" },
      { id: "physics-electrostatics", title: "الكهرباء الساكنة", unit: "الوحدة 1", credit: "2500", image: physicsCover, accent: "diff-easy" },
      { id: "physics-electric-current", title: "الكهرباء التيارية", unit: "الوحدة 3", credit: "2500", image: physicsCover, accent: "diff-violet" },
    ],
  },
  {
    key: "science",
    title: "علوم الطبيعة والحياة",
    dot: "#10B981",
    courses: [
      { id: "science-plant-nutrition", title: "التغذية عند النبات", unit: "الوحدة 1", credit: "2500", image: scienceCover, accent: "diff-easy" },
      { id: "science-genetics", title: "الوراثة والجينات", unit: "الوحدة 2", credit: "2500", image: scienceCover, accent: "diff-medium" },
      { id: "science-organ-functions", title: "وظائف الأعضاء الحيوية", unit: "الوحدة 3", credit: "2500", image: scienceCover, accent: "diff-blue" },
    ],
  },
  {
    key: "arabic",
    title: "اللغة العربية",
    dot: "#F43F5E",
    courses: [
      { id: "arabic-grammar", title: "القواعد والنحو", unit: "الوحدة 1", credit: "2500", image: scienceCover, accent: "diff-easy" },
      { id: "arabic-rhetoric", title: "البلاغة", unit: "الوحدة 2", credit: "2500", image: scienceCover, accent: "diff-medium" },
      { id: "arabic-literary-texts", title: "النصوص الأدبية", unit: "الوحدة 3", credit: "2500", image: scienceCover, accent: "diff-advanced" },
    ],
  },
];

// Lessons shown on the study page (legacy STUDY_COURSES). Only two courses
// had their own lessons; every other course used the "default" list.
const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/";
const COURSE_LESSONS = {
  "math-equations": [
    { title: "مقدمة حول المعادلات", duration: "12 د", video: SAMPLE_VIDEO + "BigBuckBunny.mp4" },
    { title: "حل المعادلات من الدرجة الأولى", duration: "18 د", video: SAMPLE_VIDEO + "ElephantsDream.mp4" },
    { title: "المتراجحات وتمثيلها", duration: "15 د", video: SAMPLE_VIDEO + "Sintel.mp4" },
    { title: "تمارين تطبيقية", duration: "20 د", video: SAMPLE_VIDEO + "ForBiggerBlazes.mp4" },
    { title: "ملخص الوحدة", duration: "10 د", video: SAMPLE_VIDEO + "ForBiggerEscapes.mp4" },
  ],
  "math-limits": [
    { title: "مفهوم النهاية", duration: "14 د" },
    { title: "حساب النهايات", duration: "22 د" },
    { title: "الاتصال على مجال", duration: "16 د" },
    { title: "تمارين وحلول", duration: "19 د" },
  ],
};
const DEFAULT_LESSONS = [
  { title: "الدرس 1: مقدمة", duration: "10 د" },
  { title: "الدرس 2: الشرح الأساسي", duration: "18 د" },
  { title: "الدرس 3: أمثلة", duration: "15 د" },
  { title: "الدرس 4: تمارين", duration: "20 د" },
  { title: "الدرس 5: ملخص", duration: "8 د" },
];

export const ALL_COURSES = COURSE_SECTIONS.flatMap((section) =>
  section.courses.map((course) => ({ ...course, subjectKey: section.key, subject: SUBJECT_NAMES[section.key] }))
);

export function getCourse(courseId) {
  return ALL_COURSES.find((course) => course.id === courseId) || null;
}

// Legacy TEST_VIDEOS: lessons without their own video play these sample
// clips, picked by the lesson's position.
const TEST_VIDEOS = [
  SAMPLE_VIDEO + "BigBuckBunny.mp4",
  SAMPLE_VIDEO + "ElephantsDream.mp4",
  SAMPLE_VIDEO + "ForBiggerBlazes.mp4",
  SAMPLE_VIDEO + "ForBiggerEscapes.mp4",
  SAMPLE_VIDEO + "Sintel.mp4",
];

// Lesson IDs are their 1-based position: /dashboard/study/:courseId/:lessonId.
export function getCourseLessons(courseId) {
  return (COURSE_LESSONS[courseId] || DEFAULT_LESSONS).map((lesson, i) => ({
    ...lesson,
    id: String(i + 1),
    video: lesson.video || TEST_VIDEOS[i % TEST_VIDEOS.length],
  }));
}

/* ---------- تمارين الدورات (legacy #coursesViewExercises) ---------- */

export const SAMPLE_PDF = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";

export const EXERCISE_TABS = [
  { key: "all", label: "الكل" },
  { key: "math", label: "الرياضيات" },
  { key: "physics", label: "الفيزياء" },
  { key: "science", label: "علوم الطبيعة" },
  { key: "arabic", label: "اللغة العربية" },
  { key: "french", label: "الفرنسية" },
  { key: "english", label: "الإنجليزية" },
];

// Opened in the PDF viewer (/dashboard/pdf/:id) with the chip + meta as subtitle.
export const COURSE_EXERCISES = [
  { id: "courses-ex-integration", subject: "math", chip: "الرياضيات", title: "تمارين التكامل بالتجزئة والتعويض", meta: "12 صفحة · 2.4 MB · محلولة" },
  { id: "courses-ex-kirchhoff", subject: "physics", chip: "الفيزياء", title: "تمارين التيار الكهربائي وقوانين كيرشوف", meta: "18 صفحة · 3.1 MB · حلول" },
  { id: "courses-ex-genetics", subject: "science", chip: "علوم الطبيعة", title: "تمارين الوراثة والتكاثر", meta: "10 صفحة · 1.8 MB · محلولة" },
  { id: "courses-ex-grammar", subject: "arabic", chip: "اللغة العربية", title: "تمارين القواعد والبلاغة", meta: "14 صفحة · 2.0 MB · ملخص" },
  { id: "courses-ex-exponential", subject: "math", chip: "الرياضيات", title: "تمارين الدوال الأسية واللوغاريتمية", meta: "16 صفحة · 2.7 MB · محلولة" },
  { id: "courses-ex-waves", subject: "physics", chip: "الفيزياء", title: "تمارين الموجات والضوء", meta: "11 صفحة · 1.9 MB · حلول" },
];
