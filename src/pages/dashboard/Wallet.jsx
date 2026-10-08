import { forwardRef, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toTransfers } from "../../features/payments/activity.js";
import { useWallet } from "../../features/payments/wallet.js";
import { WalletTransfers } from "../../components/dashboard/payment/WalletActivity.jsx";
import { METHOD_ICONS, WalletIcon } from "../../components/dashboard/payment/icons.jsx";
import { paymentErrorMessage } from "../../components/dashboard/payment/messages.js";

// مشترياتي — /dashboard/wallet (route kept). Yak Academy has no wallet: a
// course is paid directly, then activated once the payment is confirmed.
// One panel in the «مهامي» card language (todos.css):
//   header     title + «الشراء متاح» chip
//   summary    purchased courses (approved purchases, from getWallet())
//   grid       [ كيف يتم الشحن ]  [ جميع التحويلات ]
//              [ طرق الشحن ]
//   Two columns on desktop, one below 900px.
// Data: paymentService.getWallet() (useWallet → features/payments/activity.js
// → WalletTransfers): the student's purchase records.
// A method leads to the courses with that method kept (?pay=<id>): the
// student picks a course there and goes straight to that method's screen
// (CourseDetailsModal). Nothing here marks a payment done or changes the balance.

const METHODS = [
  { id: "ccp", name: "CCP", subtitle: "حوالة بريدية عبر CCP", cta: "الدفع عبر CCP" },
  { id: "baridimob", name: "BaridiMob", subtitle: "تحويل مباشر عبر BaridiMob", cta: "الدفع عبر BaridiMob" },
  { id: "slickpay", name: "الدفع الإلكتروني", subtitle: "CIB أو الذهبية عبر Slick-Pay", cta: "الدفع الإلكتروني", featured: true },
];

const STEPS = [
  { title: "اختر الدورة", text: "اختر الدورة التي تريد شراءها." },
  { title: "اختر طريقة الدفع", text: "CCP أو BaridiMob أو الدفع الإلكتروني." },
  { title: "أتمم عملية الدفع", text: "حوّل أو ادفع حسب الطريقة المختارة." },
  { title: "يتم تأكيد العملية", text: "نتحقق من عملية الدفع، وبعد التأكيد يتم تفعيل الدورة في حسابك." },
];

const Arrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const HeadIcon = ({ children }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const ICONS = {
  methods: <HeadIcon><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20M6 15h4" /></HeadIcon>,
  transfers: <HeadIcon><path d="M7 7h13l-3-3M17 17H4l3 3" /></HeadIcon>,
  steps: <HeadIcon><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></HeadIcon>,
};

// A section card: icon tile + title + one line, then its content.
const WalletCard = forwardRef(function WalletCard({ id, icon, title, sub, className = "", children }, ref) {
  return (
    <section className={"wl-card " + className} aria-labelledby={id} ref={ref}>
      <div className="wl-card-head">
        <span className="wl-card-icon">{ICONS[icon]}</span>
        <div className="min-w-0">
          <h2 id={id} className="wl-card-title">{title}</h2>
          {sub && <p className="wl-card-sub">{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  );
});

// 3–10 → «دورات», otherwise «دورة» (0 دورة، 1 دورة، 11 دورة).
const coursesWord = (n) => (n >= 3 && n <= 10 ? "دورات" : "دورة");

function BalanceCard({ wallet, onBrowse }) {
  const { status } = wallet;
  const count = wallet.wallet?.ownedCount ?? 0;
  return (
    <section className="wl-balance" aria-labelledby="wlBalanceLabel">
      <div className="wl-balance-main">
        <div className="wl-balance-label" id="wlBalanceLabel">
          <WalletIcon width={16} height={16} />
          الدورات المشتراة
        </div>
        {status === "loading" ? (
          <div className="payment-skeleton wl-balance-skeleton" aria-label="جاري التحميل" />
        ) : status === "ready" ? (
          <div className="wl-balance-value">
            <span>{count}</span>
            <small>{coursesWord(count)}</small>
          </div>
        ) : (
          <div className="wl-balance-value is-unknown">—</div>
        )}
        <p className="wl-balance-hint">يمكنك شراء الدورات والوصول إليها بعد تأكيد الدفع.</p>
      </div>
      <button type="button" className="wl-balance-btn" onClick={onBrowse}>
        تصفح الدورات
        <Arrow />
      </button>
    </section>
  );
}

// One getWallet() feeds both lists; `render` picks which list to show.
function WalletList({ wallet, render }) {
  const { status, error, reload } = wallet;
  if (status === "loading") return <div className="payment-skeleton" style={{ height: 120, borderRadius: 16 }} aria-label="جاري التحميل" />;
  if (status === "error") {
    return (
      <div className="wa-empty">
        <div className="wa-empty-title">تعذر تحميل عمليات الشراء</div>
        <p className="wa-empty-text">{paymentErrorMessage(error)}</p>
        <button type="button" className="btn-outline payment-btn" onClick={reload}>إعادة المحاولة</button>
      </div>
    );
  }
  return render(wallet.wallet);
}

export default function Wallet() {
  const wallet = useWallet();
  const navigate = useNavigate();
  const methodsRef = useRef(null);

  const active = wallet.status !== "error";

  return (
    <section className="payment-page wallet-page" data-state="wallet-page">
      <div className="wl">
        <header className="wl-head">
          <div className="min-w-0">
            <h1 className="wl-title">مشترياتي</h1>
            <p className="wl-sub">إدارة دوراتك ومتابعة عمليات الشراء والدفع بسهولة</p>
          </div>
          <span className={"wl-status" + (active ? "" : " is-off")}>
            <span className="wl-status-dot" aria-hidden="true"></span>
            {active ? "الشراء متاح" : "الشراء غير متاح حاليًا"}
          </span>
        </header>

        <BalanceCard wallet={wallet} onBrowse={() => navigate("/dashboard/courses")} />

        {/* right column: how a purchase works, then the methods; left: the purchases */}
        <div className="wl-grid">
          <div className="wl-col">
            <WalletCard id="wlSteps" icon="steps" title="كيف تتم عملية شراء الدورة؟" className="wl-how">
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
                <b>ملاحظة:</b> لا تُحتسب عملية الشراء مكتملة ولا يتم تفعيل الدورة قبل تأكيد الدفع.
              </p>
            </WalletCard>

            <WalletCard id="wlMethods" icon="methods" title="اختر طريقة الدفع" sub="اختر الطريقة المناسبة لإتمام شراء الدورة." className="wl-recharge" ref={methodsRef}>
              <div className="wl-methods">
                {METHODS.map((m) => {
                  const Icon = METHOD_ICONS[m.id];
                  return (
                    <button key={m.id} type="button" className={"wl-method" + (m.featured ? " is-featured" : "")} data-method={m.id} aria-label={`${m.cta} — ${m.subtitle}`} onClick={() => navigate(`/dashboard/courses?pay=${m.id}`)}>
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
            </WalletCard>
          </div>

          <div className="wl-col">
            <WalletCard id="wlTransfers" icon="transfers" title="جميع عمليات الشراء" sub="الدورات التي اشتريتها وحالة كل عملية.">
              <WalletList wallet={wallet} render={(w) => <WalletTransfers items={toTransfers(w)} />} />
            </WalletCard>
          </div>
        </div>
      </div>

    </section>
  );
}
