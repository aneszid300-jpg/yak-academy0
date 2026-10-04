import { useSyncExternalStore } from "react";
import { createStoredValue, parseJson } from "../../utils/storedValue.js";
import { colorForSubject } from "../todos/subjectColors.js";
import { getSubjectColors, getTodos, markTodoDone } from "../todos/store.js";

// Focus sessions (تركيز) — ported from legacy/dashboard.html.
//
// Like legacy, the timer lives at page level (module scope), not in a
// component: it keeps running when you switch to «مهامي» or leave for another
// dashboard view, and a session that reaches 0 is saved even while you're
// away. Nothing about a running timer is stored, so a reload clears it
// (legacy behaviour). Finished sessions go to localStorage `yak_focus_sessions`.

export const FOCUS_KEY = "yak_focus_sessions";
export const FOCUS_CIRC = 2 * Math.PI * 85;
const MAX_SESSIONS = 100;
const TICK_MS = 250;

const sessionsStore = createStoredValue(FOCUS_KEY, parseJson([], Array.isArray));
export const useFocusSessions = () => useSyncExternalStore(sessionsStore.subscribe, sessionsStore.get);

/* ---------- helpers (legacy names) ---------- */

export const pad2 = (n) => String(n).padStart(2, "0");
export function todayKey(d = new Date()) {
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}
export function formatFocusDuration(totalSec) {
  totalSec = Math.max(0, Math.floor(totalSec || 0));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0 && m > 0) return h + "س " + m + "د";
  if (h > 0) return h + "س";
  if (m > 0) return m + " د";
  return (totalSec % 60) + " ث";
}
export function formatMMSS(sec) {
  sec = Math.max(0, Math.floor(sec));
  return pad2(Math.floor(sec / 60)) + ":" + pad2(sec % 60);
}
// The subject a session belongs to: its task title up to the first dash.
export function subjectLabelFromSession(s) {
  if (!s) return "جلسة تركيز";
  const t = (s.taskTitle || "").trim();
  if (!t || t === "جلسة تركيز") return "عام";
  const parts = t.split(/—|–|-/);
  return (parts[0] || t).trim() || "عام";
}
// Label of a task in the «المهمة المرتبطة» picker.
export function taskLabel(t) {
  return t.title ? t.title + (t.text ? " — " + t.text : "") : t.text || "مهمة";
}

/* ---------- timer + page state ---------- */

let state = {
  status: "idle", // idle | running | paused
  durationSec: 25 * 60,
  remainingSec: 25 * 60,
  startedAt: null,
  wallStartAt: null,
  accumulatedMs: 0,
  taskIdx: "",
  taskTitle: "",
  // UI state that legacy kept in the DOM across page switches
  selectedTaskIdx: "",
  preset: "25",
  customMins: "30",
  view: "day", // day | week | month
  weekOffset: 0,
  monthOffset: 0,
  selectedDayKey: null,
};
let tickTimer = null;
const listeners = new Set();
const set = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const useFocusState = () => useSyncExternalStore(subscribe, () => state);

function tick() {
  if (state.status !== "running") return;
  const elapsed = state.accumulatedMs + (Date.now() - state.startedAt);
  const remainingSec = Math.max(0, Math.ceil(state.durationSec - elapsed / 1000));
  if (remainingSec !== state.remainingSec) set({ remainingSec });
  if (remainingSec <= 0) finishFocusSession(true);
}
function startTicking() {
  clearInterval(tickTimer);
  tickTimer = setInterval(tick, TICK_MS);
}
function stopTicking() {
  clearInterval(tickTimer);
  tickTimer = null;
}

export function startFocusSession() {
  if (state.status === "running") return;
  let taskIdx = state.selectedTaskIdx;
  let taskTitle = "";
  if (taskIdx !== "") {
    const t = getTodos()[parseInt(taskIdx, 10)];
    if (t && !t.done) taskTitle = taskLabel(t);
    else taskIdx = ""; // the task is gone/done: legacy's picker had already reset
  }
  const now = Date.now();
  set({ taskIdx, taskTitle, status: "running", startedAt: now, wallStartAt: now, accumulatedMs: 0, remainingSec: state.durationSec });
  startTicking();
}

export function pauseFocusSession() {
  if (state.status !== "running") return;
  stopTicking();
  set({ accumulatedMs: state.accumulatedMs + (Date.now() - state.startedAt), status: "paused" });
}

export function resumeFocusSession() {
  if (state.status !== "paused") return;
  set({ status: "running", startedAt: Date.now() });
  startTicking();
}

