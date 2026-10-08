import { useEffect, useState } from "react";
import { liveStatus } from "../live/status.js";

// The professor's sessions laid out on days. A session with a date happens
// that day; one without (date: null) happens every day (data/liveSessions.js).

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const MONTHS = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** «الأربعاء 8 أكتوبر» (with the year when asked) */
export const dayAr = (d, withYear = false) => `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}${withYear ? ` ${d.getFullYear()}` : ""}`;

/** «اليوم — الأربعاء 8 أكتوبر», «غداً — …», or the day itself. */
export function dayLabel(day, now) {
  const diff = Math.round((startOfDay(day) - startOfDay(now)) / 86400000);
  return diff === 0 ? `اليوم — ${dayAr(day)}` : diff === 1 ? `غداً — ${dayAr(day)}` : dayAr(day);
}

/** A session on one day, with that day's status. */
export function occurrence(session, day, now) {
  const d = startOfDay(day);
  return { session, day: d, status: liveStatus({ ...session, date: isoDay(d) }, now), key: `${session.id}@${isoDay(d)}` };
}

/** The next `days` days (today first), each with its sessions in time order. */
export function scheduleDays(sessions, now, days = 7) {
  const today = startOfDay(now);
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const items = sessions
      .filter((s) => !s.date || s.date === isoDay(day))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map((s) => occurrence(s, day, now));
    return { day, items };
  }).filter((d) => d.items.length);
}

/** Sessions with a date that has passed (daily sessions have no history). */
export function pastSessions(sessions, now) {
  return sessions
    .filter((s) => s.date && liveStatus(s, now).key === "ended")
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((s) => occurrence(s, new Date(`${s.date}T00:00:00`), now));
}

/** Re-renders every 30 s so statuses flip on time. */
export function useNow(ms = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

/** The sessions on one day, in time order (a daily session is on every day). */
export function sessionsOn(sessions, day, now) {
  const iso = isoDay(day);
  return sessions
    .filter((s) => !s.date || s.date === iso)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map((s) => occurrence(s, day, now));
}

/** The 6 weeks shown for a month (Saturday first, as in Algeria). */
export function monthGrid(month) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 1) % 7; // Saturday = 0
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

export const MONTH_NAMES = MONTHS;
export const WEEK_DAYS = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
export const sameDay = (a, b) => isoDay(a) === isoDay(b);
