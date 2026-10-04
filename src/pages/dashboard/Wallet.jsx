import { Link } from "react-router-dom";
import { getCourse } from "../../data/courses.js";
import { PAYMENT_METHODS, formatPrice } from "../../config/paymentConfig.js";
import { REVIEW_STATUSES } from "../../services/paymentService.js";
import { useWallet } from "../../features/payments/wallet.js";
import PaymentSheet from "../../components/dashboard/payment/PaymentSheet.jsx";
import { MockNotice, StatusCard } from "../../components/dashboard/payment/PaymentStatus.jsx";
import { ClockIcon, CoinsIcon, LayersIcon, METHOD_ICONS, WalletIcon } from "../../components/dashboard/payment/icons.jsx";
import { METHOD_LABELS, STATUS_CHIPS, formatPayDate, paymentErrorMessage } from "../../components/dashboard/payment/messages.js";

// محفظتي — /dashboard/wallet: the student's purchase centre. Everything here
// comes from paymentService.getWallet() (the server's purchase history); a
// unit is only «مفعّلة» when the server says its purchase is approved.

const methodTone = Object.fromEntries(PAYMENT_METHODS.map((m) => [m.id, m.tone]));

function Chip({ status }) {
  const chip = STATUS_CHIPS[status] || STATUS_CHIPS.pending;
  return <span className={`payment-chip tone-${chip.tone}`}>{chip.label}</span>;
}

// What a unit card offers, by status.
function unitAction(status, course) {
  const pay = `/dashboard/payment/course/${course.id}`;
  if (status === "approved") return { to: `/dashboard/study/${course.id}`, label: "دخول الوحدة", primary: true };
  if (REVIEW_STATUSES.includes(status)) return { to: pay, label: "عرض الطلب" };
  if (status === "rejected") return { to: pay, label: "إعادة المحاولة", primary: true };
  return { to: pay, label: "متابعة الدفع", primary: true }; // pending (unfinished Slick-Pay)
}

function Stat({ icon, label, value, tone }) {
  return (
    <div className="wallet-stat">
      <span className={`pay-tile tone-${tone}`}>{icon}</span>
      <div className="min-w-0">
        <div className="wallet-stat-label">{label}</div>
        <div className="wallet-stat-value">{value}</div>
      </div>
    </div>
  );
}

