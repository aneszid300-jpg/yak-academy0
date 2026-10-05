import { useCallback, useRef, useState } from "react";
import { useBalance } from "../../features/payments/balance.js";
import { toActivity } from "../../features/payments/activity.js";
import { useWallet } from "../../features/payments/wallet.js";
import { MockNotice } from "../../components/dashboard/payment/PaymentStatus.jsx";
import TopUpModal from "../../components/dashboard/payment/TopUpModal.jsx";
import WalletActivity from "../../components/dashboard/payment/WalletActivity.jsx";
import { METHOD_ICONS, WalletIcon } from "../../components/dashboard/payment/icons.jsx";
import { paymentErrorMessage } from "../../components/dashboard/payment/messages.js";

// محفظتي — /dashboard/wallet. Reads top to bottom as:
//   balance → top up (method selector + how it works) → «سجل المحفظة».
// Data: paymentService.getBalance() (useBalance) and getWallet() (useWallet →
// features/payments/activity.js → WalletActivity).
// A method opens the same method screen as the course details window
// (TopUpModal). Nothing here marks a payment done or changes the balance.

const METHODS = [
  { id: "ccp", name: "CCP", subtitle: "حوالة بريدية عبر CCP", cta: "شحن عبر CCP" },
  { id: "baridimob", name: "BaridiMob", subtitle: "تحويل مباشر عبر BaridiMob", cta: "شحن عبر BaridiMob" },
  { id: "slickpay", name: "الدفع الإلكتروني", subtitle: "CIB أو الذهبية عبر Slick-Pay", cta: "الدفع الإلكتروني", featured: true },
];

const STEPS = [
  { title: "اختر طريقة الدفع", text: "CCP أو BaridiMob أو الدفع الإلكتروني." },
  { title: "أتمم عملية الدفع", text: "حوّل أو ادفع حسب الطريقة المختارة." },
  { title: "يتم تأكيد العملية", text: "نتحقق من الدفع ثم يُضاف الرصيد." },
];

const Arrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

function BalanceCard({ balance, onTopUp }) {
  const { status, balance: value } = balance;
  return (
    <section className="wl-balance" aria-labelledby="wlBalanceLabel">
      <div className="wl-balance-main">
        <div className="wl-balance-label" id="wlBalanceLabel">
          <WalletIcon width={16} height={16} />
          رصيدك الحالي
        </div>
        {status === "loading" ? (
          <div className="payment-skeleton wl-balance-skeleton" aria-label="جاري التحميل" />
        ) : value ? (
          <div className="wl-balance-value">
            <span>{value.amount.toLocaleString("en-US")}</span>
            <small>دج</small>
          </div>
        ) : (
          <div className="wl-balance-value is-unknown">—</div>
        )}
        <p className="wl-balance-hint">
          {value || status === "loading" ? "يمكنك استخدام رصيدك للانضمام إلى الدورات." : "سيظهر رصيدك هنا بعد ربط المحفظة."}
        </p>
      </div>
      <button type="button" className="wl-balance-btn" onClick={onTopUp}>
        شحن الرصيد
        <Arrow />
      </button>
    </section>
  );
}

function Activity() {
  const { status, wallet, error, reload } = useWallet();
  if (status === "loading") return <div className="payment-skeleton" style={{ height: 150, borderRadius: 16 }} aria-label="جاري التحميل" />;
  if (status === "error") {
    return (
      <div className="wa-empty">
        <div className="wa-empty-title">تعذر تحميل سجل محفظتك</div>
        <p className="wa-empty-text">{paymentErrorMessage(error)}</p>
        <button type="button" className="btn-outline payment-btn" onClick={reload}>إعادة المحاولة</button>
      </div>
    );
  }
  return <WalletActivity items={toActivity(wallet)} />;
}

export default function Wallet() {
  const balance = useBalance();
  const [method, setMethod] = useState(null);
  const close = useCallback(() => setMethod(null), []);
  const methodsRef = useRef(null);

  // «شحن الرصيد» brings the method selector into view and focuses its first card.
  function toMethods() {
    methodsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => methodsRef.current?.querySelector("button")?.focus({ preventScroll: true }), 350);
  }

  const active = balance.status !== "error";

  return (
    <section className="payment-page wallet-page" data-state="wallet-page">
      <div className="wl">
        <MockNotice />

        <header className="wl-head">
          <div className="min-w-0">
            <h1 className="wl-title">محفظتي</h1>
            <p className="wl-sub">إدارة رصيدك وشحن محفظتك بسهولة</p>
          </div>
          <span className={"wl-status" + (active ? "" : " is-off")}>
            <span className="wl-status-dot" aria-hidden="true"></span>
            {active ? "المحفظة نشطة" : "المحفظة غير متصلة بعد"}
          </span>
        </header>

        <BalanceCard balance={balance} onTopUp={toMethods} />

        <section className="wl-section" aria-labelledby="wlMethods" ref={methodsRef}>
          <div className="wl-section-head">
            <h2 id="wlMethods" className="wl-section-title">اختر طريقة الشحن</h2>
            <p className="wl-section-sub">اختر طريقة لإضافة رصيد إلى محفظتك.</p>
          </div>
          <div className="wl-methods">
            {METHODS.map((m) => {
              const Icon = METHOD_ICONS[m.id];
              return (
                <button key={m.id} type="button" className={"wl-method" + (m.featured ? " is-featured" : "")} data-method={m.id} aria-label={`${m.cta} — ${m.subtitle}`} onClick={() => setMethod(m.id)}>
                  <span className="wl-method-icon"><Icon /></span>
                  <span className="wl-method-text">
                    <span className="wl-method-name">{m.name}</span>
                    <span className="wl-method-sub">{m.subtitle}</span>
                  </span>
                  <span className="wl-method-go" aria-hidden="true"><Arrow /></span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="wl-card wl-how" aria-labelledby="wlSteps">
          <h2 id="wlSteps" className="wl-card-title">كيف يتم شحن رصيدك؟</h2>
          <ol className="wl-steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className="wl-step">
                <span className="wl-step-num" aria-hidden="true">{i + 1}</span>
                <span className="wl-step-body">
                  <span className="wl-step-title">{step.title}</span>
                  <span className="wl-step-text">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="wl-how-note">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span>
              <b>يُضاف الرصيد بعد التحقق من عملية الدفع.</b> لا تُحتسب العملية مكتملة قبل تأكيدها.
            </span>
          </p>
        </section>

        <section className="wl-section" aria-labelledby="wlHistory">
          <div className="wl-section-head">
            <h2 id="wlHistory" className="wl-section-title">سجل المحفظة</h2>
            <p className="wl-section-sub">تابع طلبات الشحن وحركة رصيدك.</p>
          </div>
          <Activity />
        </section>
      </div>

      {method && <TopUpModal method={method} onClose={close} />}
    </section>
  );
}
