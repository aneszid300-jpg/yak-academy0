import { darkenHex, lightenHex } from "../../../features/todos/subjectColors.js";
import { deleteTodo, formatTodoTime, toggleTodo } from "../../../features/todos/store.js";

// One task on the «خطة اليوم» board — legacy buildStickyTodoHtml: lined
// paper in the subject's colour, a paper clip, the task number, subject,
// details, time, and a check / delete footer.
export default function StickyNote({ todo: rawTodo, index, color }) {
  const todo = rawTodo && typeof rawTodo === "object" ? rawTodo : {}; // tolerate null/garbage entries
  const light = lightenHex(color, 0.45);
  const dark = darkenHex(color, 0.25);
  const gradientId = "clipC" + index;
  const subject = todo.title || todo.text || "";
  const detail = todo.title ? todo.text || "" : "";
  const time = formatTodoTime(todo);

  return (
    <div
      className={`sticky-note has-subject-color color-${index % 6}` + (todo.done ? " done" : "")}
      style={{ "--note-color": color, "--note-bg": lightenHex(color, 0.82) }}
    >
      <div className="sticky-pin">
        <svg viewBox="0 0 24 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="24" y2="44">
              <stop offset="0%" stopColor={light} />
              <stop offset="40%" stopColor={color} />
              <stop offset="100%" stopColor={dark} />
            </linearGradient>
          </defs>
          <path d="M8 28 V10 C8 5.5 11.5 2 16 2 C20.5 2 24 5.5 24 10 V30 C24 37 18.5 42 12 42 C5.5 42 0 37 0 30 V14" stroke={`url(#${gradientId})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M8 28 V14 C8 10.5 10.5 8 14 8 C17.5 8 20 10.5 20 14 V28" stroke={`url(#${gradientId})`} strokeWidth="2.8" strokeLinecap="round" fill="none" />
        </svg>
      </div>
      <div className="sticky-num">{String(index + 1).padStart(2, "0")}</div>
      <div className="sticky-subject">{subject}</div>
      {detail && <div className="sticky-title">{detail}</div>}
      {time && (
        <div className="sticky-time">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          {time}
        </div>
      )}
      <div className="sticky-footer">
        <input
          type="checkbox"
          className="sticky-check"
          checked={!!todo.done}
          onChange={(event) => toggleTodo(index, event.target.checked)}
          aria-label={subject || "مهمة"}
        />
        <button type="button" className="sticky-menu" title="حذف" onClick={() => deleteTodo(index)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
