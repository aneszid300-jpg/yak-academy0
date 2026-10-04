import { useState } from "react";
import { createPortal } from "react-dom";
import { SUBJECT_PALETTE, YAK_SUBJECTS, defaultColorForSubjectIndex, normalizeSubjectKey } from "../../../features/todos/subjectColors.js";
import { markSubjectSetupDone, setSubjectColor, useSubjectColors } from "../../../features/todos/store.js";

// «ثبّت ألوان موادك» — legacy #subjectColorsSetup. Opens once on the first
// dashboard visit; both × and «حفظ» mark the setup as done.
export default function SubjectColorsModal({ onClose }) {
  const colorMap = useSubjectColors();
  const [openSubject, setOpenSubject] = useState(null);

  function close() {
    markSubjectSetupDone();
    onClose();
  }

  // Clicking anywhere except the «تغيير اللون» button or a palette closes the open palette.
  function handleClick(event) {
    if (event.target.closest(".subject-color-change, .subject-color-palette")) return;
    setOpenSubject(null);
  }

  return createPortal(
    <div className="subject-colors-setup" onClick={handleClick}>
      <div className="subject-colors-modal" role="dialog" aria-modal="true" aria-labelledby="subjectColorsTitle">
        <div className="subject-colors-head">
          <div>
            <div className="subject-colors-kicker">ياك · تخصيص المواد</div>
            <h2 className="subject-colors-title" id="subjectColorsTitle">ثبّت ألوان موادك</h2>
            <p className="subject-colors-sub">اختار لون لكل مادة مرة واحدة. سيُستخدم تلقائياً في المهام والتركيز والإحصائيات.</p>
          </div>
          <button type="button" className="subject-colors-close" aria-label="إغلاق" onClick={close}>
            ×
          </button>
        </div>

        <div className="subject-colors-grid">
          {YAK_SUBJECTS.map((subject, i) => {
            const current = colorMap[normalizeSubjectKey(subject.name)] || defaultColorForSubjectIndex(i);
            const isOpen = openSubject === subject.name;
            return (
              <div key={subject.key} className={"subject-color-item" + (isOpen ? " is-open" : "")}>
                <div className="subject-color-row">
                  <div className="subject-color-left">
                    <span className="subject-color-swatch" style={{ background: current }}></span>
                    <span className="subject-color-name">{subject.name}</span>
                  </div>
                  <button
                    type="button"
                    className="subject-color-change"
                    aria-expanded={isOpen}
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenSubject(isOpen ? null : subject.name);
                    }}
                  >
                    تغيير اللون
                  </button>
                </div>
                <div className="subject-color-palette">
                  {SUBJECT_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={"subject-color-option" + (color.toLowerCase() === current.toLowerCase() ? " active" : "")}
                      style={{ background: color }}
                      aria-label={`${subject.name} ${color}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSubjectColor(subject.name, color);
                        setOpenSubject(null);
                      }}
                    ></button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="subject-colors-footer">
          <div className="subject-colors-note">
            تقدر تبدّل الألوان لاحقاً من «ألوان المواد». ما تحتاجش تختار اللون عند إضافة كل مهمة.
          </div>
          <button type="button" className="subject-colors-save" onClick={close}>
            حفظ ألوان المواد
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
