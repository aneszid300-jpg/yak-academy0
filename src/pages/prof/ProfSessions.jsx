import { useEffect, useState } from "react";
import { useMyProfessor } from "../../features/prof/useMyProfessor.js";
import { dayLabel, isoDay, MONTH_NAMES, monthGrid, sameDay, sessionsOn, useNow, WEEK_DAYS } from "../../features/prof/schedule.js";
import { sessionDuration } from "../../features/live/status.js";
import { LIVE_CATEGORIES, liveCategory } from "../../config/contentConfig.js";
import { attendanceFor, deleteSession, isMockClass, isScheduledSession } from "../../services/classService.js";
import { SUBJECT_NAMES } from "../../data/courses.js";
import { Empty, LivePill, PENDING, SessionModal, StartButton, TimeRange } from "../../components/prof/ProfParts.jsx";
import SessionForm from "../../components/prof/SessionForm.jsx";

// الجلسات — /prof/sessions: a month calendar of the professor's Live sessions.
//   • each session is a chip in its category's colour (حصة عادية · مراجعة ·
//     حصة أسئلة وأجوبة · تمارين); the legend filters them
//   • a day opens on the side: its sessions (time, course, status, attendance,
//     «بدء الجلسة» / «تفاصيل») and «+ برمجة جلسة» for that day
//   • «‹ ›» change month, «اليوم» comes back; the form opens in a window

const MAX_CHIPS = 3;

