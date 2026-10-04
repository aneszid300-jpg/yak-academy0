import { useState } from "react";
import { resolveTaskColor } from "../../features/todos/subjectColors.js";
import { useSubjectColors, useTodos } from "../../features/todos/store.js";
import { useSubjectSetupPrompt } from "../../features/todos/useSubjectSetupPrompt.js";
import StickyNote from "../../components/dashboard/todos/StickyNote.jsx";
import TodoAddModal from "../../components/dashboard/todos/TodoAddModal.jsx";
import SubjectColorsModal from "../../components/dashboard/todos/SubjectColorsModal.jsx";
import FocusPanel from "../../components/dashboard/todos/focus/FocusPanel.jsx";

// مهام اليوم — migrated from legacy/dashboard.html #page-todos.
// Same tasks as the Home preview (localStorage `yak_todos`, shared store).
// «تركيز» (focus sessions) lives in components/dashboard/todos/focus; its
// timer keeps running while the other tab or another page is open (legacy).

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
// Legacy getArabicDate(): «الإثنين · 28 / 9»
function arabicDate(now = new Date()) {
  return DAYS[now.getDay()] + " · " + now.getDate() + " / " + (now.getMonth() + 1);
}

const TABS = [
  {
    key: "tasks",
    label: "مهامي",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3"></rect>
        <path d="m8 12 2.5 2.5L16.5 8.5"></path>
      </>
    ),
  },
  {
    key: "focus",
    label: "تركيز",
    icon: (
      <>
        <circle cx="12" cy="12" r="8"></circle>
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 2v3M22 12h-3M12 22v-3M2 12h3"></path>
      </>
    ),
  },
];

const STATS = [
  { label: "مكتملة", key: "done", icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></> },
  { label: "قيد التنفيذ", key: "left", icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> },
  { label: "إجمالي المهام", key: "total", icon: <><path d="M22 10v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7" /><path d="m16 2 4 4-8 8H8v-4z" /></> },
];

// Legacy kept the page in the DOM, so the open tab survived leaving and
// coming back. Remember it for the session (not persisted).
let lastTab = "tasks";

export default function Todos() {
  const todos = useTodos();
  const colorMap = useSubjectColors();
  const [tab, setTabState] = useState(() => lastTab);
  const setTab = (next) => {
    lastTab = next;
    setTabState(next);
  };
  const [adding, setAdding] = useState(false);
  const [colorsOpen, setColorsOpen] = useSubjectSetupPrompt();

  const left = todos.filter((t) => !t?.done).length; // tolerate null entries
  const counts = { done: todos.length - left, left, total: todos.length };

  return (
    <section className="todos-page">
      <div className="todos-page-wrap">
        <header className="page-toolbar todos-page-toolbar" role="toolbar" aria-label="التنقل بين المهام والتركيز">
          <div className="search-bar todos-toolbar-search">
            <input type="text" placeholder="ابحث عن درس، مادة أو موضوع..." aria-label="البحث" />
          </div>
          <div className="page-toolbar-actions todos-toolbar-actions" role="tablist" aria-label="مهام وتركيز">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                className={"courses-filter-btn" + (tab === item.key ? " active" : "")}
                aria-selected={tab === item.key}
                aria-controls={item.key === "tasks" ? "todosUxTasksPanel" : "todosUxFocusPanel"}
                onClick={() => setTab(item.key)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  {item.icon}
                </svg>
                {item.label}
              </button>
            ))}
          </div>
        </header>

        <div className="todos-main-panel">
          <div className="todos-hero-row">
            <div className="todos-hero-title-block">
              <div className="todos-hero-title-line">
                <h1 className="todos-hero-title">مهام اليوم</h1>
              </div>
              <p className="todos-hero-sub">نظّم يومك وحقّق أهدافك خطوة بخطوة</p>
            </div>
            <div className="todos-date-chip">
              <div className="todos-date-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <div>
                <div className="todos-date-day">{arabicDate()}</div>
                <div className="todos-date-sub">{left} حصص متبقية</div>
              </div>
            </div>
          </div>

          <div className="todos-ux-panel todos-task-panel" id="todosUxTasksPanel" role="tabpanel" hidden={tab !== "tasks"}>
            <div className="todos-stats-row">
              {STATS.map((stat) => (
                <div key={stat.key} className="todos-stat-card">
                  <div className="todos-stat-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      {stat.icon}
                    </svg>
                  </div>
                  <div className="todos-stat-text">
                    <span className="todos-stat-label">{stat.label}</span>
                    <span className="todos-stat-value">{counts[stat.key]}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="todos-board-card">
              <div className="todos-board-header">
                <span className="todos-board-title">خطة اليوم</span>
                <button type="button" className="subject-colors-edit-btn" title="تخصيص ألوان المواد" onClick={() => setColorsOpen(true)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="7.5" cy="12" r="2.6" fill="currentColor" stroke="none" opacity="0.35" />
                    <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" opacity="0.6" />
                    <circle cx="16.5" cy="12" r="2.6" fill="currentColor" stroke="none" opacity="0.9" />
                  </svg>
                  ألوان المواد
                </button>
              </div>

              <div className="sticky-board">
                {todos.length === 0 ? (
                  <div className="todo-empty" style={{ gridColumn: "1 / -1" }}>ما كاش مهام اليوم — أضف أول مهمة ✍️</div>
                ) : (
                  todos.map((todo, index) => <StickyNote key={index} todo={todo} index={index} color={resolveTaskColor(todo, colorMap)} />)
                )}
              </div>

              <div className="todos-add-form todos-add-form--launcher">
                <div className="todos-add-form-copy">
                  <strong>عندك مهمة جديدة؟</strong>
                  <span>اختار المادة، ثم أضف تفاصيل المهمة. اللون يتحدد تلقائياً حسب مادةك.</span>
                </div>
                <button type="button" className="todos-add-btn todos-open-add-modal" onClick={() => setAdding(true)}>
                  <span>إضافة مهمة</span>
                  <span className="todos-add-plus"></span>
                </button>
              </div>
            </div>
          </div>

          <div className="todos-ux-panel todos-focus-panel" id="todosUxFocusPanel" role="tabpanel" hidden={tab !== "focus"}>
            <FocusPanel />
          </div>
        </div>
      </div>

      {adding && <TodoAddModal onClose={() => setAdding(false)} />}
      {colorsOpen && <SubjectColorsModal onClose={() => setColorsOpen(false)} />}
    </section>
  );
}
