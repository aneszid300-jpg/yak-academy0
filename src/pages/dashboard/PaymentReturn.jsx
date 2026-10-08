import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCourse } from "../../data/courses.js";
import { PURCHASE_STATUS as S, REVIEW_STATUSES, getPurchaseStatus } from "../../services/paymentService.js";
import { MockNotice, MockReviewTools, PurchaseFacts, StatusCard } from "../../components/dashboard/payment/PaymentStatus.jsx";
import { UnitIncludes } from "../../components/dashboard/payment/PaymentSummary.jsx";
import PaymentSheet from "../../components/dashboard/payment/PaymentSheet.jsx";
import { paymentErrorMessage } from "../../components/dashboard/payment/messages.js";

// حالة الدفع — /dashboard/payment/return/:purchaseId, where Slick-Pay sends the
// student back. Nothing in the URL is trusted: the status always comes from
// the server (getPurchaseStatus), which verifies the payment itself. While it
// is still pending we check again a few times before offering a manual check.

const POLL_MS = 2500;
const POLL_TRIES = 4;

export default function PaymentReturn() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ phase: "checking", purchase: null, error: null });
  const tries = useRef(0);
  const timer = useRef(null);

  const check = useCallback(async () => {
    clearTimeout(timer.current);
    try {
      const purchase = await getPurchaseStatus(purchaseId);
      if (purchase.status === S.PENDING && tries.current < POLL_TRIES) {
        tries.current += 1;
        setState({ phase: "checking", purchase, error: null, waiting: true });
        timer.current = setTimeout(check, POLL_MS);
        return;
      }
      setState({ phase: "done", purchase, error: null });
    } catch (error) {
      setState({ phase: "error", purchase: null, error });
    }
  }, [purchaseId]);

  useEffect(() => {
    tries.current = 0;
    check();
    return () => clearTimeout(timer.current);
  }, [check]);

  const recheck = () => {
    tries.current = POLL_TRIES; // one explicit check, no automatic retries
    setState((s) => ({ ...s, phase: "checking" }));
    check();
  };

  const { phase, purchase, error } = state;
  const course = purchase ? getCourse(purchase.contentId) : null;
  // Back to the unit: its gate (RequireCourseAccess) offers the purchase window again.
  const paymentPage = course ? `/dashboard/study/${course.id}` : "/dashboard/courses";
  const toCourses = <Link to="/dashboard/courses" className="btn-outline payment-btn">العودة إلى الدورات</Link>;

  let content;
  if (phase === "checking") {
    content = (
      <div className="payment-checking" role="status" data-state="checking">
        <span className="payment-spinner" aria-hidden="true"></span>
        جاري التحقق من عملية الدفع...
        {state.waiting && <span className="payment-field-hint">ننتظر تأكيد Slick-Pay، قد يستغرق ذلك بضع ثوانٍ.</span>}
      </div>
    );
  } else if (phase === "error") {
    content = (
      <StatusCard
        bare
        tone="bad"
        icon="alert"
        title="تعذر التحقق من عملية الدفع"
        text={paymentErrorMessage(error)}
        actions={
          <>
            <button type="button" className="btn-violet payment-btn" onClick={recheck}>إعادة المحاولة</button>
            {toCourses}
          </>
        }
        testId="error"
      />
    );
  } else if (purchase.status === S.APPROVED) {
    content = (
      <StatusCard
        bare
        tone="ok"
        title="تم تفعيل الوحدة بنجاح 🎉"
        text={course ? `أصبحت وحدة «${course.title}» متاحة على حسابك. يمكنك الآن الوصول إلى:` : "يمكنك الآن الوصول إلى:"}
        actions={
          <>
            {course && <Link to={`/dashboard/study/${course.id}`} className="btn-violet payment-btn">ابدأ التعلم</Link>}
            {toCourses}
          </>
        }
        testId="approved"
      >
        <UnitIncludes compact />
      </StatusCard>
    );
  } else if (purchase.status === S.PENDING) {
    content = (
      <StatusCard
        bare
        tone="wait"
        title="في انتظار إتمام الدفع"
        text="لم يصلنا تأكيد الدفع من Slick-Pay بعد. إذا أكملت الدفع، انتظر قليلاً ثم تحقق مجدداً."
        chip={{ tone: "wait", label: "في انتظار الدفع" }}
        actions={
          <>
            <button type="button" className="btn-violet payment-btn" onClick={recheck}>تحقق مجدداً</button>
            <Link to={paymentPage} className="btn-outline payment-btn">العودة إلى الدورة</Link>
          </>
        }
        testId="pending"
      >
        <PurchaseFacts purchase={purchase} />
      </StatusCard>
    );
  } else if (REVIEW_STATUSES.includes(purchase.status)) {
    content = (
      <StatusCard
        bare
        tone="wait"
        title="طلبك قيد المراجعة"
        text="فريق Yak Academy يتحقق من إثبات الدفع الذي أرسلته. ستُفعَّل الوحدة على حسابك فور تأكيد الدفع."
        chip={{ tone: "wait", label: "قيد المراجعة" }}
        actions={toCourses}
        testId="under-review"
      >
        <PurchaseFacts purchase={purchase} />
        <MockReviewTools purchase={purchase} />
      </StatusCard>
    );
  } else {
    const cancelled = purchase.status === S.CANCELLED;
    content = (
      <StatusCard
        bare
        tone="bad"
        title={cancelled ? "تم إلغاء عملية الدفع" : "تعذر تأكيد الدفع"}
        text={`${!cancelled && purchase.reviewNote ? purchase.reviewNote + " " : ""}لم تُفعَّل الوحدة، ويمكنك إعادة المحاولة.`}
        chip={{ tone: "bad", label: cancelled ? "ملغاة" : "لم يتم التأكيد" }}
        actions={
          <>
            <Link to={paymentPage} className="btn-violet payment-btn">إعادة المحاولة</Link>
            {toCourses}
          </>
        }
        testId={cancelled ? "cancelled" : "rejected"}
      >
        <PurchaseFacts purchase={purchase} />
      </StatusCard>
    );
  }

  return (
    <section className="payment-page">
      <div className="pay-page-wrap">
        <MockNotice />
        <PaymentSheet
          kicker="YAK · حالة الدفع"
          title="حالة الدفع"
          subtitle={course ? course.title : "التحقق من عملية الدفع"}
          onClose={() => navigate("/dashboard/courses")}
        >
          {content}
        </PaymentSheet>
      </div>
    </section>
  );
}
