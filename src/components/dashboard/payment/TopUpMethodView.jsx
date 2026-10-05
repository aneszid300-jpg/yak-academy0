import { PAYMENT_FOOTNOTE } from "../../../config/paymentConfig.js";
import CcpTopUp from "./CcpTopUp.jsx";
import SlickPayTopUp from "./SlickPayTopUp.jsx";
import BaridiMobTopUp from "./BaridiMobTopUp.jsx";
import TopUpMethods from "./TopUpMethods.jsx";
import { ArrowBackIcon, METHOD_ICONS, ShieldIcon } from "./icons.jsx";

// Wallet top-up views, shared by the course details window and «محفظتي»,
// rendered inside a .course-modal-card:
//   <TopUpChooserView>  «شحن المحفظة» — the list of methods
//   <TopUpMethodView>   one method screen (header + its form + footnote), wide
//   method   "ccp" | "slickpay" | "baridimob"
//   course   the course being bought, or null for a «محفظتي» top-up
//   price    the course's Price (fixed amount), or null → typed amount
//   onBack   optional ← button; onClose ×
export const METHOD_VIEWS = {
  ccp: { title: "حوالة بريدية (CCP)", subtitle: "إيداع يدوي عبر مركز البريد", tone: "amber", Icon: METHOD_ICONS.ccp, Screen: CcpTopUp },
  slickpay: { title: "الدفع الإلكتروني", subtitle: "بطاقة CIB أو الذهبية عبر Slick-Pay", tone: "blue", Icon: METHOD_ICONS.slickpay, Screen: SlickPayTopUp },
  baridimob: { title: "BaridiMob", subtitle: "تحويل من تطبيق BaridiMob", tone: "green", Icon: METHOD_ICONS.baridimob, Screen: BaridiMobTopUp },
};

export default function TopUpMethodView({ method, course = null, price = null, onBack, onClose }) {
  const view = METHOD_VIEWS[method];
  return (
    <div className="course-modal-main" key={method}>
      <header className="course-modal-head is-stacked">
        <div className="course-modal-bar">
          {onBack && (
            <button type="button" className="course-modal-close" aria-label="رجوع" onClick={onBack}>
              <ArrowBackIcon width={14} height={14} />
            </button>
          )}
          <span className="course-modal-kicker">YAK WALLET</span>
          <button type="button" className="course-modal-close course-modal-bar-end" aria-label="إغلاق" onClick={onClose}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="course-modal-title-row">
          <span className={`pay-tile tone-${view.tone}`}><view.Icon /></span>
          <div className="min-w-0">
            <h2 className="course-modal-title" id="courseModalTitle">{view.title}</h2>
            <p className="course-modal-sub">{view.subtitle}</p>
          </div>
        </div>
      </header>
      <div className="course-modal-body is-flush">
        <view.Screen course={course} price={price} />
      </div>
      <footer className="course-modal-note">
        <ShieldIcon />
        {PAYMENT_FOOTNOTE}
      </footer>
    </div>
  );
}

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export function TopUpChooserView({ onChoose, onClose }) {
  return (
    <div className="course-modal-main" key="topup">
      <header className="course-modal-head">
        <div className="min-w-0">
          <div className="course-modal-kicker">YAK WALLET</div>
          <h2 className="course-modal-title" id="courseModalTitle">شحن المحفظة</h2>
          <p className="course-modal-sub">حدد الطريقة المناسبة لشحن محفظتك</p>
        </div>
        <button type="button" className="course-modal-close" aria-label="إغلاق" onClick={onClose}>
          <CloseIcon />
        </button>
      </header>
      <div className="course-modal-body">
        <TopUpMethods onChoose={onChoose} />
      </div>
      <footer className="course-modal-note">
        <ShieldIcon />
        {PAYMENT_FOOTNOTE}
      </footer>
    </div>
  );
}
