import { isUploadId } from "../../services/contentService.js";

// The professor's files: their uploads (contentService) and the exercise PDFs
// already in their courses (features/courses/content.js — without the uploads,
// which it now lists too), uploads first.
export function myFiles(contents, uploads) {
  const titles = Object.fromEntries(contents.map(({ course }) => [course.id, course.title]));
  return [
    ...uploads.filter((u) => titles[u.courseId]).map((u) => ({ key: u.id, name: u.name, courseTitle: titles[u.courseId], kind: u.kind, upload: u })),
    ...contents.flatMap(({ course, content }) => (content?.exercises || []).filter((x) => !isUploadId(x.id)).map((x) => ({ key: x.id, name: x.title, courseTitle: course.title, kind: "exercises", meta: x.meta }))),
  ];
}
