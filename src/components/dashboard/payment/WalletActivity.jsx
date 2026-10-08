import { useState } from "react";
import { formatPrice } from "../../../config/paymentConfig.js";
import YakSelect from "./YakSelect.jsx";
import { METHOD_ICONS, WalletIcon } from "./icons.jsx";
import { METHOD_LABELS, STATUS_CHIPS, formatPayDate } from "./messages.js";

// The two lists of «محفظتي», each its own section, sharing one compact table:
//   <TopUpRequests items>   «طلبات الشحن»     method · amount · date · status
//   <WalletTransfers items> «جميع عمليات الشراء»  course purchases: course · amount · date · status
// Items come from features/payments/activity.js. Long lists show the first
// PREVIEW rows with «عرض الكل».

const PREVIEW = 5;
const STATUS_LABELS = { approved: "تم التأكيد" }; // wallet wording; the rest as elsewhere
const METHOD_NAMES = { ...METHOD_LABELS, slickpay: "CIB / الذهبية" };
const METHOD_FILTERS = ["slickpay", "ccp", "baridimob"];

// Purchase wording for «جميع التحويلات».
const PURCHASE_LABELS = { approved: "مكتملة", submitted: "قيد المراجعة", under_review: "قيد المراجعة", rejected: "مرفوضة", pending: "في انتظار الدفع" };

function Chip({ status, labels = STATUS_LABELS }) {
  const chip = STATUS_CHIPS[status] || STATUS_CHIPS.pending;
  return <span className={`payment-chip tone-${chip.tone}`}>{labels[status] || chip.label}</span>;
}

function Empty({ title, text }) {
  return (
    <div className="wa-empty">
      <span className="wa-empty-icon"><WalletIcon width={18} height={18} /></span>
      <div className="wa-empty-title">{title}</div>
      <p className="wa-empty-text">{text}</p>
    </div>
  );
}

// row(item) → [lead, amount, date, status] cells, laid out as two lines:
// lead + amount on top, date + status below.
const AREAS = ["lead", "amount", "date", "status"];

function List({ label, items, row }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, PREVIEW);
  return (
    <>
      <ul className="wa-table" aria-label={label}>
        {shown.map((item) => (
          <li key={item.id} className="wa-tr">
            {row(item).map((cell, i) => (
              <span key={AREAS[i]} className={`wa-c-${AREAS[i]}`}>{cell}</span>
            ))}
          </li>
        ))}
      </ul>
      {items.length > PREVIEW && (
        <button type="button" className="wa-more" aria-expanded={all} onClick={() => setAll((v) => !v)}>
          {all ? "عرض أقل" : `عرض الكل (${items.length})`}
        </button>
      )}
    </>
  );
}

export function TopUpRequests({ items }) {
  const [method, setMethod] = useState("");
  const shown = method ? items.filter((i) => i.method === method) : items;
  const options = [{ value: "", label: "كل الطرق" }, ...METHOD_FILTERS.map((m) => ({ value: m, label: METHOD_NAMES[m] }))];

  if (items.length === 0) return <Empty title="لا توجد طلبات شحن بعد" text="ستظهر هنا طلبات شحن رصيدك عند إجراء أول عملية." />;
  return (
    <div className="wa">
      <div className="wa-bar">
        <div className="wa-filters">
          <YakSelect options={options} value={method} onChange={setMethod} placeholder="كل الطرق" />
        </div>
      </div>
      {shown.length === 0 ? (
        <Empty title="لا توجد طلبات بهذه الطريقة" text="اختر «كل الطرق» أو طريقة أخرى." />
      ) : (
        <List
          key={method}
          label="طلبات الشحن"
          items={shown}
          row={(item) => {
            const Icon = METHOD_ICONS[item.method];
            return [
              <span className="wa-method">
                {Icon && <span className="wa-method-icon"><Icon width={14} height={14} /></span>}
                {METHOD_NAMES[item.method]}
              </span>,
              <span className="wa-amount">{formatPrice(item.amount)}</span>,
              <span className="wa-date">{formatPayDate(item.date)}</span>,
              <Chip status={item.status} />,
            ];
          }}
        />
      )}
    </div>
  );
}

export function WalletTransfers({ items }) {
  if (items.length === 0) return <Empty title="لا توجد عمليات شراء بعد" text="ستظهر هنا الدورات التي تشتريها على Yak Academy مع حالة كل عملية." />;
  return (
    <List
      label="جميع عمليات الشراء"
      items={items}
      row={(item) => [
        <span className="wa-method">
          {item.image ? <img className="wa-course-thumb" src={item.image} alt="" /> : <span className="wa-method-icon"><WalletIcon width={14} height={14} /></span>}
          <span className="min-w-0">
            <span className="wa-course-name">{`شراء ${item.course}`}</span>
          </span>
        </span>,
        <span className="wa-amount">{formatPrice(item.amount)}</span>,
        <span className="wa-date">
          <bdi>{formatPayDate(item.date)}</bdi> · <bdi dir="ltr">#{item.id}</bdi>
        </span>,
        <Chip status={item.status} labels={PURCHASE_LABELS} />,
      ]}
    />
  );
}