export default function ProfSessions() {
  const { contents, sessions } = useMyProfessor();
  const now = useNow();
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(() => now);
  const [hidden, setHidden] = useState([]); // category keys filtered out
  const [details, setDetails] = useState(null);
  const [formDate, setFormDate] = useState(null); // null = closed
  const [saved, setSaved] = useState(null);

  const shown = sessions.filter((s) => !hidden.includes(liveCategory(s).key));
  const days = monthGrid(month);
  const dayItems = sessionsOn(shown, selected, now);
  const selectedPast = isoDay(selected) < isoDay(now);

  const go = (delta) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  const toToday = () => {
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelected(now);
  };
  const pick = (day) => {
    setSelected(day);
    if (day.getMonth() !== month.getMonth()) setMonth(new Date(day.getFullYear(), day.getMonth(), 1));
  };
  const toggleCat = (key) => setHidden((h) => (h.includes(key) ? h.filter((k) => k !== key) : [...h, key]));

  async function remove(session) {
    if (!window.confirm(`حذف «${session.title}»؟ لن تظهر للطلاب بعد الآن.`)) return;
    await deleteSession(session.id);
    setDetails(null);
  }

  // The form window closes with Escape.
  useEffect(() => {
    if (formDate === null) return;
    const onKey = (e) => e.key === "Escape" && setFormDate(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [formDate]);

  return (
    <section className="pd-page">
      <div className="pd-page-head pd-page-head-row">
        <div>
          <h1>الجلسات {isMockClass && <span className="pd-badge is-test">وضع تجريبي</span>}</h1>
          <p>اضغط على يوم لرؤية جلساته أو برمجة جلسة فيه.</p>
        </div>
        <button
          type="button"
          className="pd-btn pd-btn-primary"
          onClick={() => {
            setSaved(null);
            setFormDate(selectedPast ? "" : isoDay(selected));
          }}
        >
          + برمجة جلسة
        </button>
      </div>

      {saved && (
        <p className="pd-success" role="status">
          تمت برمجة «{saved}». تظهر الآن لطلاب الدورة.
        </p>
      )}

      <div className="cal-layout">
        {/* ---------- the month ---------- */}
        <section className="pd-card cal" aria-label="تقويم الجلسات">
          <div className="cal-head">
            <div className="cal-nav">
              <button type="button" className="cal-arrow" onClick={() => go(-1)} aria-label="الشهر السابق">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
              <h2 className="cal-title" aria-live="polite">
                {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
              </h2>
              <button type="button" className="cal-arrow" onClick={() => go(1)} aria-label="الشهر التالي">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            </div>
            <button type="button" className="pd-btn pd-btn-ghost pd-btn-sm" onClick={toToday}>
              اليوم
            </button>
          </div>

          <div className="cal-legend" role="group" aria-label="أنواع الجلسات">
            {LIVE_CATEGORIES.map((c) => (
              <button key={c.key} type="button" className={"cal-legend-item is-" + c.tone + (hidden.includes(c.key) ? " is-off" : "")} aria-pressed={!hidden.includes(c.key)} onClick={() => toggleCat(c.key)}>
                <span className="pd-cat-dot" aria-hidden="true" />
                {c.label}
              </button>
            ))}
          </div>

          <div className="cal-grid" role="grid">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="cal-weekday" role="columnheader">
                <span className="cal-weekday-long">{d}</span>
                <span className="cal-weekday-short">{d.replace("ال", "").slice(0, 2)}</span>
              </div>
            ))}
            {days.map((day) => {
              const items = sessionsOn(shown, day, now);
              const out = day.getMonth() !== month.getMonth();
              const isToday = sameDay(day, now);
              const isSel = sameDay(day, selected);
              const past = isoDay(day) < isoDay(now);
              return (
                <button
                  key={isoDay(day)}
                  type="button"
                  role="gridcell"
                  aria-selected={isSel}
                  aria-label={`${dayLabel(day, now)} — ${items.length ? `${items.length} جلسة` : "لا جلسات"}`}
                  className={"cal-day" + (out ? " is-out" : "") + (isToday ? " is-today" : "") + (isSel ? " is-selected" : "") + (past ? " is-past" : "")}
                  onClick={() => pick(day)}
                >
                  <span className="cal-num">{day.getDate()}</span>
                  <span className="cal-chips">
                    {items.slice(0, MAX_CHIPS).map((it) => {
                      const c = liveCategory(it.session);
                      return (
                        <span key={it.key} className={"cal-chip is-" + c.tone + (it.status.key === "live" ? " is-live" : "")}>
                          <b dir="ltr">{it.session.startsAt}</b> {it.session.title}
                        </span>
                      );
                    })}
                    {items.length > MAX_CHIPS && <span className="cal-more">+{items.length - MAX_CHIPS}</span>}
                  </span>
                  {items.length > 0 && (
                    <span className="cal-dots" aria-hidden="true">
                      {items.slice(0, 4).map((it) => (
                        <i key={it.key} className={"is-" + liveCategory(it.session).tone} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------- the selected day ---------- */}
        <aside className="pd-card cal-day-panel" aria-labelledby="calDayTitle">
          <div className="pd-card-head">
            <h2 id="calDayTitle" className="pd-card-title">
              {dayLabel(selected, now)}
            </h2>
            <span className="pd-muted">{dayItems.length ? `${dayItems.length} جلسة` : ""}</span>
          </div>

          {dayItems.length ? (
            <ul className="cal-agenda">
              {dayItems.map((item) => {
                const { session, status, day } = item;
                const c = liveCategory(session);
                const course = contents.find(({ course: x }) => x.id === session.courseId)?.course;
                const att = status.key === "soon" ? undefined : attendanceFor(session.id, isoDay(day));
                return (
                  <li key={item.key} className={"cal-event is-" + c.tone + (status.key === "live" ? " is-live" : "") + (status.key === "ended" ? " is-ended" : "")}>
                    <div className="cal-event-top">
                      <span className="cal-event-cat">{c.label}</span>
                      {status.key === "live" ? <LivePill>مباشر الآن</LivePill> : status.key === "ended" ? <span className="pd-muted">انتهت</span> : null}
                    </div>
                    <b className="cal-event-title">{session.title}</b>
                    <span className="cal-event-meta">
                      <TimeRange session={session} /> · {sessionDuration(session)}
                    </span>
                    <span className="cal-event-meta">
                      {course ? course.title : SUBJECT_NAMES[session.subjectKey]}
                      {att !== undefined && ` · الحضور ${att ? att.length : PENDING}`}
                    </span>
                    <div className="cal-event-actions">
                      {status.canJoin && <StartButton session={session} />}
                      <button type="button" className="pd-btn pd-btn-ghost pd-btn-sm" onClick={() => setDetails(item)}>
                        تفاصيل
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>{selectedPast ? "لم تكن هناك جلسات في هذا اليوم." : "لا توجد جلسات في هذا اليوم."}</Empty>
          )}

          {!selectedPast && (
            <button
              type="button"
              className="pd-btn pd-btn-ghost pd-btn-block cal-add"
              onClick={() => {
                setSaved(null);
                setFormDate(isoDay(selected));
              }}
            >
              + برمجة جلسة في هذا اليوم
            </button>
          )}
        </aside>
      </div>

      {formDate !== null && (
        <div className="pd-modal-overlay" onClick={() => setFormDate(null)}>
          <div className="cal-form-window" role="dialog" aria-modal="true" aria-label="برمجة جلسة جديدة" onClick={(e) => e.stopPropagation()}>
            <SessionForm
              key={formDate}
              contents={contents}
              initialDate={formDate}
              onCancel={() => setFormDate(null)}
              onDone={(title) => {
                setFormDate(null);
                setSaved(title);
              }}
            />
          </div>
        </div>
      )}

      <SessionModal item={details} onClose={() => setDetails(null)} onDelete={details && isScheduledSession(details.session.id) ? remove : undefined} />
    </section>
  );
}
