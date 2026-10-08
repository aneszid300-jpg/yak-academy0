import { useState } from "react";
import { ALL_COURSES } from "../../data/courses.js";
import { useCoursesAccess } from "../../features/payments/courseAccess.js";
import { devTools, PURCHASE_STATUS as S, REVIEW_STATUSES } from "../../services/paymentService.js";

// منح الوصول (تجريبي) — /dashboard/access. TEMPORARY, for testing only, until
// the admin dashboard exists: there, the Yak team approves payments and grants
// courses through the backend. Here it runs on the development mock's own
// tools (paymentService.devTools) and acts on the signed-in account only —
// the mock keeps its data in this browser tab. With the real backend
// (devTools is null) the page grants nothing and says so.

const CHIPS = {
  dev: { label: "مفتوحة للتطوير · غير مسجل", tone: "is-dev" },
  owned: { label: "يملكها", tone: "is-ok" },
  review: { label: "قيد المراجعة", tone: "is-wait" },
  pending: { label: "في انتظار الدفع", tone: "is-wait" },
  rejected: { label: "مرفوض", tone: "is-bad" },
  none: { label: "غير مملوكة", tone: "" },
};

function stateOf(access) {
  if (access?.hasAccess) return access.purchase ? "owned" : "dev"; // dev: open for development, not registered
  if (REVIEW_STATUSES.includes(access?.status)) return "review";
  if (access?.status === S.PENDING) return "pending";
  if (access?.status === S.REJECTED) return "rejected";
  return "none";
}

export default function AccessTest() {
  const { status, access } = useCoursesAccess();
  const [busy, setBusy] = useState(null);

  async function run(id, action) {
    setBusy(id);
    try {
      await action();
    } finally {
      setBusy(null);
    }
  }

  if (!devTools) {
    return (
      <section className="ax-page">
        <div className="section-card">
          <div className="section-title">منح الوصول</div>
          <p className="ax-note">يتم منح الوصول إلى الدورات من لوحة الإدارة عبر الخادم. هذه الصفحة تعمل في وضع التجربة فقط.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="ax-page">
      <div className="section-card">
        <div className="ax-head">
          <div>
            <div className="section-title">منح الوصول (تجريبي)</div>
            <p className="ax-note">
              صفحة مؤقتة للتجربة إلى أن تجهز لوحة الإدارة. تعمل على الحساب المسجَّل حاليًا فقط، وتُنسى عند إغلاق التبويب.
            </p>
          </div>
          <button type="button" className="btn-outline ax-reset" onClick={() => run("reset", devTools.reset)} disabled={busy !== null}>
            إعادة تعيين الكل
          </button>
        </div>

        {status !== "ready" ? (
          <p className="ax-note">جاري التحميل...</p>
        ) : (
          <ul className="ax-list">
            {ALL_COURSES.map((course) => {
              const a = access[course.id];
              const st = stateOf(a);
              const chip = CHIPS[st];
              const isBusy = busy === course.id;
              return (
                <li key={course.id}>
                  <span className="ax-img" style={{ backgroundImage: `url(${course.image})` }} aria-hidden="true" />
                  <span className="ax-info">
                    <b>{course.title}</b>
                    <small>
                      {course.subject} · {course.unit}
                    </small>
                  </span>
                  <span className={"ax-chip " + chip.tone}>{chip.label}</span>
                  <span className="ax-actions">
                    {st === "review" && (
                      <>
                        <button type="button" className="btn-violet ax-btn" disabled={isBusy} onClick={() => run(course.id, () => devTools.review(a.purchase.id, "approved"))}>
                          قبول الدفع
                        </button>
                        <button type="button" className="btn-outline ax-btn is-danger" disabled={isBusy} onClick={() => run(course.id, () => devTools.review(a.purchase.id, "rejected"))}>
                          رفض
                        </button>
                      </>
                    )}
                    {(st === "none" || st === "pending" || st === "rejected" || st === "dev") && (
                      <button type="button" className="btn-violet ax-btn" disabled={isBusy} onClick={() => run(course.id, () => devTools.grant(course.id))}>
                        منح الوصول
                      </button>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
