// Library — «مواضيع البكالوريا», copied from legacy/dashboard.html
// (#page-library stickers + BAC_STREAMS + openBacStream's year list).
// Hard-coded demo data, like legacy. Everything opens the same sample PDF.

export { SAMPLE_PDF } from "./courses.js";

// Level 1: subject stickers (order, icons, counts and colour slots as legacy).
export const BAC_SUBJECTS = [
  { id: "math", name: "الرياضيات", icon: "√x", count: "96 ملف" },
  { id: "physics", name: "الفيزياء", icon: "⚛", count: "72 ملف" },
  { id: "science", name: "علوم الطبيعة والحياة", icon: "🔬", count: "58 ملف" },
  { id: "arabic", name: "اللغة العربية", icon: "ع", count: "57 ملف" },
  { id: "french", name: "اللغة الفرنسية", icon: "FR", count: "48 ملف" },
  { id: "english", name: "اللغة الإنجليزية", icon: "EN", count: "42 ملف" },
  { id: "history", name: "التاريخ والجغرافيا", icon: "🌍", count: "39 ملف" },
  { id: "islamic", name: "التربية الإسلامية", icon: "☪", count: "28 ملف" },
  { id: "philosophy", name: "الفلسفة", icon: "💭", count: "31 ملف" },
];

// Level 2: streams (شعب) per subject.
const BAC_STREAMS = {
  math: [
    { name: "مواضيع البكالوريا للشعب الأدبية", count: 19 },
    { name: "مواضيع البكالوريا شعبة علوم تجريبية", count: 20 },
    { name: "مواضيع البكالوريا شعبة رياضيات", count: 19 },
    { name: "مواضيع البكالوريا شعبة تقني رياضي", count: 19 },
    { name: "مواضيع البكالوريا شعبة تسيير واقتصاد", count: 19 },
  ],
  physics: [
    { name: "مواضيع البكالوريا شعبة علوم تجريبية", count: 18 },
    { name: "مواضيع البكالوريا شعبة رياضيات", count: 17 },
    { name: "مواضيع البكالوريا شعبة تقني رياضي", count: 16 },
  ],
  science: [
    { name: "مواضيع البكالوريا شعبة علوم تجريبية", count: 22 },
    { name: "مواضيع البكالوريا شعبة رياضيات", count: 12 },
  ],
  arabic: [
    { name: "مواضيع البكالوريا للشعب الأدبية", count: 20 },
    { name: "مواضيع البكالوريا شعبة علوم تجريبية", count: 15 },
    { name: "مواضيع البكالوريا شعبة رياضيات", count: 14 },
  ],
  french: [{ name: "مواضيع البكالوريا لجميع الشعب", count: 18 }],
  english: [{ name: "مواضيع البكالوريا لجميع الشعب", count: 16 }],
  history: [
    { name: "مواضيع البكالوريا للشعب الأدبية", count: 14 },
    { name: "مواضيع البكالوريا شعبة علوم", count: 12 },
  ],
  islamic: [{ name: "مواضيع البكالوريا لجميع الشعب", count: 14 }],
  philosophy: [
    { name: "مواضيع البكالوريا للشعب الأدبية", count: 16 },
    { name: "مواضيع البكالوريا شعبة علوم", count: 10 },
  ],
};
const FALLBACK_STREAMS = [{ name: "مواضيع البكالوريا", count: 10 }];
export const STREAM_ICONS = ["📘", "📗", "📙", "📕", "📓"];

// Level 3: the same years for every stream.
export const BAC_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];

export const getBacSubject = (id) => BAC_SUBJECTS.find((s) => s.id === id) || null;
export const getBacStreams = (subjectId) => BAC_STREAMS[subjectId] || FALLBACK_STREAMS;
// «مواضيع البكالوريا شعبة رياضيات» → «شعبة رياضيات»
export const streamShortName = (name) => name.replace("مواضيع البكالوريا ", "");

// The شعب a subject is examined in, as short labels: «رياضيات», «علوم تجريبية»,
// «الشعب الأدبية», «جميع الشعب». Used for «الأقسام المعنية بهذه الدورة».
export const getSubjectBranches = (subjectId) =>
  (BAC_STREAMS[subjectId] || []).map((stream) =>
    streamShortName(stream.name).replace(/^شعبة /, "").replace(/^لجميع /, "جميع ").replace(/^للشعب /, "الشعب ")
  );

// A year card opens the PDF viewer: /dashboard/pdf/bac-<subject>-<stream n°>-<year>.
export const bacPaperId = (subjectId, streamNumber, year) => `bac-${subjectId}-${streamNumber}-${year}`;
