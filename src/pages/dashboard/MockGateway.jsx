import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getCourse } from "../../data/courses.js";
import { formatPrice } from "../../config/paymentConfig.js";
import { devTools } from "../../services/paymentService.js";
import PaymentSheet from "../../components/dashboard/payment/PaymentSheet.jsx";
import { StatusCard } from "../../components/dashboard/payment/PaymentStatus.jsx";
import { CardIcon } from "../../components/dashboard/payment/icons.jsx";
import { paymentErrorMessage } from "../../components/dashboard/payment/messages.js";

// ⚠️ MOCK / DEVELOPMENT ONLY — stands in for Slick-Pay's hosted payment page.
// Registered only while the mock adapter is active. The real flow leaves Yak
// for Slick-Pay and comes back to /dashboard/payment/return/:purchaseId.

export default function MockGateway() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    devTools?.gatewayPurchase(purchaseId).then(setPurchase, setError);
  }, [purchaseId]);

  if (!devTools) return <Navigate to="/dashboard/courses" replace />;
  const back = () => navigate(`/dashboard/payment/return/${purchaseId}`, { replace: true });
  const finish = async (result) => {
    await devTools.gatewayResult(purchaseId, result);
    back();
  };
  const course = purchase ? getCourse(purchase.contentId) : null;

  return (
    <section className="payment-page">
      <div className="pay-page-wrap">
        <div className="payment-mock-note" role="note">
          بوابة دفع تجريبية (Mock) تحاكي صفحة Slick-Pay — لا يتم أي دفع حقيقي.
        </div>
        <PaymentSheet
          kicker="SLICK-PAY · تجريبي"
          title="Slick-Pay (تجريبي)"
          subtitle={purchase ? `${course ? course.title + " · " : ""}${formatPrice(purchase.amount)}` : "جاري التحميل..."}
          icon={<CardIcon />}
          tone="blue"
          footnote="هذه الصفحة تحاكي بوابة الدفع فقط لأغراض التطوير."
          testId="mock-gateway"
        >
          {error ? (
            <StatusCard bare tone="bad" icon="alert" title="تعذر فتح عملية الدفع" text={paymentErrorMessage(error)} />
          ) : !purchase ? (
            <div className="payment-checking"><span className="payment-spinner" aria-hidden="true"></span></div>
          ) : (
            <div className="payment-actions">
              <button type="button" className="btn-violet payment-btn" onClick={() => finish("paid")}>محاكاة دفع ناجح</button>
              <button type="button" className="btn-outline payment-btn" onClick={() => finish("failed")}>محاكاة فشل الدفع</button>
              <button type="button" className="btn-outline payment-btn" onClick={back}>إلغاء والعودة إلى Yak</button>
            </div>
          )}
        </PaymentSheet>
      </div>
    </section>
  );
}
