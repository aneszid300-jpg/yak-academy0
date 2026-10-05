import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { getCourse, getCourseExercise } from "../../../data/courses.js";
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
//   <RequireExerciseAccess> pdf/:id — same for «تمارين الدورات» (exercise.courseId);
//                          other PDFs (Library papers) are free and pass through

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
  const deck = getAiDeck(deckId);
  if (!deck) return children; // the flashcards page shows «المجموعة غير موجودة»
  return (
    <UnitContentGate
      courseId={deck.courseId}
      title={deck.title}
      meta={`${deck.chip} · QCM`}
      fallbackFrom="/dashboard/ai"
      backLabel="العودة إلى باك AI"
      copy={(course) => ({
        testPrefix: "deck",
        unavailable: {
          title: `بطاقات «${deck.title}» غير متاحة بعد`,
          text: "بطاقات المراجعة تأتي مع الوحدات ولا تُباع منفصلة، وهذه البطاقات ستتوفر ضمن وحدتها قريباً.",
          browse: "تصفح الوحدات",
        },
        review: {
          title: `طلب اشتراكك في وحدة «${course?.title}» قيد المراجعة`,
          text: "ستتمكن من استعمال هذه البطاقات فور تأكيد الدفع من طرف فريق Yak Academy.",
        },
        locked: {
          title: "هذه البطاقات متاحة بعد الاشتراك في الوحدة",
          text: `بطاقات «${deck.title}» جزء من وحدة «${course?.title}»، مع دروسها المسجلة وحصصها المباشرة. اشترِ الوحدة لتفتحها كلها.`,
          cta: "شراء الوحدة",
        },
      })}
    >
      {children}
    </UnitContentGate>
  );
}

export function RequireExerciseAccess({ children }) {
  const { id } = useParams();
  const exercise = getCourseExercise(id);
  if (!exercise) return children; // Library papers (free) and «الملف غير موجود»
  return (
    <UnitContentGate
      courseId={exercise.courseId}
      title={exercise.title}
      meta={`${exercise.chip} · تمارين`}
      fallbackFrom="/dashboard/courses?view=exercises"
      backLabel="العودة إلى التمارين"
      copy={(course) => ({
        testPrefix: "exercise",
        unavailable: {
          title: `«${exercise.title}» غير متاحة بعد`,
          text: "تمارين الدورات تأتي مع دوراتها ولا تُباع منفصلة، وهذه التمارين ستتوفر ضمن دورتها قريباً.",
          browse: "تصفح الدورات",
        },
        review: {
          title: `طلب اشتراكك في دورة «${course?.title}» قيد المراجعة`,
          text: "ستتمكن من فتح هذه التمارين فور تأكيد الدفع من طرف فريق Yak Academy.",
        },
        locked: {
          title: "تمارين الدورة مقفلة",
          text: `«${exercise.title}» جزء من دورة «${course?.title}». اشترِ الدورة للوصول إلى جميع التمارين.`,
          cta: "انضم للدورة",
        },
      })}
    >
      {children}
    </UnitContentGate>
  );
}

// Content that comes with a unit (decks, exercises): shows it once the unit is
// owned; otherwise a locked / under-review / not-yet-available card that leads
// to the unit's checkout. Access comes from courseAccess (paymentService), so
// an approved purchase opens it without a reload.
function UnitContentGate({ courseId, title, meta, fallbackFrom, backLabel, copy, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const course = courseId ? getCourse(courseId) : null;
  const access = useCourseAccess(course?.id);

  if (course && access.status === "error") return <AccessError error={access.error} onRetry={access.reload} />;
  if (course && access.status !== "ready") return <Checking />;
  if (course && access.hasAccess) return children;

  const text = copy(course);
  const from = location.state?.from || fallbackFrom;
  const back = (
    <button type="button" className="btn-outline payment-btn" onClick={() => navigate(from)}>{backLabel}</button>
  );
  let card;
  if (!course) {
    card = (
      <StatusCard
        icon="lock"
        title={text.unavailable.title}
        text={text.unavailable.text}
        actions={
          <>
            <Link to="/dashboard/courses" className="btn-violet payment-btn">{text.unavailable.browse}</Link>
            {back}
          </>
        }
        testId={`${text.testPrefix}-unavailable`}
      />
    );
  } else if (REVIEW_STATUSES.includes(access.accessStatus)) {
    card = (
      <StatusCard
        tone="wait"
        title={text.review.title}
        text={text.review.text}
        chip={{ tone: "wait", label: "قيد المراجعة" }}
        actions={
          <>
            <Link to={`/dashboard/payment/course/${course.id}`} state={{ from }} className="btn-violet payment-btn">عرض حالة الطلب</Link>
            {back}
          </>
        }
        testId={`${text.testPrefix}-review`}
      />
    );
  } else {
    card = (
      <StatusCard
        icon="lock"
        title={text.locked.title}
        text={text.locked.text}
        actions={
          <>
            <Link to={`/dashboard/payment/course/${course.id}`} state={{ from }} className="btn-violet payment-btn">
              {text.locked.cta}
            </Link>
            {back}
          </>
        }
        testId={`${text.testPrefix}-locked`}
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
          <div className="viewer-top-title">{title}</div>
          <div className="viewer-top-meta">{meta}</div>
        </div>
        {card}
      </div>
    </section>
  );
}
