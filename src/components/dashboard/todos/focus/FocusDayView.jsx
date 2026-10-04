import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { colorForSubject } from "../../../../features/todos/subjectColors.js";
import { useSubjectColors, useTodos } from "../../../../features/todos/store.js";
import {
  FOCUS_CIRC,
  choosePreset,
  describeArc,
  finishFocusSession,
  formatFocusDuration,
  formatMMSS,
  pad2,
  pauseFocusSession,
  polar,
  resumeFocusSession,
  selectFocusTask,
  setCustomMinutes,
  startFocusSession,
  subjectLabelFromSession,
  taskLabel,
  todayKey,
  useFocusSessions,
  useFocusState,
} from "../../../../features/focus/store.js";

const PRESETS = [
  { value: "15", label: "15 د" },
  { value: "25", label: "25 د" },
  { value: "45", label: "45 د" },
  { value: "60", label: "60 د" },
  { value: "custom", label: "مخصص" },
];
const NO_TASK = "بدون مهمة محددة";

// Legacy #focusDayView: the timer card on one side, today's summary
// (24-hour clock + subject bars) and the session log on the other.
export default function FocusDayView() {
  const focus = useFocusState();
  const sessions = useFocusSessions();
  const colorMap = useSubjectColors();
  const today = todayKey();
  const todaySessions = sessions.filter((s) => s && s.day === today);
  const todayTotal = todaySessions.reduce((sum, s) => sum + (s.elapsedSec || 0), 0);
  const colorOf = (s) => colorForSubject(subjectLabelFromSession(s), colorMap);

  return (
    <div className="focus-layout" id="focusDayView">
      <FocusHero focus={focus} />

      <div className="focus-side">
        <div className="focus-side-card">
          <div className="focus-side-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span>ملخص يومك</span>
            <span style={{ fontSize: 12, fontWeight: 900, color: "#7B4FE0" }}>{formatFocusDuration(todayTotal)}</span>
          </div>
          <DayClock sessions={todaySessions} total={todayTotal} colorOf={colorOf} />
          <SubjectBars sessions={todaySessions} colorMap={colorMap} />
        </div>

        <div className="focus-side-card">
          <div className="focus-side-title">سجل الجلسات</div>
          <div className="focus-history">
            {todaySessions.length === 0 ? (
              <div className="focus-empty">
                <div className="focus-empty-icon">🎯</div>
                ابدأ أول جلسة تركيز
                <br />
                ستظهر هنا تلقائياً
              </div>
            ) : (
              todaySessions.map((s, i) => {
                const d = s.startedAt ? new Date(s.startedAt) : null;
                const time = d && !Number.isNaN(d.getTime()) ? pad2(d.getHours()) + ":" + pad2(d.getMinutes()) : "";
                const color = colorOf(s);
                return (
                  <div key={s.id || i} className="focus-hist-item">
                    <span className="focus-hist-dot" style={{ background: color, boxShadow: `0 0 0 3px ${color}33` }}></span>
                    <div>
                      <div className="focus-hist-title">{s.taskTitle || "جلسة تركيز"}</div>
                      <div className="focus-hist-meta">{(time ? time + " · " : "") + (s.completed ? "مكتملة" : "منتهية مبكراً")}</div>
                    </div>
                    <span className="focus-hist-dur" style={{ color }}>{formatFocusDuration(s.elapsedSec)}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FocusHero({ focus }) {
  const todos = useTodos();
  const idle = focus.status === "idle";
  const [menuOpen, setMenuOpen] = useState(false);
  const ddRef = useRef(null);
  const customRef = useRef(null);

  // «المهمة المرتبطة»: only tasks that aren't done; a selection that no
  // longer exists falls back to «بدون مهمة محددة» (legacy refreshFocusTaskSelect).
  const options = [{ value: "", label: NO_TASK }];
  todos.forEach((t, i) => {
    if (t && typeof t === "object" && !t.done) options.push({ value: String(i), label: taskLabel(t) });
  });
  const selected = options.some((o) => o.value === focus.selectedTaskIdx) ? focus.selectedTaskIdx : "";
  const selectedLabel = options.find((o) => o.value === selected)?.label || NO_TASK;

  const open = menuOpen && idle;
  useEffect(() => {
    if (!open) return;
    const onClick = (event) => {
      if (ddRef.current && !ddRef.current.contains(event.target)) setMenuOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const progress = focus.durationSec > 0 ? 1 - focus.remainingSec / focus.durationSec : 1;
  const p = Math.max(0, Math.min(1, progress));
  const statusText = focus.status === "running" ? "جارٍ التركيز…" : focus.status === "paused" ? "متوقف مؤقتاً" : "جاهز للبدء";

  return (
    <div className={"focus-hero" + (focus.status === "running" ? " is-running" : "") + (focus.status === "paused" ? " is-paused" : "")}>
      <div className="focus-task-select-wrap">
        <div className="focus-task-label">المهمة المرتبطة</div>
        <div className={"focus-task-dd" + (open ? " is-open" : "")} ref={ddRef}>
          <button
            type="button"
            className="focus-task-dd-btn"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label="اختر مهمة"
            disabled={!idle}
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((v) => !v);
            }}
          >
            <span className="focus-task-dd-label">{selectedLabel}</span>
            <svg className="focus-task-dd-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div className="focus-task-dd-menu" role="listbox" hidden={!open}>
            {options.map((o) => (
              <button
                key={o.value || "none"}
                type="button"
                role="option"
                aria-selected={o.value === selected}
                className={"focus-task-dd-item" + (o.value === selected ? " is-selected" : "")}
                onClick={(event) => {
                  event.stopPropagation();
                  selectFocusTask(o.value);
                  setMenuOpen(false);
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="focus-ring-wrap">
        <svg className="focus-ring" viewBox="0 0 200 200" aria-hidden="true">
          <circle className="focus-ring-bg" cx="100" cy="100" r="85" />
          <circle className="focus-ring-fg" cx="100" cy="100" r="85" style={{ strokeDasharray: String(FOCUS_CIRC), strokeDashoffset: String(FOCUS_CIRC * (1 - p)) }} />
        </svg>
        <div className="focus-ring-center">
          <div className="focus-timer-display">{formatMMSS(focus.remainingSec)}</div>
          <div className={"focus-timer-status" + (focus.status === "running" ? " is-live" : "")}>{statusText}</div>
        </div>
      </div>

      <div className="focus-presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className={"focus-preset-btn" + (focus.preset === preset.value ? " active" : "")}
            disabled={!idle}
            style={idle ? undefined : { opacity: 0.55 }}
            onClick={() => {
              if (preset.value !== "custom") return choosePreset(preset.value);
              // Legacy focuses the minutes box right away: render the row first.
              flushSync(() => choosePreset("custom"));
              customRef.current?.focus();
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className={"focus-custom-row" + (focus.preset === "custom" ? " show" : "")}>
        <input
          ref={customRef}
          type="number"
          className="focus-custom-input"
          min="1"
          max="180"
          inputMode="numeric"
          value={focus.customMins}
          onChange={(event) => setCustomMinutes(event.target.value)}
          aria-label="مدة مخصصة بالدقائق"
        />
        <span className="focus-custom-unit">دقيقة</span>
      </div>

      {idle ? (
        <div className="focus-controls">
          <button type="button" className="focus-btn focus-btn-primary" onClick={startFocusSession}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            ابدأ الجلسة
          </button>
        </div>
      ) : (
        <div className="focus-controls">
          {focus.status === "paused" ? (
            <button type="button" className="focus-btn focus-btn-primary" onClick={resumeFocusSession}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              متابعة
            </button>
          ) : (
            <button type="button" className="focus-btn focus-btn-secondary" onClick={pauseFocusSession}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
              إيقاف مؤقت
            </button>
          )}
          <button
            type="button"
            className="focus-btn focus-btn-danger"
            onClick={() => {
              // Legacy asks with the browser's confirm dialog.
              if (window.confirm("إنهاء الجلسة الحالية؟")) finishFocusSession(false);
            }}
          >
            إنهاء الجلسة
          </button>
        </div>
      )}
    </div>
  );
}

// 24-hour clock: one arc per session of the day, in its subject colour.
function DayClock({ sessions, total, colorOf }) {
  const cx = 110, cy = 110, r = 78;
  return (
    <div className="focus-day-clock-wrap">
      <div className="focus-day-clock">
        <svg viewBox="0 0 220 220">
          <circle cx="110" cy="110" r="78" fill="none" stroke="rgba(123,79,224,0.08)" strokeWidth="16" />
          <g>
            {sessions.map((s, i) => {
              const d = s.startedAt ? new Date(s.startedAt) : null;
              if (!d || Number.isNaN(d.getTime())) return null;
              const startMin = d.getHours() * 60 + d.getMinutes();
              const durMin = Math.max(2, Math.round((s.elapsedSec || 0) / 60));
              const endMin = Math.min(24 * 60, startMin + durMin);
              return (
                <path key={s.id || i} d={describeArc(cx, cy, r, (startMin / 1440) * 360, (endMin / 1440) * 360)} fill="none" stroke={colorOf(s)} strokeWidth="16" strokeLinecap="butt" opacity="0.92" />
              );
            })}
          </g>
          <g>
            {Array.from({ length: 24 }, (_, h) => {
              const pt = polar(cx, cy, 98, h * 15);
              return (
                <text key={h} x={pt.x.toFixed(1)} y={(pt.y + 3).toFixed(1)} textAnchor="middle" className="focus-clock-hour">
                  {h}
                </text>
              );
            })}
          </g>
          <text x="110" y="108" textAnchor="middle" className="focus-clock-center-val">
            {Math.floor(total / 3600) + ":" + pad2(Math.floor((total % 3600) / 60))}
          </text>
          <text x="110" y="126" textAnchor="middle" className="focus-clock-center-lbl">ساعات التركيز</text>
        </svg>
      </div>
    </div>
  );
}

function SubjectBars({ sessions, colorMap }) {
  const map = {};
  sessions.forEach((s) => {
    const name = subjectLabelFromSession(s);
    map[name] = (map[name] || 0) + (s.elapsedSec || 0);
  });
  const entries = Object.keys(map)
    .map((name) => ({ name, sec: map[name], color: colorForSubject(name, colorMap) }))
    .sort((a, b) => b.sec - a.sec);

  if (!entries.length) {
    return (
      <div className="focus-subject-list">
        <div className="focus-empty">
          <div className="focus-empty-icon">📊</div>
          أكمل جلسات اليوم
          <br />
          ستظهر المواد هنا بألوانها
        </div>
      </div>
    );
  }
  const maxSec = entries[0].sec || 1;
  return (
    <div className="focus-subject-list">
      {entries.map((e) => (
        <div key={e.name} className="focus-subj-row">
          <span className="focus-subj-dot" style={{ background: e.color }}></span>
          <span className="focus-subj-name">{e.name}</span>
          <span className="focus-subj-mins">{Math.round(e.sec / 60)} د</span>
          <div className="focus-subj-bar">
            <div className="focus-subj-bar-fill" style={{ width: Math.max(6, Math.round((e.sec / maxSec) * 100)) + "%", background: e.color }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
