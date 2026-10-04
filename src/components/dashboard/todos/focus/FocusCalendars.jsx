import { colorForSubject } from "../../../../features/todos/subjectColors.js";
import { useSubjectColors } from "../../../../features/todos/store.js";
import {
  describeArc,
  getMonthSessions,
  getWeekSessions,
  polar,
  selectFocusDay,
  shiftMonth,
  shiftWeek,
  subjectLabelFromSession,
  todayKey,
  useFocusSessions,
  useFocusState,
} from "../../../../features/focus/store.js";

const DAY_NAMES = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const MONTHS = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const thousands = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// A day chip in the strips under both charts (legacy .focus-month-day).
function DayButton({ date, dayKey, sessions, selected, colorMap }) {
  const has = sessions.length > 0;
  const labels = [];
  sessions.forEach((s) => {
    const lab = subjectLabelFromSession(s);
    if (!labels.includes(lab)) labels.push(lab);
  });
  return (
    <button
      type="button"
      className={"focus-month-day" + (has ? " has-data" : "") + (dayKey === todayKey() ? " is-today" : "") + (selected ? " is-selected" : "")}
      aria-pressed={selected}
      onClick={() => selectFocusDay(dayKey)}
    >
      <span className="focus-month-day-num">{date.getDate()}</span>
      <span className="focus-month-day-date">{DAY_NAMES[date.getDay()]}</span>
      <span style={{ display: "flex", gap: 2, minHeight: 6 }}>
        {has ? (
          labels.map((lab) => <span key={lab} className="focus-month-day-dot" style={{ background: colorForSubject(lab, colorMap) }}></span>)
        ) : (
          <span className="focus-month-day-dot empty"></span>
        )}
      </span>
    </button>
  );
}

function Legend({ labels, colorMap, id }) {
  return (
    <div className="focus-color-legend" id={id}>
      {labels.map((lab) => (
        <span key={lab} className="focus-color-legend-item">
          <span className="focus-color-legend-dot" style={{ background: colorForSubject(lab, colorMap) }}></span>
          {lab}
        </span>
      ))}
    </div>
  );
}

function PanelHead({ title, sub, name, prevLabel, nextLabel, onPrev, onNext }) {
  return (
    <div className="focus-month-head">
      <div>
        <div className="focus-month-title">{title}</div>
        <div className="focus-month-sub">{sub}</div>
      </div>
      <div className="focus-month-nav">
        <button type="button" aria-label={prevLabel} onClick={onPrev}>‹</button>
        <span className="focus-month-name">{name}</span>
        <button type="button" aria-label={nextLabel} onClick={onNext}>›</button>
      </div>
    </div>
  );
}

