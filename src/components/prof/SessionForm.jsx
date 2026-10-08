import { useState } from "react";
import { createSession } from "../../services/classService.js";
import { isoDay } from "../../features/prof/schedule.js";
import { LIVE_CATEGORIES } from "../../config/contentConfig.js";

// «برمجة جلسة» — the professor schedules a Live session for one of their
// courses: title, course, category (حصة عادية · مراجعة · حصة أسئلة وأجوبة ·
// تمارين), day, time, the
// Zoom link (optional, can come later) and a short description. Saved through
// classService; the students of that course see it on their Home and in the
// course's content.

const EMPTY = { title: "", courseId: "", kind: LIVE_CATEGORIES[0].label, date: "", startsAt: "", endsAt: "", joinUrl: "", description: "" };

function errorsOf(f) {
  const e = {};
  if (!f.title.trim()) e.title = "اكتب عنوان الجلسة.";
  if (!f.courseId) e.courseId = "اختر الدورة.";
  if (!f.date) e.date = "اختر اليوم.";
  else if (f.date < isoDay(new Date())) e.date = "اختر يومًا قادمًا.";
  if (!f.startsAt) e.startsAt = "اختر وقت البداية.";
  if (!f.endsAt) e.endsAt = "اختر وقت النهاية.";
  else if (f.startsAt && f.endsAt <= f.startsAt) e.endsAt = "النهاية يجب أن تكون بعد البداية.";
  if (f.joinUrl.trim() && !/^https:\/\/\S+$/i.test(f.joinUrl.trim())) e.joinUrl = "رابط Zoom يبدأ بـ https://";
  return e;
}

export default function SessionForm({ contents, onDone, onCancel, initialDate = "" }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, date: initialDate, courseId: contents.length === 1 ? contents[0].course.id : "" }));
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(null);
  const errors = touched ? errorsOf(form) : {};
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(event) {
    event.preventDefault();
    setTouched(true);
    if (Object.keys(errorsOf(form)).length) return;
    setBusy(true);
    setFailed(null);
    try {
      const course = contents.find((c) => c.course.id === form.courseId)?.course;
      await createSession({ ...form, title: form.title.trim(), joinUrl: form.joinUrl.trim(), description: form.description.trim(), subjectKey: course?.subjectKey });
      onDone(form.title.trim());
    } catch (error) {
      setFailed(error?.code === "unavailable" ? "برمجة الجلسات تتوفر عند ربط الخادم." : "تعذر حفظ الجلسة. حاول مرة أخرى.");
      setBusy(false);
    }
  }

  const field = (key, label, input) => (
    <div className={"pd-field" + (errors[key] ? " has-error" : "")}>
      <label className="pd-label" htmlFor={`sf-${key}`}>
        {label}
      </label>
      {input}
      {errors[key] && <span className="pd-field-error">{errors[key]}</span>}
    </div>
  );

  return (
    <form className="pd-card pd-form" onSubmit={submit} noValidate>
      <div className="pd-card-head">
        <h2 className="pd-card-title">برمجة جلسة جديدة</h2>
      </div>
      <div className="pd-field">
        <span className="pd-label" id="sf-kind">نوع الجلسة</span>
        <div className="pd-cats" role="radiogroup" aria-labelledby="sf-kind">
          {LIVE_CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              role="radio"
              aria-checked={form.kind === c.label}
              className={"pd-cat is-" + c.tone + (form.kind === c.label ? " is-selected" : "")}
              onClick={() => setForm((f) => ({ ...f, kind: c.label }))}
            >
              <span className="pd-cat-dot" aria-hidden="true" />
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="pd-form-grid">
        {field("title", "عنوان الجلسة", <input id="sf-title" className="pd-select" value={form.title} onChange={set("title")} placeholder="مثال: مراجعة الكهرباء الساكنة" maxLength={90} />)}
        {field(
          "courseId",
          "الدورة",
          <select id="sf-courseId" className="pd-select" value={form.courseId} onChange={set("courseId")}>
            <option value="">— اختر الدورة —</option>
            {contents.map(({ course }) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        )}
        {field("date", "اليوم", <input id="sf-date" type="date" className="pd-select" value={form.date} min={isoDay(new Date())} onChange={set("date")} />)}
        {field("startsAt", "من الساعة", <input id="sf-startsAt" type="time" className="pd-select" value={form.startsAt} onChange={set("startsAt")} />)}
        {field("endsAt", "إلى الساعة", <input id="sf-endsAt" type="time" className="pd-select" value={form.endsAt} onChange={set("endsAt")} />)}
      </div>
      {field("joinUrl", "رابط Zoom (اختياري، يمكن إضافته لاحقًا)", <input id="sf-joinUrl" dir="ltr" className="pd-select" value={form.joinUrl} onChange={set("joinUrl")} placeholder="https://zoom.us/j/..." />)}
      {field("description", "وصف قصير (اختياري)", <textarea id="sf-description" className="pd-select pd-textarea" value={form.description} onChange={set("description")} maxLength={300} rows={2} />)}
      {failed && (
        <p className="pd-error" role="alert">
          {failed}
        </p>
      )}
      <div className="pd-form-actions">
        <button type="button" className="pd-btn pd-btn-ghost" onClick={onCancel} disabled={busy}>
          إلغاء
        </button>
        <button type="submit" className="pd-btn pd-btn-primary" disabled={busy}>
          {busy ? "جاري الحفظ..." : "حفظ الجلسة"}
        </button>
      </div>
    </form>
  );
}
