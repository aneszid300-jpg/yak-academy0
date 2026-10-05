import { CURRENCY, proofChannelUrl } from "../../../config/paymentConfig.js";

// «إثبات الدفع» of the manual wallet top-up screens (CCP, BaridiMob): the
// student sends the receipt photo to Yak on WhatsApp or Telegram — no upload.
// The chat opens with a short message naming the method, the student, the unit
// and the amount. Channels without a configured account (PROOF_CHANNELS) show
// «قريباً» and do nothing.
//   methodLabel — e.g. "حوالة CCP", "تحويل BaridiMob"
const CHANNELS = [
  { id: "whatsapp", name: "WhatsApp", icon: "fa-brands fa-whatsapp" },
  { id: "telegram", name: "Telegram", icon: "fa-brands fa-telegram" },
];

export default function ProofChannels({ methodLabel, payerName, course, price }) {
  const message = [
    `مرحباً Yak Academy، هذا وصل ${methodLabel}.`,
    payerName && `الاسم: ${payerName}`,
    course && `الدورة: ${course.title}`,
    price && `المبلغ: ${price.amount} ${CURRENCY.label}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="payment-field">
      <span className="ccp-topup-label">إثبات الدفع</span>
      <div className="ccp-proof">
        {CHANNELS.map((channel) => {
          const url = proofChannelUrl(channel.id, message);
          const content = (
            <>
              <span className={`ccp-proof-icon is-${channel.id}`}><i className={channel.icon} aria-hidden="true"></i></span>
              <span className="ccp-proof-text">
                <span className="ccp-proof-title">{`إرسال إثبات الدفع عبر ${channel.name}`}</span>
                <span className="ccp-proof-sub">أرسل صورة وصل الدفع مباشرة لفريق Yak Academy.</span>
              </span>
              {url ? (
                <span className="ccp-proof-go" aria-hidden="true">
                  <i className="fa-solid fa-arrow-left"></i>
                </span>
              ) : (
                <span className="topup-soon">قريباً</span>
              )}
            </>
          );
          return url ? (
            <a key={channel.id} className={`ccp-proof-btn is-${channel.id}`} href={url} target="_blank" rel="noopener noreferrer">
              {content}
            </a>
          ) : (
            <span key={channel.id} className={`ccp-proof-btn is-${channel.id} is-soon`} aria-disabled="true">
              {content}
            </span>
          );
        })}
      </div>
    </div>
  );
}
