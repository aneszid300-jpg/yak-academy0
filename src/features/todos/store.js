import { useSyncExternalStore } from "react";
import { colorForSubject, normalizeSubjectKey } from "./subjectColors.js";
import { createStoredValue, parseJson, readRaw, writeRaw } from "../../utils/storedValue.js";

// localStorage keys — the same ones legacy/dashboard.html uses.
export const TODO_KEY = "yak_todos";
export const SUBJECT_COLORS_KEY = "yak_subject_colors";
export const SUBJECT_COLORS_SETUP_KEY = "yak_subject_colors_setup_done";

const todosStore = createStoredValue(TODO_KEY, parseJson([], Array.isArray));
const colorsStore = createStoredValue(
  SUBJECT_COLORS_KEY,
  parseJson({}, (v) => typeof v === "object" && !Array.isArray(v))
);

/* ---------- todos (legacy loadTodos/saveTodos + the Home list actions) ---------- */

export function useTodos() {
  return useSyncExternalStore(todosStore.subscribe, todosStore.get);
}

export function toggleTodo(index, done) {
  const todos = todosStore.get().slice();
  if (!todos[index]) return;
  const todo = { ...todos[index], done };
  if (done) todo.completedAt = new Date().toISOString();
  else delete todo.completedAt;
  todos[index] = todo;
  todosStore.set(todos);
}

export function deleteTodo(index) {
  const todos = todosStore.get().slice();
  todos.splice(index, 1);
  todosStore.set(todos);
}

// Legacy addTodoFromQuickModal(): newest first, colour from the subject.
export function addTodo(subject, detail) {
  const todo = {
    title: subject.name,
    subjectKey: subject.key,
    text: detail,
    timeFrom: "",
    timeTo: "",
    done: false,
    color: colorForSubject(subject.name, colorsStore.get()),
  };
  todosStore.set([todo, ...todosStore.get()]);
}

/* ---------- subject colours ---------- */

export const getTodos = () => todosStore.get();
export const getSubjectColors = () => colorsStore.get();

// Focus: a completed session ticks off its linked task (legacy finishFocusSession).
export function markTodoDone(index, completedAt) {
  const todos = todosStore.get().slice();
  if (!todos[index] || todos[index].done) return;
  todos[index] = { ...todos[index], done: true, completedAt };
  todosStore.set(todos);
}

export function useSubjectColors() {
  return useSyncExternalStore(colorsStore.subscribe, colorsStore.get);
}

export function setSubjectColor(name, color) {
  colorsStore.set({ ...colorsStore.get(), [normalizeSubjectKey(name)]: color });
}

export function isSubjectSetupDone() {
  return readRaw(SUBJECT_COLORS_SETUP_KEY) === "1";
}

export function markSubjectSetupDone() {
  writeRaw(SUBJECT_COLORS_SETUP_KEY, "1");
}

/* ---------- display helpers (legacy formatTodoTime / toHHmm) ---------- */

function toHHmm(value) {
  if (!value) return "";
  const match = String(value).trim().match(/^([01]?\d|2[0-3]):([0-5]\d)/);
  if (!match) return "";
  return (match[1].length === 1 ? "0" + match[1] : match[1]) + ":" + match[2];
}

export function formatTodoTime(todo) {
  if (!todo) return "";
  const from = toHHmm(todo.timeFrom);
  const to = toHHmm(todo.timeTo);
  // The arrow is always added by the platform, never typed by the user.
  if (from && to) return "‎" + from + " → " + to;
  if (from) return "‎" + from;
  if (to) return "‎" + to;
  if (todo.time) return toHHmm(todo.time);
  return "";
}
