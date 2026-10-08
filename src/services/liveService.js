// Live service: the ONLY module the UI asks for live sessions. Today it reads
// data/liveSessions.js and the sessions professors schedule (classService); when the backend exists, replace the body of
// getLiveSession with the API call — same shape, same errors — and nothing
// in the UI changes.
//
//   listLiveSessions()  → Promise<Session[]>      every session (the UI keeps the ones
//                                                   the student has access to)
//   getLiveSession(id) → Promise<Session|null>   null = no such session
//   both throw on a failure to load (network, server)

import { LIVE_SESSIONS } from "../data/liveSessions.js";
import { scheduledSessions } from "./classService.js";

/** Every session: data/liveSessions.js + the ones professors scheduled (classService). */
export const allLiveSessions = () => [...LIVE_SESSIONS, ...scheduledSessions()];

export async function listLiveSessions() {
  return allLiveSessions();
}

export async function getLiveSession(sessionId) {
  return allLiveSessions().find((session) => session.id === sessionId) || null;
}
