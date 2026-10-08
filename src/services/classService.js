// Classroom service: the ONLY module the UI talks to for what links a
// professor and the students of their courses —
//   • announcements (professor → the course's students, the bell 🔔)
//   • Live sessions the professor schedules (shown to the students)
//   • enrolment and activity counts per course (no personal data)
//   • attendance of a Live session (who clicked «الانضمام عبر Zoom»)
// It delegates to an adapter, like paymentService:
//
//   UI → classService → adapter
//                        ├─ mock        (src/services/mock/classroomMock.js, DEVELOPMENT ONLY)
//                        ├─ unavailable (default in production until the backend exists)
//                        └─ backend     (to be written with the Django API; same functions)
//
// Choose it with VITE_CLASS_ADAPTER ("mock" | "unavailable"). Default: "mock"
// in `npm run dev`, "unavailable" in production builds. Reads are sync (the
// pages render them directly); the backend adapter will serve them from data
// it loads once and refreshes.

import { useSyncExternalStore } from "react";
import { ClassError } from "./classContract.js";
import { classroomMockAdapter } from "./mock/classroomMock.js";
import { getVersion, subscribe as subscribeMock } from "./mock/classMock.js";

export { ClassError } from "./classContract.js";

const unavailable = () => {
  throw new ClassError("unavailable", "Classroom backend is not connected yet.");
};
const unavailableAdapter = {
  name: "unavailable",
  createAnnouncement: async () => unavailable(),
  deleteAnnouncement: async () => unavailable(),
  announcements: () => [],
  createSession: async () => unavailable(),
  deleteSession: async () => unavailable(),
  sessions: () => [],
  recordEnrollment: async () => {},
  recordVisit: async () => {},
  courseStats: () => null,
  recordAttendance: async () => {},
  attendance: () => null,
};

const ADAPTERS = { mock: classroomMockAdapter, unavailable: unavailableAdapter };
const adapterName = import.meta.env.VITE_CLASS_ADAPTER || (import.meta.env.DEV ? "mock" : "unavailable");
const adapter = ADAPTERS[adapterName] || unavailableAdapter;

/** True while the development mock is active (pages then label themselves as a test). */
export const isMockClass = adapter === classroomMockAdapter;

/** Re-render on any change (also from another tab / the other account). */
const NOOP = () => () => {};
export function useClassVersion() {
  return useSyncExternalStore(isMockClass ? subscribeMock : NOOP, isMockClass ? getVersion : () => 0);
}

/* ---------- announcements ---------- */
const ANNOUNCEMENT_MAX = 500;
export { ANNOUNCEMENT_MAX };
export function createAnnouncement({ courseId, text }) {
  const clean = String(text || "").trim();
  if (!courseId || !clean || clean.length > ANNOUNCEMENT_MAX) throw new ClassError("invalid");
  return adapter.createAnnouncement({ courseId, text: clean });
}
export const deleteAnnouncement = (id) => adapter.deleteAnnouncement(id);
/** Announcements for these courses, newest first. */
export const announcementsFor = (courseIds) =>
  adapter
    .announcements()
    .filter((a) => courseIds.includes(a.courseId))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

/* ---------- scheduled Live sessions ---------- */
export const createSession = (fields) => adapter.createSession(fields);
export const deleteSession = (id) => adapter.deleteSession(id);
/** Sessions professors scheduled from their dashboard (data/liveSessions.js shape). */
export const scheduledSessions = () => adapter.sessions();
export const isScheduledSession = (id) => scheduledSessions().some((s) => s.id === id);

/* ---------- enrolments, activity ---------- */
export const recordEnrollment = (courseId) => adapter.recordEnrollment(courseId);
export const recordVisit = (courseId) => adapter.recordVisit(courseId);
/** { enrolled, active } for one course, or null while the server does not provide it. */
export const courseStats = (courseId) => adapter.courseStats(courseId);

/* ---------- attendance ---------- */
export const recordAttendance = (sessionId, date) => adapter.recordAttendance(sessionId, date);
/** [{ name, at }] for one occurrence, or null while the server does not provide it. */
export const attendanceFor = (sessionId, date) => adapter.attendance(sessionId, date);
