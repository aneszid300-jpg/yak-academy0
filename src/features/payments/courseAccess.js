import { useEffect, useSyncExternalStore } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { ALL_COURSES } from "../../data/courses.js";
import { getContentAccessMap, getContentPrices, onPaymentChange } from "../../services/paymentService.js";

// Which units the signed-in student can open, and their prices — fetched once
// for all units through paymentService and shared by every component
// (course cards, gates, payment page). Refreshed when a purchase changes or
// the user changes. Nothing here is persisted.

const COURSE_IDS = ALL_COURSES.map((course) => course.id);
const EMPTY = { userId: null, status: "idle", access: {}, prices: {}, error: null };

let state = EMPTY;
let request = 0;
const listeners = new Set();
const set = (next) => {
  state = next;
  listeners.forEach((listener) => listener());
};

async function load(userId, { quiet = false } = {}) {
  const id = ++request;
  // Keep showing the known state while refreshing in the background.
  if (!quiet || state.userId !== userId) set({ ...EMPTY, userId, status: "loading" });
  try {
    const [access, prices] = await Promise.all([getContentAccessMap("course", COURSE_IDS), getContentPrices("course", COURSE_IDS)]);
    if (id === request) set({ userId, status: "ready", access, prices, error: null });
  } catch (error) {
    if (id === request) set({ ...EMPTY, userId, status: "error", error });
  }
}

onPaymentChange(() => {
  if (state.userId) load(state.userId, { quiet: true });
});

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** All units: { status: "idle"|"loading"|"ready"|"error", access, prices, error, reload } */
export function useCoursesAccess() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const snapshot = useSyncExternalStore(subscribe, () => state);

  useEffect(() => {
    if (userId && (state.userId !== userId || state.status === "idle")) load(userId);
    if (!userId && state.userId) set(EMPTY);
  }, [userId]);

  const current = snapshot.userId === userId ? snapshot : { ...EMPTY, status: userId ? "loading" : "idle" };
  return { ...current, reload: () => userId && load(userId) };
}

/** One unit: { status, hasAccess, accessStatus, purchase, price, error, reload } */
export function useCourseAccess(courseId) {
  const all = useCoursesAccess();
  const access = all.access[courseId];
  return {
    status: all.status,
    hasAccess: Boolean(access?.hasAccess),
    accessStatus: access?.status ?? "none",
    purchase: access?.purchase ?? null,
    price: all.prices[courseId] ?? null,
    error: all.error,
    reload: all.reload,
  };
}
