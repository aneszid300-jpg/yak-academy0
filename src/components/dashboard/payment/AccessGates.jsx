import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { getCourse } from "../../../data/courses.js";
import { getAiDeck } from "../../../data/ai.js";
import { useCourseAccess } from "../../../features/payments/courseAccess.js";
import { REVIEW_STATUSES } from "../../../services/paymentService.js";
import { StatusCard } from "./PaymentStatus.jsx";
import { BackIcon } from "./icons.jsx";
import { paymentErrorMessage } from "./messages.js";

// Route guards for paid content. They decide what the student SEES; real
// protection of lesson videos and flashcards must also exist on the server.
//
//   <RequireCourseAccess>  study/:courseId(/:lessonId) — no access → payment page
//   <RequireDeckAccess>    flash/:deckId — the deck's unit decides; no access →
//                          explain that the cards come with the unit

function Checking() {
  return (
    <section className="payment-page">
      <div className="section-card payment-checking" role="status" data-state="checking-access">
        <span className="payment-spinner" aria-hidden="true"></span>
        جاري التحقق من اشتراكك...
      </div>
    </section>
  );
}

function AccessError({ error, onRetry }) {
  return (
    <section className="payment-page">
      <StatusCard
        tone="bad"
        icon="alert"
        title="تعذر التحقق من اشتراكك"
        text={paymentErrorMessage(error)}
        actions={
          <>
            <button type="button" className="btn-violet payment-btn" onClick={onRetry}>إعادة المحاولة</button>
            <Link to="/dashboard/courses" className="btn-outline payment-btn">العودة إلى الدورات</Link>
          </>
        }
        testId="access-error"
      />
    </section>
  );
}

export function RequireCourseAccess({ children }) {
  const { courseId } = useParams();
  const location = useLocation();
  const course = getCourse(courseId);
  const access = useCourseAccess(courseId);

  if (!course) return children; // the study page shows «الدورة غير موجودة»
  if (access.status === "error") return <AccessError error={access.error} onRetry={access.reload} />;
  if (access.status !== "ready") return <Checking />;
  if (access.hasAccess) return children;
  return <Navigate to={`/dashboard/payment/course/${course.id}`} replace state={{ from: location.state?.from }} />;
}

export function RequireDeckAccess({ children }) {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const deck = getAiDeck(deckId);
  const course = deck?.courseId ? getCourse(deck.courseId) : null;
  const access = useCourseAccess(course?.id);

  if (!deck) return children; // the flashcards page shows «المجموعة غير موجودة»
  if (course && access.status === "error") return <AccessError error={access.error} onRetry={access.reload} />;
  if (course && access.status !== "ready") return <Checking />;
  if (course && access.hasAccess) return children;

  const from = location.state?.from || "/dashboard/ai";
  const toAi = (
    <button type="button" className="btn-outline payment-btn" onClick={() => navigate(from)}>العودة إلى باك AI</button>
  );
  let card;
  if (!course) {
    card = (
      <StatusCard
        icon="lock"
        title={`بطاقات «${deck.title}» غير متاحة بعد`}
        text="بطاقات المراجعة تأتي مع الوحدات ولا تُباع منفصلة، وهذه البطاقات ستتوفر ضمن وحدتها قريباً."
        actions={
          <>
            <Link to="/dashboard/courses" className="btn-violet payment-btn">تصفح الوحدات</Link>
            {toAi}
          </>
        }
        testId="deck-unavailable"
      />
    );
  } else if (REVIEW_STATUSES.includes(access.accessStatus)) {
    card = (
      <StatusCard
        tone="wait"
        title={`طلب اشتراكك في وحدة «${course.title}» قيد المراجعة`}
        text="ستتمكن من استعمال هذه البطاقات فور تأكيد الدفع من طرف فريق Yak Academy."
        chip={{ tone: "wait", label: "قيد المراجعة" }}
        actions={
          <>
            <Link to={`/dashboard/payment/course/${course.id}`} state={{ from }} className="btn-violet payment-btn">عرض حالة الطلب</Link>
            {toAi}
          </>
        }
        testId="deck-review"
      />
    );
  } else {
    card = (
      <StatusCard
        icon="lock"
        title="هذه البطاقات متاحة بعد الاشتراك في الوحدة"
        text={`بطاقات «${deck.title}» جزء من وحدة «${course.title}»، مع دروسها المسجلة وحصصها المباشرة. اشترِ الوحدة لتفتحها كلها.`}
        actions={
          <>
            <Link to={`/dashboard/payment/course/${course.id}`} state={{ from }} className="btn-violet payment-btn">
              شراء الوحدة
            </Link>
            {toAi}
          </>
        }
        testId="deck-locked"
      />
    );
  }

  return (
    <section className="payment-page">
      <div className="viewer-page-wrap">
        <div className="viewer-topbar">
          <button type="button" className="viewer-back-btn" onClick={() => navigate(from)}>
            <BackIcon />
            رجوع
          </button>
          <div className="viewer-top-title">{deck.title}</div>
          <div className="viewer-top-meta">{`${deck.chip} · QCM`}</div>
        </div>
        {card}
      </div>
    </section>
  );
}
