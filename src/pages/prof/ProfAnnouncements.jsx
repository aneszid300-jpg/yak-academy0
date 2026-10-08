import { useState } from "react";
import { useMyProfessor } from "../../features/prof/useMyProfessor.js";
import { ANNOUNCEMENT_MAX, announcementsFor, courseStats, createAnnouncement, deleteAnnouncement, isMockClass } from "../../services/classService.js";
import { formatPayDate } from "../../components/dashboard/payment/messages.js";
import { Empty } from "../../components/prof/ProfParts.jsx";

// الإعلانات — /prof/announcements. The professor writes a short message to the
// students of one course (or all their courses); it reaches their bell 🔔
// (NotificationsBell). The sent announcements below, with «حذف».

const ALL = "__all__";

export default function ProfAnnouncements() {
  const { contents } = useMyProfessor();
  const courseIds = contents.map(({ course }) => course.id);
  const [courseId, setCourseId] = useState(contents.length === 1 ? courseIds[0] : "");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null); // { ok, text }

  const sent = announcementsFor(courseIds);
  const titleOf = (id) => contents.find((c) => c.course.id === id)?.course.title || "";
  const reach = (ids) => {
    const n = ids.reduce((t, id) => t + (courseStats(id)?.enrolled ?? 0), 0);
    return courseStats(ids[0]) == null ? null : n;
  };

  async function send(event) {
    event.preventDefault();
    if (!courseId) return setNote({ ok: false, text: "اختر الدورة." });
    if (!text.trim()) return setNote({ ok: false, text: "اكتب نص الإعلان." });
    setBusy(true);
    setNote(null);
    try {
      const targets = courseId === ALL ? courseIds : [courseId];
      for (const id of targets) await createAnnouncement({ courseId: id, text });
      const n = reach(targets);
      setText("");
      setNote({ ok: true, text: n == null ? "تم إرسال الإعلان." : `تم إرسال الإعلان إلى ${n} طالب.` });
    } catch (error) {
      setNote({ ok: false, text: error?.code === "unavailable" ? "الإعلانات تتوفر عند ربط الخادم." : "تعذر إرسال الإعلان. حاول مرة أخرى." });
    } finally {
      setBusy(false);
    }
  }

  async function remove(a) {
    if (!window.confirm("حذف هذا الإعلان؟ سيختفي من إشعارات الطلاب.")) return;
    await deleteAnnouncement(a.id);
  }

  return (
    <section className="pd-page">
      <div className="pd-page-head">
        <h1>الإعلانات {isMockClass && <span className="pd-badge is-test">وضع تجريبي</span>}</h1>
        <p>رسالة قصيرة لطلاب دورتك، تصلهم في الإشعارات 🔔.</p>
      </div>

      <form className="pd-card pd-form" onSubmit={send} noValidate>
        <div className="pd-field">
          <label className="pd-label" htmlFor="anCourse">
            إلى طلاب
          </label>
          <select id="anCourse" className="pd-select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">— اختر الدورة —</option>
            {contents.length > 1 && <option value={ALL}>كل دوراتي</option>}
            {contents.map(({ course }) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        <div className="pd-field">
          <label className="pd-label" htmlFor="anText">
            نص الإعلان
          </label>
          <textarea
            id="anText"
            className="pd-select pd-textarea"
            rows={3}
            maxLength={ANNOUNCEMENT_MAX}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="مثال: جلسة الغد تتأخر ساعة، تبدأ على الساعة 21:00."
          />
          <span className="pd-muted pd-counter">
            {text.length} / {ANNOUNCEMENT_MAX}
          </span>
        </div>
        {note && (
          <p className={note.ok ? "pd-success" : "pd-error"} role={note.ok ? "status" : "alert"}>
            {note.text}
          </p>
        )}
        <div className="pd-form-actions">
          <button type="submit" className="pd-btn pd-btn-primary" disabled={busy}>
            {busy ? "جاري الإرسال..." : "إرسال الإعلان"}
          </button>
        </div>
      </form>

      <section className="pd-card" aria-labelledby="anSent">
        <div className="pd-card-head">
          <h2 id="anSent" className="pd-card-title">الإعلانات المرسلة</h2>
          <span className="pd-muted">{sent.length}</span>
        </div>
        {sent.length ? (
          <ul className="pd-announcements">
            {sent.map((a) => (
              <li key={a.id}>
                <div className="pd-announcement-head">
                  <b>{titleOf(a.courseId)}</b>
                  <span className="pd-muted">{formatPayDate(a.createdAt)}</span>
                  <button type="button" className="pd-icon-btn" onClick={() => remove(a)} aria-label="حذف الإعلان" title="حذف">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </button>
                </div>
                <p>{a.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>لم ترسل أي إعلان بعد.</Empty>
        )}
      </section>
    </section>
  );
}