export default function Wallet() {
  const { status, wallet, error, reload } = useWallet();
  const shop = <Link to="/dashboard/courses" className="btn-violet payment-btn">استكشف الدورات</Link>;

  let body;
  if (status === "loading") {
    body = (
      <div aria-busy="true" aria-label="جاري التحميل" className="pay-skeleton-stack">
        <div className="wallet-stats">{[0, 1, 2].map((i) => <div key={i} className="payment-skeleton" style={{ height: 72 }} />)}</div>
        <div className="payment-skeleton" style={{ height: 160 }} />
      </div>
    );
  } else if (status === "error") {
    body = (
      <StatusCard
        bare
        tone="bad"
        icon="alert"
        title="تعذر تحميل محفظتك"
        text={paymentErrorMessage(error)}
        actions={<button type="button" className="btn-violet payment-btn" onClick={reload}>إعادة المحاولة</button>}
        testId="wallet-error"
      />
    );
  } else if (wallet.history.length === 0) {
    body = (
      <div className="wallet-empty" data-state="wallet-empty">
        <span className="wallet-empty-icon"><WalletIcon width={30} height={30} /></span>
        <div className="wallet-empty-title">محفظتك فارغة حالياً</div>
        <p className="wallet-empty-text">ابدأ رحلتك واختر أول وحدة تريد دراستها. ستجد هنا وحداتك وطلبات الدفع وسجل مدفوعاتك.</p>
        {shop}
      </div>
    );
  } else {
    const units = wallet.units.map((u) => ({ ...u, course: getCourse(u.contentId) })).filter((u) => u.course);
    body = (
      <div className="wallet-body" data-state="wallet">
        <div className="wallet-stats">
          <Stat icon={<LayersIcon />} label="الوحدات المملوكة" value={wallet.ownedCount} tone="green" />
          <Stat icon={<ClockIcon width={20} height={20} />} label="طلبات قيد المراجعة" value={wallet.reviewCount} tone="amber" />
          <Stat icon={<CoinsIcon />} label="إجمالي المدفوعات" value={formatPrice(wallet.totalPaid)} tone="violet" />
        </div>

        {units.length > 0 && (
          <section aria-labelledby="walletUnits">
            <div className="wallet-section-head">
              <h2 id="walletUnits" className="wallet-section-title">وحداتي</h2>
              <span className="wallet-section-meta">كل وحدة تشمل الدروس المسجلة والحصص المباشرة وبطاقات المراجعة</span>
            </div>
            <div className="wallet-units">
              {units.map(({ contentId, status: unitStatus, purchase, course }) => {
                const action = unitAction(unitStatus, course);
                return (
                  <article key={contentId} className="wallet-unit" data-unit={contentId} data-status={unitStatus}>
                    <img className="wallet-unit-img" src={course.image} alt="" />
                    <div className="wallet-unit-info">
                      <div className="pay-product-kicker">{course.subject}</div>
                      <div className="wallet-unit-title">{course.title}</div>
                      <div className="pay-product-meta">
                        {[course.unit, course.teacher && `الأستاذ: ${course.teacher}`].filter(Boolean).join(" · ")}
                      </div>
                      <div className="wallet-unit-facts">
                        <span>{formatPrice(purchase.amount)}</span>
                        <span>{`${unitStatus === "approved" ? "تاريخ الشراء" : "تاريخ الطلب"}: ${formatPayDate(purchase.updatedAt)}`}</span>
                      </div>
                    </div>
                    <div className="wallet-unit-side">
                      <Chip status={unitStatus} />
                      <Link to={action.to} state={{ from: "/dashboard/wallet" }} className={(action.primary ? "btn-violet" : "btn-outline") + " payment-btn"}>
                        {action.label}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section aria-labelledby="walletHistory">
          <div className="wallet-section-head">
            <h2 id="walletHistory" className="wallet-section-title">سجل المدفوعات</h2>
            <span className="wallet-section-meta">{`${wallet.history.length} عملية`}</span>
          </div>
          <ul className="wallet-history">
            {wallet.history.map((p) => {
              const Icon = METHOD_ICONS[p.paymentMethod];
              const course = getCourse(p.contentId);
              return (
                <li key={p.id} className="wallet-row" data-purchase={p.id}>
                  <span className={`pay-tile tone-${methodTone[p.paymentMethod] || "violet"}`}><Icon /></span>
                  <div className="wallet-row-main">
                    <div className="wallet-row-title">{course ? course.title : p.contentId}</div>
                    <div className="wallet-row-sub">{`${METHOD_LABELS[p.paymentMethod]} · ${formatPayDate(p.updatedAt)}`}</div>
                  </div>
                  <div className="wallet-row-end">
                    <span className="wallet-row-amount">{formatPrice(p.amount)}</span>
                    <Chip status={p.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    );
  }

  return (
    <section className="payment-page wallet-page">
      <div className="pay-page-wrap is-wide">
        <MockNotice />
        <PaymentSheet
          kicker="YAK · محفظتي"
          title="محفظتي"
          subtitle="وحداتك وطلبات الدفع وسجل مدفوعاتك في مكان واحد."
          icon={<WalletIcon />}
          wide
          aside={status === "ready" && wallet.history.length > 0 ? <Link to="/dashboard/courses" className="btn-outline payment-btn wallet-shop">شراء وحدة جديدة</Link> : null}
          testId="wallet-page"
        >
          {body}
        </PaymentSheet>
      </div>
    </section>
  );
}
