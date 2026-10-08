import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { CURRENCY } from "../../../config/paymentConfig.js";
import { useDialog } from "../../../hooks/useDialog.js";
import TopUpMethodView, { METHOD_VIEWS, TopUpChooserView } from "../payment/TopUpMethodView.jsx";
import { useCourseAccess } from "../../../features/payments/courseAccess.js";
import { PURCHASE_STATUS, REVIEW_STATUSES } from "../../../services/paymentService.js";
import { getCourse } from "../../../data/courses.js";
import { getSubjectBranches } from "../../../data/library.js";
import { getProfessor } from "../../../data/professors.js";
import ProfessorAvatar from "../professors/ProfessorAvatar.jsx";
import { CourseContentSummary } from "./CourseContent.jsx";

// Course details + subscription confirmation, centered over the Courses page
// when the student opens a course they have not bought. A sheet in the style of
// the payment pages: title, then the confirmation, the
// professor, the description, the final price and the شعب the course is for. Everything
// comes from the course data (description, professorId → data/professors.js,
// branches — or, when a course lists none, its subject's شعب from the Library)
// and paymentService (price). «اشحن رصيدك» switches the same window to
// «شحن المحفظة» (TopUpMethods); each method there opens its screen in the
// same window (CcpTopUp, SlickPayTopUp, BaridiMobTopUp). «إلغاء» only closes. The sheet carries the course's
// legacy .diff-* class, so its accent is the same colour as the course card.
//
//   course  — the course (from data/courses.js)
//   price   — its Price from paymentService, or null while unknown
// The unit's purchase status (courseAccess) shapes the confirmation: under
// review → the request is being checked, follow it in «محفظتي» (no second
// request); rejected → say so, the student can pay again.
//   from    — where «رجوع» on the next page returns to (kept for callers)
//   method  — a payment method already chosen in «محفظتي»: the window opens
//             on its screen, and the method list is never shown
export default function CourseDetailsModal({ course, price, method: preset = null, onClose }) {
  const navigate = useNavigate();
  const { accessStatus } = useCourseAccess(course.id);
  const inReview = REVIEW_STATUSES.includes(accessStatus);
  const rejected = accessStatus === PURCHASE_STATUS.REJECTED;
  const primaryRef = useRef(null);
  const chosen = METHOD_VIEWS[preset] && !inReview ? preset : null;
  const [view, setView] = useState(chosen || "details"); // "details" | "topup" | a METHOD_VIEWS key
  const methodView = METHOD_VIEWS[view];
  const professor = course.professorId ? getProfessor(course.professorId) : null;
  const subjectKey = course.subjectKey ?? getCourse(course.id)?.subjectKey;
  const branches = course.branches?.length ? course.branches : getSubjectBranches(subjectKey);

  // Escape closes, the page behind does not scroll; focus the main action.
  useDialog(onClose);
  useEffect(() => {
    const focusId = setTimeout(() => primaryRef.current?.focus(), 30);
    return () => clearTimeout(focusId);
  }, []);

  return createPortal(
    <div
      className="course-modal"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={"course-modal-card " + (course.accent || "") + (methodView ? " is-wide" : "")} role="dialog" aria-modal="true" aria-labelledby="courseModalTitle">
        {methodView ? (
          <TopUpMethodView method={view} course={course} price={price} onBack={() => setView(chosen ? "details" : "topup")} onClose={onClose} />
        ) : view === "topup" ? (
          <TopUpChooserView onChoose={(method) => METHOD_VIEWS[method] && setView(method)} onClose={onClose} />
        ) : (
        <div className="course-modal-main" key="details">
          <header className="course-modal-head">
            <div className="min-w-0">
              <h2 className="course-modal-title" id="courseModalTitle">{course.title}</h2>
              <p className="course-modal-sub">تأكيد الاشتراك في الدورة</p>
            </div>
            <button type="button" className="course-modal-close" aria-label="إغلاق" onClick={onClose}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div className="course-modal-body">
            <div className="course-modal-confirm">
              <svg className="course-modal-confirm-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              {inReview ? (
                <div>
                  <div className="course-modal-confirm-title">طلب اشتراكك في هذه الدورة قيد المراجعة</div>
                  <div className="course-modal-confirm-text">ستُفتح الدورة ومحتواها فور تأكيد الدفع من طرف فريق Yak Academy.</div>
                </div>
              ) : (
                <div>
                  <div className="course-modal-confirm-title">هل ترغب في الانضمام إلى هذه الدورة؟</div>
                  <div className="course-modal-confirm-text">
                    {rejected ? "لم يتم تأكيد طلبك السابق. يمكنك إعادة الدفع لتفعيل الدورة." : "أكد اشتراكك وابدأ رحلتك التعليمية مع Yak Academy."}
                  </div>
                </div>
              )}
            </div>

            {professor && (
              <div className="course-modal-prof">
                {professor.photo ? (
                  <ProfessorAvatar professor={professor} size={18} />
                ) : (
                  <span className="course-modal-prof-icon" aria-hidden="true">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21a8 8 0 0 1 16 0" />
                    </svg>
                  </span>
                )}
                <span className="course-modal-text">{professor.name}</span>
              </div>
            )}

            <div>
              <div className="course-modal-text course-modal-label">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8" />
                </svg>
                وصف
              </div>
              <p className="course-modal-desc">{course.description || "بلا وصف"}</p>
            </div>

            {price && (
              <div className="course-modal-price">
                <span className="course-modal-price-label">
                  <span className="course-modal-price-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="2.5" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                  </span>
                  السعر النهائي
                </span>
                <span className="course-modal-price-value">
                  <strong>{price.amount}</strong>
                  <span className="course-modal-price-currency">{CURRENCY.label}</span>
                </span>
              </div>
            )}

            <CourseContentSummary courseId={course.id} />

            {branches.length > 0 && (
              <div>
                <div className="course-modal-text course-modal-label">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="m8 12 3 3 5-6" />
                  </svg>
                  الأقسام المعنية بهذه الدورة
                </div>
                <div className="course-modal-chips">
                  {branches.map((branch) => (
                    <span key={branch} className="course-modal-chip">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m8 12 3 3 5-6" />
                      </svg>
                      {branch}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <footer className="course-modal-actions">
            <button type="button" className="course-modal-btn is-secondary" onClick={onClose}>
              إلغاء
            </button>
            <button
              ref={primaryRef}
              type="button"
              className="course-modal-btn is-primary"
              onClick={() => (inReview ? navigate("/dashboard/wallet") : setView(chosen || "topup"))}
            >
              {inReview ? "متابعة طلباتي" : "اشحن رصيدك"}
            </button>
          </footer>
        </div>
        )}
      </div>
    </div>,
    document.body
  );
}
