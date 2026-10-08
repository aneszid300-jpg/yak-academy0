// ╔══════════════════════════════════════════════════════════════════════╗
// ║  MOCK / DEVELOPMENT ONLY — NOT A SERVER.                              ║
// ║  Announcements, scheduled Live sessions, enrolments and attendance,   ║
// ║  kept in the shared mock (classMock.js). Replaced by the real backend ║
// ║  adapter (same functions, same shapes).                              ║
// ╚══════════════════════════════════════════════════════════════════════╝
//
// On the real server, enrolments, visits and attendance are recorded by the
// server itself; here the student's dashboard reports them (record* below).

import { ClassError } from "../classContract.js";
import { me, newId, now, snapshot, update } from "./classMock.js";

const DAY_MS = 86400000;

async function needUser(kind) {
  const user = await me();
  if (!user) throw new ClassError("unauthenticated");
  if (kind === "professor" && !user.professorId) throw new ClassError("forbidden");
  return user;
}

export const classroomMockAdapter = {
  name: "mock",

  /* ---------- announcements (professor → the course's students) ---------- */
  async createAnnouncement({ courseId, text }) {
    const user = await needUser("professor");
    const item = { id: newId("an"), professorId: user.professorId, courseId, text, createdAt: now() };
    update((d) => d.announcements.push(item));
    return item;
  },
  async deleteAnnouncement(id) {
    const user = await needUser("professor");
    update((d) => {
      d.announcements = d.announcements.filter((a) => !(a.id === id && a.professorId === user.professorId));
    });
  },
  announcements: () => snapshot().announcements,

  /* ---------- Live sessions scheduled by professors ---------- */
  async createSession(fields) {
    const user = await needUser("professor");
    const session = {
      id: newId("live"),
      professorId: user.professorId,
      courseId: fields.courseId,
      subjectKey: fields.subjectKey,
      title: fields.title,
      kind: fields.kind,
      date: fields.date,
      startsAt: fields.startsAt,
      endsAt: fields.endsAt,
      description: fields.description || null,
      topics: [],
      resources: [],
      recordingUrl: null,
      provider: { type: "zoom", joinUrl: fields.joinUrl || null },
      createdAt: now(),
    };
    update((d) => d.sessions.push(session));
    return session;
  },
  async deleteSession(id) {
    const user = await needUser("professor");
    update((d) => {
      d.sessions = d.sessions.filter((s) => !(s.id === id && s.professorId === user.professorId));
    });
  },
  sessions: () => snapshot().sessions,

  /* ---------- enrolments and visits (counts only for the professor) ---------- */
  async recordEnrollment(courseId) {
    const user = await me();
    if (!user || user.professorId) return;
    if (snapshot().enrollments.some((e) => e.courseId === courseId && e.userId === user.id)) return;
    update((d) => d.enrollments.push({ courseId, userId: user.id, at: now() }));
  },
  async recordVisit(courseId) {
    const user = await me();
    if (!user || user.professorId) return;
    update((d) => {
      d.visits = d.visits.filter((v) => !(v.courseId === courseId && v.userId === user.id));
      d.visits.push({ courseId, userId: user.id, at: now() });
    });
  },
  courseStats(courseId) {
    const { enrollments, visits } = snapshot();
    const since = Date.now() - 7 * DAY_MS;
    return {
      enrolled: enrollments.filter((e) => e.courseId === courseId).length,
      active: visits.filter((v) => v.courseId === courseId && new Date(v.at).getTime() >= since).length,
    };
  },

  /* ---------- attendance («الانضمام عبر Zoom») ---------- */
  async recordAttendance(sessionId, date) {
    const user = await me();
    if (!user || user.professorId) return;
    if (snapshot().attendance.some((a) => a.sessionId === sessionId && a.date === date && a.userId === user.id)) return;
    update((d) => d.attendance.push({ sessionId, date, userId: user.id, name: user.name, at: now() }));
  },
  attendance(sessionId, date) {
    return snapshot()
      .attendance.filter((a) => a.sessionId === sessionId && a.date === date)
      .map(({ name, at }) => ({ name, at }));
  },
};
