// ╔══════════════════════════════════════════════════════════════════════╗
// ║  MOCK / DEVELOPMENT ONLY — NOT A SERVER.                              ║
// ║  Simulates what the backend will hold between professors and          ║
// ║  students, so both dashboards can be tested together.                ║
// ║  Replaced by the real backend adapter (same functions, same shapes).  ║
// ╚══════════════════════════════════════════════════════════════════════╝
//
// • Shared by every account on this device (localStorage), so a professor
//   and a student signed in one after the other in the same browser see each
//   other's actions — like with the real server. Other devices see nothing.
// • Uploaded PDFs are kept in this browser's IndexedDB so students can open
//   them in the viewer. Nothing leaves the browser.
// • Reset from the console: yakClassMock.reset()

import { supabase } from "../supabase.js";

const KEY = "yak_class_mock";
const EMPTY = { uploads: [], announcements: [], sessions: [], enrollments: [], visits: [], attendance: [] };

/* ---------- the shared store ---------- */

let version = 0;
let cache = null;
const listeners = new Set();

function readRaw() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (data && typeof data === "object") return { ...EMPTY, ...data };
  } catch {
    // unreadable → start empty
  }
  return { ...EMPTY };
}

/** The whole store, the same object until something changes. */
export function snapshot() {
  if (!cache) cache = readRaw();
  return cache;
}
export const getVersion = () => version;

function changed() {
  cache = null;
  version += 1;
  listeners.forEach((listener) => listener());
}

export function update(mutate) {
  const data = readRaw();
  mutate(data);
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // storage full or blocked
  }
  changed();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
// Another tab (the other account) changed it.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === KEY || event.key === null) changed();
  });
}

/* ---------- the signed-in account ---------- */

export async function me() {
  const { data } = (await supabase?.auth.getSession()) ?? {};
  const user = data?.session?.user;
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    name: meta.full_name || meta.name || (user.email ? user.email.split("@")[0] : "طالب"),
    professorId: user.app_metadata?.role === "professor" ? user.app_metadata.professor_id || null : null,
  };
}

/** An approved purchase = the student is enrolled in that course (counts for its professor). */
export function enroll(courseId, userId) {
  if (!courseId || !userId) return;
  if (snapshot().enrollments.some((e) => e.courseId === courseId && e.userId === userId)) return;
  update((d) => d.enrollments.push({ courseId, userId, at: new Date().toISOString() }));
}

export const newId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const now = () => new Date().toISOString();

/* ---------- uploaded files (IndexedDB) ---------- */

const DB = "yak-class-files";
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("files");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function tx(mode, run) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction("files", mode);
    const req = run(t.objectStore("files"));
    t.oncomplete = () => resolve(req?.result);
    t.onerror = () => reject(t.error);
  });
}
export const putFile = (id, blob) => tx("readwrite", (s) => s.put(blob, id));
export const getFile = (id) => tx("readonly", (s) => s.get(id));
export const deleteFile = (id) => tx("readwrite", (s) => s.delete(id));

if (typeof window !== "undefined") {
  window.yakClassMock = {
    state: snapshot,
    reset() {
      update((d) => Object.assign(d, EMPTY));
      try {
        indexedDB.deleteDatabase(DB);
      } catch {
        // ignore
      }
    },
  };
}
