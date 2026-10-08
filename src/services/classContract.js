// The classroom API's shapes — what links professors and students (what the
// backend will implement).
//
// @typedef {Object} Announcement  { id, professorId, courseId, text, createdAt }
// @typedef {Object} CourseStats   { enrolled: number, active: number }   counts only, no personal data
// @typedef {Object} Attendee      { name, at }                           who clicked «الانضمام» for one occurrence
// A scheduled session has the shape of data/liveSessions.js, plus createdAt.

export class ClassError extends Error {
  constructor(code, message = code) {
    super(message);
    this.name = "ClassError";
    this.code = code; // "unavailable" | "unauthenticated" | "forbidden" | "invalid" | "network"
  }
}
