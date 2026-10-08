// Professor content service: the ONLY module the UI talks to for the files a
// professor uploads and the students then see. It delegates to an adapter,
// like paymentService:
//
//   UI → contentService → adapter
//                          ├─ mock        (src/services/mock/contentMock.js, DEVELOPMENT ONLY)
//                          ├─ unavailable (default in production until the backend exists)
//                          └─ backend     (to be written with the Django API; same functions)
//
// Choose it with VITE_CONTENT_ADAPTER ("mock" | "unavailable"). Default: "mock"
// in `npm run dev`, "unavailable" in production builds.
//
// The two sync reads (publishedExercises, getUploadedExercise) feed pages that
// render the course data synchronously; the backend adapter will serve them
// from a list it loads once.

import { ContentError } from "./contentContract.js";
import { contentMockAdapter } from "./mock/contentMock.js";
import { subscribe as subscribeMock } from "./mock/classMock.js";
import { PROF_UPLOAD } from "../config/contentConfig.js";

export { ContentError } from "./contentContract.js";

const unavailable = () => {
  throw new ContentError("unavailable", "Content backend is not connected yet.");
};
const unavailableAdapter = {
  name: "unavailable",
  listUploads: async () => [],
  uploadFile: async () => unavailable(),
  deleteUpload: async () => unavailable(),
  publishedExercises: () => [],
  fileUrl: async () => null,
};

const ADAPTERS = { mock: contentMockAdapter, unavailable: unavailableAdapter };
const adapterName = import.meta.env.VITE_CONTENT_ADAPTER || (import.meta.env.DEV ? "mock" : "unavailable");
const adapter = ADAPTERS[adapterName] || unavailableAdapter;

/** True while the development mock is active (pages then label themselves as a test). */
export const isMockContent = adapter === contentMockAdapter;

/** Re-run on any change (an upload, a deletion — also from another tab). */
export const onContentChange = (listener) => (isMockContent ? subscribeMock(listener) : () => {});

/** «PDF فقط · حد 20 MB»: null when the file is fine, otherwise the reason (Arabic). */
export function checkUpload(file) {
  if (!file) return "اختر ملفًا.";
  const isPdf = PROF_UPLOAD.types.includes(file.type) || /\.pdf$/i.test(file.name);
  if (!isPdf) return "الملف يجب أن يكون PDF.";
  if (file.size > PROF_UPLOAD.maxBytes) return `حجم الملف أكبر من ${PROF_UPLOAD.maxLabel}.`;
  return null;
}

/** @returns {Promise<import("./contentContract.js").Upload[]>} the professor's uploads, newest first */
export const listUploads = () => adapter.listUploads();

/** Sends one PDF for one course. Throws ContentError. */
export async function uploadFile({ courseId, kind, file }) {
  if (checkUpload(file)) throw new ContentError("invalid_file");
  return adapter.uploadFile({ courseId, kind, file, name: file.name, size: file.size, type: file.type || "application/pdf" });
}

export const deleteUpload = (id) => adapter.deleteUpload(id);

/* ---------- what the students see ---------- */

const UPLOAD_PREFIX = "up-";
export const isUploadId = (id) => typeof id === "string" && id.startsWith(UPLOAD_PREFIX);

const sizeText = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** A published upload in the shape of a course exercise (data/courses.js COURSE_EXERCISES). */
function asExercise(u) {
  return { id: u.id, courseId: u.courseId, title: u.name.replace(/\.pdf$/i, ""), meta: `PDF · ${sizeText(u.size)} · من الأستاذ`, uploadedAt: u.createdAt };
}

/** Exercise files uploaded by the professors, for the students (sync). */
export const publishedExercises = () => adapter.publishedExercises().map(asExercise);

export const getUploadedExercise = (id) => publishedExercises().find((x) => x.id === id) || null;

/** A URL to open an uploaded file, or null. */
export const uploadFileUrl = (id) => adapter.fileUrl(id);
