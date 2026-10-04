import { setFocusView, useFocusState } from "../../../../features/focus/store.js";
import FocusDayView from "./FocusDayView.jsx";
import { FocusMonthPanel, FocusWeekPanel } from "./FocusCalendars.jsx";

const VIEWS = [
  { key: "day", label: "اليوم" },
  { key: "week", label: "الأسبوع" },
  { key: "month", label: "الشهر" },
];

// «تركيز» tab — legacy #todosProgressCard: «جلسة التركيز» with day / week /
// month views. The timer itself lives in features/focus/store.js.
export default function FocusPanel() {
  const { view } = useFocusState();
  return (
    <div className="todos-progress-panel" id="todosProgressCard">
      <div className="focus-head">
        <span className="focus-head-title">جلسة التركيز</span>
        <div className="focus-view-tabs" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {VIEWS.map((v) => (
            <button key={v.key} type="button" className={"focus-view-toggle" + (view === v.key ? " active" : "")} aria-pressed={view === v.key} onClick={() => setFocusView(v.key)}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <FocusMonthPanel show={view === "month"} />
      <FocusWeekPanel show={view === "week"} />
      {view === "day" && <FocusDayView />}
    </div>
  );
}

