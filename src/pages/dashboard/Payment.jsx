import { useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getCourse } from "../../data/courses.js";
import { UNIT_INCLUDES, formatPrice, getPaymentMethod } from "../../config/paymentConfig.js";
import { useCourseAccess } from "../../features/payments/courseAccess.js";
import { PURCHASE_STATUS, REVIEW_STATUSES, cancelPurchase } from "../../services/paymentService.js";
import PaymentSheet from "../../components/dashboard/payment/PaymentSheet.jsx";
import PaymentMethods from "../../components/dashboard/payment/PaymentMethods.jsx";
import ManualPayment from "../../components/dashboard/payment/ManualPayment.jsx";
import SlickPayPayment, { goToPaymentUrl, startSlickPay } from "../../components/dashboard/payment/SlickPayPayment.jsx";
import { MockNotice, MockReviewTools, PurchaseFacts, StatusCard } from "../../components/dashboard/payment/PaymentStatus.jsx";
import { CheckIcon, CoinsIcon, LayersIcon, METHOD_ICONS, ShieldIcon } from "../../components/dashboard/payment/icons.jsx";
import { paymentErrorMessage } from "../../components/dashboard/payment/messages.js";

// شراء الوحدة — /dashboard/payment/course/:courseId, a step-by-step sheet:
//   (no query)        1. confirm the unit and its price
//   ?step=methods     2. choose Slick-Pay / CCP / BaridiMob
//   ?method=<id>      3. that method's two-pane step
// Before the checkout, the server's answer for this unit decides what shows:
// owned → «أنت مشترك بالفعل»; request under review → its status; unfinished
// Slick-Pay → resume; rejected → retry.