/* ---------- الشهر ---------- */
export function FocusMonthPanel({ show }) {
  const sessions = useFocusSessions();
  const colorMap = useSubjectColors();
  const { monthOffset, selectedDayKey } = useFocusState();
  const data = getMonthSessions(sessions, monthOffset);
  const cx = 140, cy = 140, n = data.daysInMonth;

  const dominant = (list) => {
    const by = {};
    list.forEach((s) => {
      const lab = subjectLabelFromSession(s);
      by[lab] = (by[lab] || 0) + (s.elapsedSec || 0);
    });
    return Object.keys(by).sort((a, b) => by[b] - by[a])[0];
  };

  // Legend: the whole month, or only the picked day.
  const legendTotals = {};
  Object.keys(data.byDay).forEach((d) =>
    data.byDay[d].forEach((s) => {
      if (selectedDayKey && (s.startedAt ? todayKey(new Date(s.startedAt)) : "") !== selectedDayKey) return;
      const lab = subjectLabelFromSession(s);
      legendTotals[lab] = (legendTotals[lab] || 0) + (s.elapsedSec || 0);
    })
  );
  const legend = Object.keys(legendTotals).sort((a, b) => legendTotals[b] - legendTotals[a]);

  return (
    <div className={"focus-month-panel" + (show ? " show" : "")} id="focusMonthPanel">
      <PanelHead
        title="الشهر"
        sub="30 يوماً من التركيز — راقب عادة التركيز"
        name={MONTHS[data.ref.getMonth()] + " " + data.ref.getFullYear()}
        prevLabel="الشهر السابق"
        nextLabel="الشهر التالي"
        onPrev={() => shiftMonth(-1)}
        onNext={() => shiftMonth(1)}
      />
      <div className="focus-month-clock-wrap">
        <div className="focus-month-clock">
          <svg viewBox="0 0 280 280">
            <g>
              {[40, 55, 70, 85, 100].map((r) => (
                <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(123,79,224,0.1)" strokeWidth="1" />
              ))}
              {Array.from({ length: 12 }, (_, i) => {
                const p1 = polar(cx, cy, 40, i * 30), p2 = polar(cx, cy, 100, i * 30);
                return <line key={i} x1={p1.x.toFixed(1)} y1={p1.y.toFixed(1)} x2={p2.x.toFixed(1)} y2={p2.y.toFixed(1)} stroke="rgba(123,79,224,0.08)" strokeWidth="1" />;
              })}
            </g>
            <g>
              {Array.from({ length: n }, (_, i) => i + 1).map((day) => {
                const list = data.byDay[day] || [];
                if (!list.length) return null;
                const color = colorForSubject(dominant(list) || "عام", colorMap);
                const startAng = ((day - 1) / n) * 360;
                let endAng = (day / n) * 360 - 1.2;
                if (endAng <= startAng) endAng = startAng + 2;
                return (
                  <g key={day}>
                    <path d={describeArc(cx, cy, 100, startAng, endAng)} fill="none" stroke={color} strokeWidth="14" strokeLinecap="butt" opacity="0.95" />
                    <path d={describeArc(cx, cy, 78, startAng, endAng)} fill="none" stroke={color} strokeWidth="8" strokeLinecap="butt" opacity="0.45" />
                  </g>
                );
              })}
            </g>
            <g>
              {Array.from({ length: n }, (_, i) => i + 1).map((d) => {
                const p = polar(cx, cy, 118, ((d - 0.5) / n) * 360);
                const has = (data.byDay[d] || []).length > 0;
                return (
                  <text key={d} x={p.x.toFixed(1)} y={(p.y + 3).toFixed(1)} textAnchor="middle" className="focus-clock-hour" fill={has ? "#5B3AA6" : "#9B8FB5"} fontSize="9" fontWeight="800">
                    {d}
                  </text>
                );
              })}
            </g>
            <text x="140" y="136" textAnchor="middle" className="focus-month-total">{thousands(Math.round(data.totalSec / 60))}</text>
            <text x="140" y="156" textAnchor="middle" className="focus-month-total-lbl">دقائق</text>
          </svg>
        </div>
      </div>
      <div className="focus-month-days" id="focusMonthDays">
        {Array.from({ length: n }, (_, i) => i + 1).map((dd) => {
          const date = new Date(data.year, data.month, dd);
          const key = todayKey(date);
          return <DayButton key={key} date={date} dayKey={key} sessions={data.byDay[dd] || []} selected={selectedDayKey === key} colorMap={colorMap} />;
        })}
      </div>
      <Legend labels={legend} colorMap={colorMap} id="focusMonthLegend" />
    </div>
  );
}

