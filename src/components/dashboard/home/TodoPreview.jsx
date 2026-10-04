import { useState } from "react";
import { resolveTaskColor } from "../../../features/todos/subjectColors.js";
import { deleteTodo, formatTodoTime, toggleTodo, useSubjectColors, useTodos } from "../../../features/todos/store.js";
import TodoAddModal from "../todos/TodoAddModal.jsx";

// Home «مهام اليوم» card — legacy .todo-section-card with the compact list
// (buildCompactTodoHtml). Tasks live in localStorage `yak_todos`.
export default function TodoPreview() {
  const todos = useTodos();
  const colorMap = useSubjectColors();
  const [adding, setAdding] = useState(false);

  return (
    <div className="todo-section-card">
      <div className="todo-day-header">
        <div className="todo-day-left">
          <span className="todo-day-badge">اليوم</span>
          <span className="todo-day-label">مهام اليوم</span>
        </div>
        <button type="button" className="home-todos-plus-btn" title="إضافة مهمة" aria-label="إضافة مهمة" onClick={() => setAdding(true)}>
          <span aria-hidden="true">+</span>
        </button>
      </div>

      <div className="timeline-list">
        {todos.length === 0 ? (
          <div className="todo-empty">ما كاش مهام اليوم — أضف أول مهمة ✍️</div>
        ) : (
          todos.map((todo, index) => <TodoItem key={index} todo={todo} index={index} color={resolveTaskColor(todo, colorMap)} />)
        )}
      </div>

      <div className="todo-add-row home-todo-add-row">
        <button type="button" className="todo-add-btn home-todo-primary-btn" onClick={() => setAdding(true)}>
          <span>إضافة مهمة</span>
        </button>
      </div>

      {adding && <TodoAddModal onClose={() => setAdding(false)} />}
    </div>
  );
}

function TodoItem({ todo: rawTodo, index, color }) {
  const todo = rawTodo && typeof rawTodo === "object" ? rawTodo : {}; // tolerate null/garbage entries
  const subject = (todo.title || "").trim();
  const detail = (todo.text || "").trim();
  const time = formatTodoTime(todo);

  return (
    <div className={"task-item has-subject-color" + (todo.done ? " done" : "")} style={{ "--task-color": color }}>
      <input
        type="checkbox"
        className="todo-check"
        checked={!!todo.done}
        onChange={(event) => toggleTodo(index, event.target.checked)}
        aria-label={subject || detail || "مهمة"}
      />
      <div className="home-task-content">
        <div className="home-task-top">
          <span className={"home-task-subject" + (subject ? "" : " home-task-subject--fallback")}>
            <span className="home-task-color-dot" style={{ background: color }}></span>
            {subject || "مهمة"}
          </span>
        </div>
        <div className="home-task-bottom">
          <span className={"home-task-detail" + (detail ? "" : " home-task-detail--empty")}>{detail || "مهمة بدون تفاصيل"}</span>
          <span className="home-task-time">{time ? " · " + time : ""}</span>
        </div>
      </div>
      <button type="button" className="todo-delete" title="حذف" onClick={() => deleteTodo(index)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
        </svg>
      </button>
    </div>
  );
}
