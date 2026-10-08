import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { SUBJECT_NAMES, getCourse, getCourseExercise } from "../../../data/courses.js";
import { getUploadedExercise } from "../../../services/contentService.js";
import { getAiDeck } from "../../../data/ai.js";
import { formatPrice } from "../../../config/paymentConfig.js";
import { useCourseAccess } from "../../../features/payments/courseAccess.js";
import { PURCHASE_STATUS, REVIEW_STATUSES } from "../../../services/paymentService.js";
import { useCourseCheckout } from "../courses/useCourseCheckout.jsx";
import { StatusCard } from "./PaymentStatus.jsx";
import { BackIcon } from "./icons.jsx";
import { paymentErrorMessage } from "./messages.js";

// Route guards for paid content. They decide what the student SEES; real
// protection of lesson videos, flashcards and exercises must also exist on the
// server. Access is checked (courseAccess → paymentService) BEFORE the content
// renders: nothing of a QCM or an exercise loads while access is unknown.
// Course, QCM and exercise share one gate (UnitContentGate) and one purchase
// path (useCourseCheckout → the unit's details window → CCP / BaridiMob /
// Slick-Pay):
//
//   <RequireCourseAccess>   study/:courseId(/:lessonId) — the unit itself
//   <RequireDeckAccess>     flash/:deckId — باك AI QCM; the deck's unit decides
//   <RequireExerciseAccess> pdf/:id — «تمارين الدورات» (exercise.courseId);
//                           other PDFs (Library papers) are free and pass through
//
// No access → a locked card whose action opens the purchase window; a request
// under review → its status, followed in «محفظتي»; approved → the content,
// without a reload (onPaymentChange refreshes courseAccess).

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
  const course = getCourse(courseId);
  if (!course) return children; // the study page shows «الدورة غير موجودة»
  return (
    <UnitContentGate
      courseId={course.id}
      title={course.title}
      meta="دورة"
      fallbackFrom="/dashboard/courses"
      backLabel="العودة إلى الدورات"
      copy={() => ({
        testPrefix: "course",
        unavailable: null, // a course is always its own unit
        review: {
          title: `طلب اشتراكك في دورة «${course.title}» قيد المراجعة`,
          text: "ستُفتح الدورة فور تأكيد الدفع من طرف فريق Yak Academy.",
        },
        locked: {
          title: "هذه الدورة متاحة بعد الاشتراك",
          text: `اشترك في دورة «${course.title}» للوصول إلى دروسها وتمارينها وبطاقات المراجعة الخاصة بها.`,
          cta: "انضم للدورة",
        },
      })}
    >
      {children}
    </UnitContentGate>
  );
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
          title: `طلب اشتراكك في دورة «${course?.title}» قيد المراجعة`,
          text: "ستتمكن من استعمال هذه البطاقات فور تأكيد الدفع من طرف فريق Yak Academy.",
        },
        locked: {
          title: "هذه البطاقات متاحة بعد الاشتراك في الدورة",
          text: `بطاقات «${deck.title}» جزء من دورة «${course?.title}»، مع دروسها المسجلة وحصصها المباشرة. انضم للدورة لتفتحها كلها.`,
          cta: "انضم للدورة",
        },
      })}
    >
      {children}
    </UnitContentGate>
  );
}

export function RequireExerciseAccess({ children }) {
  const { id } = useParams();
  const uploaded = getUploadedExercise(id);
  const exercise = getCourseExercise(id) || (uploaded && { ...uploaded, chip: SUBJECT_NAMES[getCourse(uploaded.courseId)?.subjectKey] || "" });
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

// A unit or content that comes with it (course, decks, exercises): shows it
// once the unit is owned; otherwise a locked / under-review /
// not-yet-available card. «انضم للدورة» opens the unit's purchase window right
// here (useCourseCheckout). Access comes from courseAccess (paymentService), so
// an approved purchase opens the content without a reload.
function UnitContentGate({ courseId, title, meta, fallbackFrom, backLabel, copy, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const course = courseId ? getCourse(courseId) : null;
  const access = useCourseAccess(course?.id);
  const from = location.state?.from || fallbackFrom;
  const checkout = useCourseCheckout(from);

  if (course && access.status === "error") return <AccessError error={access.error} onRetry={access.reload} />;
  if (course && access.status !== "ready") return <Checking />;
  if (course && access.hasAccess) return children;

  const text = copy(course);
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
            <Link to="/dashboard/wallet" className="btn-violet payment-btn">متابعة طلباتي</Link>
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
        chip={
          access.accessStatus === PURCHASE_STATUS.REJECTED
            ? { tone: "bad", label: "لم يتم تأكيد طلبك السابق" }
            : access.price
              ? { tone: "info", label: `السعر: ${formatPrice(access.price.amount)}` }
              : null
        }
        actions={
          <>
            <button type="button" className="btn-violet payment-btn" aria-haspopup="dialog" onClick={() => checkout.open(course.id)}>
              {text.locked.cta}
            </button>
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
      {checkout.modal}
    </section>
  );
}