export default function Payment() {
  const { courseId } = useParams();
  const course = getCourse(courseId);
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const from = location.state?.from || "/dashboard/courses";
  const access = useCourseAccess(courseId);

  const [retrying, setRetrying] = useState(false); // after a rejection, show the checkout again
  const [justSubmitted, setJustSubmitted] = useState(null); // request sent in this visit
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Steps live in the URL (Back/Forward walk through them); keep where we came from.
  const go = (next) => setParams(next, { state: location.state });
  const close = () => navigate(from);
  const page = (sheet) => (
    <section className="payment-page">
      <div className="pay-page-wrap">
        <MockNotice />
        {sheet}
      </div>
    </section>
  );
  const sheet = (props, content) => page(<PaymentSheet onClose={close} {...props}>{content}</PaymentSheet>);
  const toCourses = <Link to="/dashboard/courses" className="btn-outline payment-btn">العودة إلى الدورات</Link>;

  if (!course) {
    return sheet(
      { title: "الوحدة غير موجودة", subtitle: "الرابط غير صحيح أو أن الوحدة لم تعد متوفرة.", testId: "not-found" },
      <div className="payment-actions">{toCourses}</div>
    );
  }

  const study = `/dashboard/study/${course.id}`;
  const head = { title: course.title, subtitle: "الاشتراك في الوحدة" };
  const { purchase } = access;

  if (access.status === "idle" || access.status === "loading") {
    return sheet(
      head,
      <div aria-busy="true" aria-label="جاري التحميل" className="pay-skeleton-stack">
        <div className="payment-skeleton" style={{ height: 64 }} />
        <div className="payment-skeleton" style={{ height: 120 }} />
        <div className="payment-skeleton" style={{ height: 44, width: "60%" }} />
      </div>
    );
  }

  if (access.status === "error" || !access.price) {
    return sheet(
      head,
      <StatusCard
        bare
        tone="bad"
        icon="alert"
        title="تعذر تحميل صفحة الدفع"
        text={paymentErrorMessage(access.error || { code: "not_found" })}
        actions={
          <>
            <button type="button" className="btn-violet payment-btn" onClick={access.reload}>إعادة المحاولة</button>
            {toCourses}
          </>
        }
        testId="error"
      />
    );
  }

  if (access.hasAccess) {
    return sheet(
      head,
      <StatusCard
        bare
        tone="ok"
        title="أنت مشترك بالفعل"
        text={`وحدة «${course.title}» مفعّلة على حسابك مع دروسها وحصصها المباشرة وبطاقات المراجعة.`}
        actions={
          <>
            <Link to={study} className="btn-violet payment-btn">دخول الوحدة</Link>
            <Link to="/dashboard/wallet" className="btn-outline payment-btn">محفظتي</Link>
          </>
        }
        testId="owned"
      />
    );
  }

  if (justSubmitted) {
    return sheet(
      head,
      <StatusCard
        bare
        tone="wait"
        icon="sent"
        title="تم إرسال طلب الدفع"
        text="سيتم التحقق من العملية من طرف فريق Yak Academy. بعد تأكيد الدفع، تُفعَّل الوحدة على حسابك."
        chip={{ tone: "wait", label: "قيد المراجعة" }}
        actions={
          <>
            <Link to="/dashboard/wallet" className="btn-violet payment-btn">متابعة الطلب في محفظتي</Link>
            {toCourses}
          </>
        }
        testId="submitted"
      >
        <PurchaseFacts purchase={justSubmitted} />
        <MockReviewTools purchase={justSubmitted} />
      </StatusCard>
    );
  }

  if (REVIEW_STATUSES.includes(access.accessStatus)) {
    return sheet(
      head,
      <StatusCard
        bare
        tone="wait"
        title="طلبك قيد المراجعة"
        text="فريق Yak Academy يتحقق من الدفع الذي أرسلته. ستُفعَّل الوحدة على حسابك فور تأكيده."
        chip={{ tone: "wait", label: access.accessStatus === PURCHASE_STATUS.UNDER_REVIEW ? "قيد المراجعة لدى الفريق" : "قيد المراجعة" }}
        actions={
          <>
            <Link to="/dashboard/wallet" className="btn-violet payment-btn">محفظتي</Link>
            {toCourses}
          </>
        }
        testId="under-review"
      >
        <PurchaseFacts purchase={purchase} />
        <MockReviewTools purchase={purchase} />
      </StatusCard>
    );
  }

  if (access.accessStatus === PURCHASE_STATUS.PENDING && purchase?.paymentMethod === "slickpay") {
    return sheet(
      head,
      <StatusCard
        bare
        tone="wait"
        title="في انتظار إتمام الدفع"
        text="بدأت عملية دفع عبر Slick-Pay ولم تكتمل بعد. يمكنك متابعتها أو اختيار طريقة دفع أخرى."
        chip={{ tone: "wait", label: "في انتظار الدفع" }}
        actions={
          <>
            <button
              type="button"
              className="btn-violet payment-btn"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setActionError(null);
                try {
                  goToPaymentUrl(await startSlickPay(course.id, purchase), navigate);
                } catch (error) {
                  setActionError(paymentErrorMessage(error));
                  setBusy(false);
                }
              }}
            >
              {busy && <span className="payment-spinner" aria-hidden="true"></span>}
              {busy ? "جاري تجهيز عملية الدفع..." : "متابعة الدفع"}
            </button>
            <button
              type="button"
              className="btn-outline payment-btn"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setActionError(null);
                try {
                  await cancelPurchase(purchase.id);
                  go({ step: "methods" });
                } catch (error) {
                  setActionError(paymentErrorMessage(error));
                }
                setBusy(false);
              }}
            >
              اختيار طريقة أخرى
            </button>
          </>
        }
        note={actionError}
        testId="pending"
      >
        <PurchaseFacts purchase={purchase} />
      </StatusCard>
    );
  }

  // A rejected student who is already on a checkout step is retrying (survives a refresh).
  if (access.accessStatus === PURCHASE_STATUS.REJECTED && !retrying && !params.has("step") && !params.has("method")) {
    return sheet(
      head,
      <StatusCard
        bare
        tone="bad"
        title="تعذر تأكيد الدفع"
        text={`${purchase?.reviewNote ? purchase.reviewNote + " " : ""}لم تُفعَّل الوحدة، ويمكنك إعادة المحاولة بنفس الطريقة أو بطريقة أخرى.`}
        chip={{ tone: "bad", label: "مرفوضة" }}
        actions={
          <>
            <button
              type="button"
              className="btn-violet payment-btn"
              onClick={() => {
                setRetrying(true);
                go({ step: "methods" });
              }}
            >
              إعادة المحاولة
            </button>
            {toCourses}
          </>
        }
        testId="rejected"
      >
        <PurchaseFacts purchase={purchase} />
      </StatusCard>
    );
  }

  // ---------- checkout ----------
  const method = getPaymentMethod(params.get("method"));

  if (method) {
    const Icon = METHOD_ICONS[method.id];
    return sheet(
      { title: method.title, subtitle: method.subtitle, icon: <Icon />, tone: method.tone, wide: true, onBack: () => go({ step: "methods" }), testId: `method-${method.id}` },
      method.verification === "manual" ? (
        <ManualPayment method={method} course={course} price={access.price} onSubmitted={setJustSubmitted} />
      ) : (
        <SlickPayPayment method={method} course={course} price={access.price} onCancel={() => go({ step: "methods" })} />
      )
    );
  }

  if (params.get("step") === "methods" || params.has("method")) {
    return sheet(
      { title: "اختر طريقة الدفع", subtitle: "حدد الطريقة المناسبة لدفع ثمن الوحدة", onBack: () => go({}), testId: "methods" },
      <>
        <div className="pay-amount-strip">
          <span className="min-w-0 truncate">{course.title}</span>
          <strong>{formatPrice(access.price.amount)}</strong>
        </div>
        <PaymentMethods onChoose={(id) => go({ method: id })} />
      </>
    );
  }

  return sheet(
    { ...head, subtitle: "تأكيد الاشتراك في الوحدة", testId: "confirm" },
    <>
      <div className="pay-callout">
        <ShieldIcon />
        <div>
          <div className="pay-callout-title">هل تريد الاشتراك في هذه الوحدة؟</div>
          <p className="pay-callout-text">تختار طريقة الدفع في الخطوة التالية، وتُفعَّل الوحدة على حسابك بعد تأكيد الدفع.</p>
        </div>
      </div>

      <div className="pay-summary-card" aria-label="ملخص الاشتراك">
        <div className="pay-product">
          <img className="pay-product-img" src={course.image} alt="" />
          <div className="min-w-0">
            <div className="pay-product-kicker">{course.subject}</div>
            <div className="pay-product-title">{course.title}</div>
            <div className="pay-product-meta">{`${course.unit} · وحدة كاملة`}</div>
            {course.teacher && <div className="pay-product-meta">{`الأستاذ: ${course.teacher}`}</div>}
          </div>
        </div>
        <div className="pay-price-row">
          <span className="pay-price-label"><CoinsIcon width={16} height={16} />السعر النهائي</span>
          <span className="pay-price-value">{formatPrice(access.price.amount)}</span>
        </div>
      </div>

      <div className="pay-includes">
        <div className="pay-includes-title"><LayersIcon width={15} height={15} />يشمل هذا الاشتراك</div>
        <div className="pay-chips">
          {UNIT_INCLUDES.map((item) => (
            <span key={item.key} className="pay-chip"><CheckIcon />{item.label}</span>
          ))}
        </div>
      </div>

      <div className="pay-actions pay-actions-end">
        <button type="button" className="btn-violet payment-btn" onClick={() => go({ step: "methods" })}>متابعة للدفع</button>
        <button type="button" className="btn-outline payment-btn" onClick={close}>إلغاء</button>
      </div>
    </>
  );
}