export function finishFocusSession(autoComplete) {
  if (state.status === "idle") return;
  let elapsedMs = state.accumulatedMs;
  if (state.status === "running" && state.startedAt) elapsedMs += Date.now() - state.startedAt;
  let elapsedSec = Math.max(1, Math.round(elapsedMs / 1000));
  if (elapsedSec > state.durationSec) elapsedSec = state.durationSec;
  stopTicking();

  const now = new Date();
  const session = {
    id: "fs_" + now.getTime(),
    day: todayKey(now),
    taskTitle: state.taskTitle || "جلسة تركيز",
    taskIdx: state.taskIdx,
    durationSec: state.durationSec,
    elapsedSec,
    startedAt: new Date(state.wallStartAt || Date.now()).toISOString(),
    completed: !!autoComplete || elapsedSec >= state.durationSec * 0.95,
    color: colorForSubject(state.taskTitle || "جلسة تركيز", getSubjectColors()),
  };
  sessionsStore.set([session, ...sessionsStore.get()].slice(0, MAX_SESSIONS));

  if (session.completed && state.taskIdx !== "") markTodoDone(parseInt(state.taskIdx, 10), now.toISOString());

  set({ status: "idle", remainingSec: state.durationSec, startedAt: null, wallStartAt: null, accumulatedMs: 0, taskIdx: "", taskTitle: "" });
}

// Legacy setFocusDurationMinutes: 1–180, anything unparsable → 25.
function setDurationMinutes(mins) {
  if (state.status !== "idle") return;
  mins = Math.max(1, Math.min(180, parseInt(mins, 10) || 25));
  set({ durationSec: mins * 60, remainingSec: mins * 60 });
}
export function choosePreset(preset) {
  if (state.status !== "idle") return;
  set({ preset });
  setDurationMinutes(preset === "custom" ? state.customMins : preset);
}
export function setCustomMinutes(value) {
  set({ customMins: value });
  setDurationMinutes(value);
}
export const selectFocusTask = (value) => set({ selectedTaskIdx: value });

export function setFocusView(view) {
  // Switching to week/month clears the picked day (legacy setFocusCalendarView).
  set(view === "day" ? { view } : { view, selectedDayKey: null });
}
export const selectFocusDay = (key) => set({ selectedDayKey: key });
export const shiftWeek = (delta) => set({ weekOffset: Math.min(0, state.weekOffset + delta) });
export const shiftMonth = (delta) => set({ monthOffset: Math.min(0, state.monthOffset + delta) });

/* ---------- chart data (legacy getWeekSessions / getMonthSessions) ---------- */

export function getMonthSessions(sessions, offset) {
  const now = new Date();
  const ref = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const byDay = {};
  let totalSec = 0;
  sessions.forEach((s) => {
    if (!s?.startedAt) return;
    const d = new Date(s.startedAt);
    if (Number.isNaN(d.getTime())) return;
    if (d.getFullYear() !== year || d.getMonth() !== month) return;
    (byDay[d.getDate()] ||= []).push(s);
    totalSec += s.elapsedSec || 0;
  });
  return { year, month, daysInMonth, byDay, totalSec, ref };
}

function getWeekRange(offset) {
  const now = new Date();
  const mondayOffset = (now.getDay() + 6) % 7; // weeks start on Monday
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset + offset * 7);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function getWeekSessions(sessions, offset) {
  const range = getWeekRange(offset);
  const byDay = {};
  const days = [];
  let totalSec = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(range.start);
    d.setDate(range.start.getDate() + i);
    const key = todayKey(d);
    days.push({ date: d, key, sessions: [] });
    byDay[key] = [];
  }
  sessions.forEach((s) => {
    if (!s?.startedAt) return;
    const d = new Date(s.startedAt);
    if (Number.isNaN(d.getTime())) return;
    if (d < range.start || d > range.end) return;
    (byDay[todayKey(d)] ||= []).push(s);
    totalSec += s.elapsedSec || 0;
  });
  days.forEach((day) => (day.sessions = byDay[day.key] || []));
  const onejan = new Date(range.start.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((range.start - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return { range, days, totalSec, weekNum };
}

/* ---------- SVG helpers ---------- */

export function polar(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
export function describeArc(cx, cy, r, startAngle, endAngle) {
  if (endAngle - startAngle >= 359.9) endAngle = startAngle + 359.9;
  if (endAngle <= startAngle) endAngle = startAngle + 0.5;
  const start = polar(cx, cy, r, endAngle);
  const end = polar(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return ["M", start.x, start.y, "A", r, r, 0, large, 0, end.x, end.y].join(" ");
}
