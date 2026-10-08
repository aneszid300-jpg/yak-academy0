// The professor content API's shapes (what the backend will implement).
//
// @typedef {"exercises"|"flashcards"} UploadKind
// @typedef {Object} Upload
// @property {string} id
// @property {string} courseId     data/courses.js id
// @property {UploadKind} kind
// @property {string} name         original file name
// @property {number} size         bytes
// @property {string} type         MIME type (application/pdf)
// @property {string} createdAt    ISO date

export class ContentError extends Error {
  constructor(code, message = code) {
    super(message);
    this.name = "ContentError";
    this.code = code; // "unavailable" | "unauthenticated" | "invalid_file" | "network"
  }
}
