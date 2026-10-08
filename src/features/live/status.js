import { useEffect, useState } from "react";

// Status of a live session from its schedule and the current time:
//   "soon" (before startsAt) · "live" (between) · "ended" (after endsAt).
// A session without a date runs every day (the legacy Home card).
// The join action opens JOIN_EARLY_MIN minutes before the start, so a
// student who arrives a little early is not stuck in front of a waiting screen.

export const JOIN_EARLY_MIN = 10;

const STATUSES = {
  soon: { key: "soon", label: "تبدأ قريبًا", short: "قريبًا", tone: "soon" },
  live: { key: "live", label: "مباشر الآن", short: "مباشر", tone: "live" },
  ended: { key: "ended", label: "انتهت الجلسة", short: "انتهت", tone: "ended" },
};

const at = (day, hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
};

/** { key, label, short, tone, minutesToStart, canJoin, farOff } */
export function liveStatus(session, now = new Date()) {
  const day = session.date ? new Date(`${session.date}T00:00:00`) : now;
  const start = at(day, session.startsAt);
  const end = at(day, session.endsAt);
  const minutesToStart = Math.ceil((start - now) / 60000);
  const base = now < start ? STATUSES.soon : now < end ? STATUSES.live : STATUSES.ended;
  return {
    ...base,
    // More than an hour away: the header shows «العودة للرئيسية» instead of a status.
    farOff: base.key === "soon" && minutesToStart > 60,
    minutesToStart: base.key === "soon" ? minutesToStart : 0,
    canJoin: base.key === "live" || (base.key === "soon" && minutesToStart <= JOIN_EARLY_MIN),
  };
}

/** The session's status, re-checked every 15 s so the page flips on time. */
export function useLiveStatus(session) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  return session ? liveStatus(session, now) : null;
}

/** «20:00 — 22:00» */
export const sessionTime = (session) => `${session.startsAt} — ${session.endsAt}`;

/** Arabic count words: 1 ساعة، 2 ساعتان، 3–10 ساعات، 11+ ساعة. */
const counted = (n, one, two, few) => (n === 1 ? one : n === 2 ? two : n >= 3 && n <= 10 ? `${n} ${few}` : `${n} ${one}`);
export const minutesText = (n) => counted(n, "دقيقة", "دقيقتان", "دقائق");

export function sessionDuration(session) {
  const [h1, m1] = session.startsAt.split(":").map(Number);
  const [h2, m2] = session.endsAt.split(":").map(Number);
  const mins = h2 * 60 + m2 - (h1 * 60 + m1);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return [h ? counted(h, "ساعة", "ساعتان", "ساعات") : "", m ? minutesText(m) : ""].filter(Boolean).join(" و");
}

/** «بعد 25 دقيقة» / «بعد ساعتين» for a start that is coming. */
export function startsIn(minutes) {
  if (minutes < 60) return `بعد ${minutesText(minutes)}`;
  const h = Math.round(minutes / 60);
  return h === 1 ? "بعد ساعة" : h === 2 ? "بعد ساعتين" : `بعد ${counted(h, "ساعة", "ساعتين", "ساعات")}`;
}
