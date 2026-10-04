import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { YAK_SUBJECTS, colorForSubject } from "../../../features/todos/subjectColors.js";
import { addTodo, useSubjectColors } from "../../../features/todos/store.js";

// «أضف مهمة اليوم» — legacy #todoAddModal. Pick a subject first, then write
// the task; its colour always comes from the subject.
export default function TodoAddModal({ onClose }) {
  const colorMap = useSubjectColors();
  const [subject, setSubject] = useState(null);
  const [detail, setDetail] = useState("");
  const firstOptionRef = useRef(null);
  const detailRef = useRef(null);

  // Legacy focuses the first subject when the modal opens.
  useEffect(() => {
    const id = setTimeout(() => firstOptionRef.current?.focus(), 30);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function selectSubject(next) {
    setSubject(next);
    setTimeout(() => detailRef.current?.focus(), 20);
  }

  function confirm() {
    if (!subject) return;
    const text = detail.trim();
    if (!text) {
      detailRef.current?.focus();
      return;
    }
    addTodo(subject, text);
    onClose();
  }

  return createPortal(
    <div
      className="todo-add-modal"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="todo-add-modal-card" role="dialog" aria-modal="true" aria-labelledby="todoAddModalTitle">
        <div className="todo-add-modal-head">
          <div>
            <div className="todo-add-modal-kicker">ياك · مهمة جديدة</div>
            <h2 className="todo-add-modal-title" id="todoAddModalTitle">أضف مهمة اليوم</h2>
            <p className="todo-add-modal-sub">اختار المادة أولاً. لونها ثابت وسيظهر تلقائياً في خطة اليوم والتركيز والإحصائيات.</p>
          </div>
          <button type="button" className="todo-add-modal-close" aria-label="إغلاق" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="todo-add-subject-label">المادة</div>
        <div className="todo-add-subject-grid">
          {YAK_SUBJECTS.map((option, i) => (
            <button
              key={option.key}
              ref={i === 0 ? firstOptionRef : undefined}
              type="button"
              className={"todo-add-subject-option" + (subject?.key === option.key ? " active" : "")}
              onClick={() => selectSubject(option)}
            >
              <span className="todo-add-subject-dot" style={{ background: colorForSubject(option.name, colorMap) }}></span>
              <span className="todo-add-subject-name">{option.name}</span>
            </button>
          ))}
        </div>

        {subject && (
          <>
            <div className="todo-add-selected">
              <span className="todo-add-selected-dot" style={{ background: colorForSubject(subject.name, colorMap) }}></span>
              <span>{subject.name}</span>
            </div>

            <div className="todo-add-details">
              <label htmlFor="todoQuickDetail">تفاصيل المهمة</label>
              <textarea
                ref={detailRef}
                id="todoQuickDetail"
                rows={3}
                maxLength={120}
                placeholder="مثال: حل تمارين التكامل 1 إلى 5..."
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
              ></textarea>
              <div className="todo-add-modal-footer">
                <span className="todo-add-color-hint">سيُستخدم لون المادة تلقائياً</span>
                <button type="button" className="subject-colors-save todo-add-confirm" onClick={confirm}>
                  إضافة المهمة
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
