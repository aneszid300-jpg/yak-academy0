import { useMemo, useRef, useState } from "react";
import { formatPrice } from "../../../config/paymentConfig.js";
import { ACTIVITY_KINDS } from "../../../features/payments/activity.js";
import YakSelect from "./YakSelect.jsx";
import { METHOD_ICONS, WalletIcon } from "./icons.jsx";
import { METHOD_LABELS, STATUS_CHIPS, formatPayDate } from "./messages.js";

// «سجل المحفظة»: two different lists behind one tab bar —
//   طلبات الشحن      payment requests (method, amount, date, status)
//   جميع التحويلات   balance movements (type, ± amount, date, status)
// «طلبات الشحن» can be filtered by method once it has items; the status filter
// appears only once a tab is long enough. One table component for both tabs;
// each tab only changes which items and which columns are shown.
//   items  ActivityItem[] from features/payments/activity.js

const TABS = [
  {
    id: "topups",
    label: "طلبات الشحن",
    match: (item) => item.kind === ACTIVITY_KINDS.TOPUP,
    columns: ["method", "amount", "date", "status"],
    empty: { title: "لا توجد طلبات شحن بعد", text: "ستظهر هنا طلبات شحن رصيدك عند إجراء أول عملية." },
  },
  {
    id: "transfers",
    label: "جميع التحويلات",
    match: (item) => item.kind === ACTIVITY_KINDS.TRANSFER,
    columns: ["kind", "amount", "date", "status"],
    empty: { title: "لا توجد تحويلات بعد", text: "ستظهر هنا عمليات الإضافة إلى رصيدك والخصم منه." },
  },
];

const HEADERS = { kind: "النوع", amount: "المبلغ", method: "طريقة الدفع", date: "التاريخ", status: "الحالة" };
const TRANSFER_LABELS = { in: "إضافة رصيد", out: "خصم من الرصيد" };
const STATUS_LABELS = { approved: "تم التأكيد" }; // wallet wording; the rest as elsewhere
const METHOD_NAMES = { ...METHOD_LABELS, slickpay: "CIB / الذهبية" };
const METHOD_FILTERS = ["slickpay", "ccp", "baridimob"]; // «طلبات الشحن» method filter
const FILTER_FROM = 8; // the status filter appears only when a tab has at least this many items

function Chip({ status }) {
  const chip = STATUS_CHIPS[status] || STATUS_CHIPS.pending;
  return <span className={`payment-chip tone-${chip.tone}`}>{STATUS_LABELS[status] || chip.label}</span>;
}

function Cell({ column, item }) {
  if (column === "kind") return <span className="wa-kind">{TRANSFER_LABELS[item.direction] || "تحويل"}</span>;
  if (column === "date") return <span className="wa-date">{formatPayDate(item.date)}</span>;
  if (column === "status") return <Chip status={item.status} />;
  if (column === "amount") {
    const sign = item.kind === ACTIVITY_KINDS.TRANSFER ? (item.direction === "in" ? "+" : "−") : "";
    return <span className={"wa-amount" + (sign === "+" ? " is-in" : "")}>{sign + formatPrice(item.amount)}</span>;
  }
  // method
  const Icon = METHOD_ICONS[item.method];
  return (
    <span className="wa-method">
      {Icon && <span className="wa-method-icon"><Icon width={14} height={14} /></span>}
      {METHOD_NAMES[item.method] || "الرصيد"}
    </span>
  );
}

export default function WalletActivity({ items }) {
  const [tabId, setTabId] = useState(TABS[0].id);
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const tabsRef = useRef(null);
  const tab = TABS.find((t) => t.id === tabId);

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.id, items.filter(t.match).length])), [items]);
  const inTab = useMemo(() => items.filter(tab.match), [items, tab]);
  const showStatus = inTab.length >= FILTER_FROM;
  const showMethod = tab.columns.includes("method") && inTab.length > 0;
  const shown = inTab.filter((i) => (!showStatus || !status || i.status === status) && (!showMethod || !method || i.method === method));

  const statusOptions = [{ value: "", label: "كل الحالات" }, ...[...new Set(inTab.map((i) => i.status))].map((s) => ({ value: s, label: STATUS_LABELS[s] || STATUS_CHIPS[s]?.label || s }))];
  const methodOptions = [{ value: "", label: "كل الطرق" }, ...METHOD_FILTERS.map((m) => ({ value: m, label: METHOD_NAMES[m] }))];
  const filtered = (showStatus && status) || (showMethod && method);

  function selectTab(id) {
    setTabId(id);
    setStatus("");
    setMethod("");
  }

  // Arrow keys move between tabs (RTL: ArrowLeft = next).
  function onTabKey(event) {
    const step = { ArrowLeft: 1, ArrowRight: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = TABS[(TABS.findIndex((t) => t.id === tabId) + step + TABS.length) % TABS.length];
    selectTab(next.id);
    tabsRef.current?.querySelector(`#wa-tab-${next.id}`)?.focus();
  }

  return (
    <div className="wa">
      <div className="wa-bar">
        <div className="wa-tabs" role="tablist" aria-label="سجل المحفظة" ref={tabsRef} onKeyDown={onTabKey}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`wa-tab-${t.id}`}
              aria-selected={t.id === tabId}
              aria-controls="wa-panel"
              tabIndex={t.id === tabId ? 0 : -1}
              className={"wa-tab" + (t.id === tabId ? " is-active" : "")}
              onClick={() => selectTab(t.id)}
            >
              {t.label}
              <span className="wa-count" aria-label={`${counts[t.id]} عنصر`}>{counts[t.id]}</span>
            </button>
          ))}
        </div>
        {(showStatus || showMethod) && (
          <div className="wa-filters">
            {showStatus && <YakSelect options={statusOptions} value={status} onChange={setStatus} placeholder="كل الحالات" />}
            {showMethod && <YakSelect options={methodOptions} value={method} onChange={setMethod} placeholder="كل الطرق" />}
          </div>
        )}
      </div>

      <div id="wa-panel" role="tabpanel" aria-labelledby={`wa-tab-${tabId}`}>
        {shown.length === 0 ? (
          <div className="wa-empty">
            <span className="wa-empty-icon"><WalletIcon width={18} height={18} /></span>
            <div className="wa-empty-title">{filtered ? "لا توجد نتائج لهذه التصفية" : tab.empty.title}</div>
            <p className="wa-empty-text">{filtered ? "اختر «كل الطرق» أو حالة أخرى." : tab.empty.text}</p>
          </div>
        ) : (
          <div className="wa-table" role="table" aria-label={tab.label}>
            <div className="wa-tr wa-thead" role="row">
              {tab.columns.map((c) => (
                <span key={c} role="columnheader" className={`wa-c-${c}`}>{HEADERS[c]}</span>
              ))}
            </div>
            {shown.map((item) => (
              <div key={item.id} className="wa-tr" role="row" data-activity={item.id}>
                {tab.columns.map((c) => (
                  <span key={c} role="cell" className={`wa-c-${c}`}><Cell column={c} item={item} /></span>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