/* ---------- الأسبوع ---------- */
export function FocusWeekPanel({ show }) {
  const sessions = useFocusSessions();
  const colorMap = useSubjectColors();
  const { weekOffset, selectedDayKey } = useFocusState();
  const data = getWeekSessions(sessions, weekOffset);
  const cx = 140, cy = 140;

  // «النشاط حسب الساعة» — the picked day only, if one is picked.
  const buckets = new Array(24).fill(0);
  data.days.forEach((day) => {
    if (selectedDayKey && day.key !== selectedDayKey) return;
    day.sessions.forEach((s) => {
      const d = s.startedAt ? new Date(s.startedAt) : null;
      if (!d || Number.isNaN(d.getTime())) return;
      buckets[d.getHours()] += s.elapsedSec || 0;
    });
  });
  const maxH = Math.max(...buckets, 1);
  const weekLabels = [];
  data.days.forEach((day) =>
    day.sessions.forEach((s) => {
      const lab = subjectLabelFromSession(s);
      if (!weekLabels.includes(lab)) weekLabels.push(lab);
    })
  );

  return (
    <div className={"focus-month-panel focus-week-panel" + (show ? " show" : "")} id="focusWeekPanel">
      <PanelHead
        title="الأسبوع"
        sub="شوف وقت التركيز خلال الأسبوع"
        name={"الأسبوع " + data.weekNum + " · " + data.range.start.getFullYear()}
        prevLabel="الأسبوع السابق"
        nextLabel="الأسبوع التالي"
        onPrev={() => shiftWeek(-1)}
        onNext={() => shiftWeek(1)}
      />
      <div className="focus-month-clock-wrap">
        <div className="focus-month-clock">
          <svg viewBox="0 0 280 280">
            <g>
              {[45, 60, 75, 90, 105].map((r) => (
                <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(123,79,224,0.12)" strokeWidth="1" />
              ))}
              {Array.from({ length: 24 }, (_, i) => {
                const a = (i / 24) * 360;
                const p1 = polar(cx, cy, 45, a), p2 = polar(cx, cy, 105, a);
                return <line key={i} x1={p1.x.toFixed(1)} y1={p1.y.toFixed(1)} x2={p2.x.toFixed(1)} y2={p2.y.toFixed(1)} stroke="rgba(123,79,224,0.06)" strokeWidth="1" />;
              })}
            </g>
            <g>
              {data.days.flatMap((day) =>
                day.sessions.map((s, i) => {
                  const d = new Date(s.startedAt);
                  const hour = d.getHours() + d.getMinutes() / 60;
                  const mins = (s.elapsedSec || 0) / 60;
                  const p = polar(cx, cy, 55 + Math.min(40, mins * 1.2), (hour / 24) * 360);
                  return (
                    <circle key={day.key + i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={(3 + Math.min(6, mins / 8)).toFixed(1)} fill={colorForSubject(subjectLabelFromSession(s), colorMap)} opacity="0.85" />
                  );
                })
              )}
            </g>
            <g>
              {Array.from({ length: 12 }, (_, i) => i * 2).map((h) => {
                const p = polar(cx, cy, 120, (h / 24) * 360);
                return (
                  <text key={h} x={p.x.toFixed(1)} y={(p.y + 3).toFixed(1)} textAnchor="middle" className="focus-clock-hour" fontSize="9" fontWeight="700" fill="#9B8FB5">
                    {h}
                  </text>
                );
              })}
            </g>
            <text x="140" y="136" textAnchor="middle" className="focus-month-total">{thousands(Math.round(data.totalSec / 60))}</text>
            <text x="140" y="156" textAnchor="middle" className="focus-month-total-lbl">دقائق</text>
          </svg>
        </div>
      </div>
      <div className="focus-month-days" id="focusWeekDays">
        {data.days.map((day) => (
          <DayButton key={day.key} date={day.date} dayKey={day.key} sessions={day.sessions} selected={selectedDayKey === day.key} colorMap={colorMap} />
        ))}
      </div>
      <div className="focus-week-hourly">
        <div className="focus-week-hourly-title">النشاط حسب الساعة</div>
        <div className="focus-week-hour-bars">
          {buckets.map((sec, hr) => {
            const empty = !sec;
            let h = Math.round((sec / maxH) * 60);
            if (!empty && h < 6) h = 6;
            if (empty) h = 3;
            return (
              <div key={hr} className="focus-week-hour-col" title={hr + ":00"}>
                <div className={"focus-week-hour-bar" + (empty ? " is-empty" : "")} style={{ height: h + "px" }}></div>
                <span className="focus-week-hour-lbl">{hr % 3 === 0 ? hr : " "}</span>
              </div>
            );
          })}
        </div>
        <Legend labels={weekLabels} colorMap={colorMap} />
      </div>
    </div>
  );
}
