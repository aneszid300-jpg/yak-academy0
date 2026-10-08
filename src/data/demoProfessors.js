// DEMO ONLY — three sample professors to preview «أساتذتنا» with several
// teachers. Not real people. Same shape as data/professors.js; they are
// listed after the real professors by one line there. To remove them: delete
// that line and this file, and give their courses another professorId. To replace them: put real professors in
// data/professors.js instead.
//
// Each professor teaches one subject: the courses of that subject point to
// them (course.professorId in data/courses.js). Photos:
// src/assets/images/professors/. Experience,
// qualifications and approach are sample text, filled on some profiles only
// so both the full and the partial profile can be seen.

import { photoLeila, photoSara, photoYoucef } from "../assets/images/index.js";

export const DEMO_PROFESSORS = [
  {
    id: "demo-sara-belkacem",
    demo: true,
    name: "سارة بلقاسم",
    photo: photoSara,
    subject: "math",
    specialty: "أستاذة رياضيات",
    bio: "تبسّط الدوال والتحليل خطوة بخطوة، مع تمارين من مواضيع البكالوريا السابقة.",
    experience: "9 سنوات في تدريس الباك",
    qualifications: ["ماستر في الرياضيات التطبيقية", "شهادة الكفاءة في التعليم الثانوي"],
    approach: "تبدأ كل درس بفكرة واحدة واضحة، ثم تبني عليها بأمثلة متدرجة حتى تصل لتمارين البكالوريا. بعد كل وحدة: سلسلة تمارين محلولة وأخطاء شائعة يجب تفاديها.",
  },
  {
    id: "demo-youcef-hamdi",
    demo: true,
    name: "يوسف حمدي",
    photo: photoYoucef,
    subject: "science",
    specialty: "أستاذ علوم الطبيعة والحياة",
    bio: "يربط الوراثة والتغذية بأمثلة من الحياة اليومية، مع مخططات تلخيصية لكل وحدة.",
    experience: "6 سنوات في تدريس علوم الطبيعة",
    qualifications: ["ماستر في البيولوجيا"],
  },
  {
    id: "demo-leila-mourad",
    demo: true,
    name: "ليلى مراد",
    photo: photoLeila,
    subject: "arabic",
    specialty: "أستاذة اللغة العربية",
    bio: "تركز على البلاغة وتحليل النصوص بمنهجية واضحة تساعدك في الإجابة يوم الامتحان.",
    approach: "تحليل النص خطوة بخطوة: الفهم، ثم البناء الفني، ثم صياغة الإجابة. مع نماذج إجابات كاملة من مواضيع سابقة."
  },
];
