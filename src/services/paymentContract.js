// Shared payment vocabulary for the service, its adapters and the UI.

/**
 * @typedef {"course"} ContentType   Only units (courses) are sold; flashcards come with their unit.
 * @typedef {"baridimob"|"ccp"|"slickpay"} PaymentMethod
 * @typedef {"pending"|"submitted"|"under_review"|"approved"|"rejected"|"cancelled"} PurchaseStatus
 *
 * @typedef {Object} Price        { amount: number, currency: "DZD" }
 * @typedef {Object} Balance      { amount: number, currency: "DZD" }   the student's wallet credit
 * @typedef {Object} Access       { hasAccess: boolean, status: PurchaseStatus|"none", purchase: Purchase|null }
 * @typedef {Object} Purchase
 * @property {string} id
 * @property {ContentType} contentType
 * @property {string} contentId
 * @property {number} amount
 * @property {string} currency
 * @property {PaymentMethod} paymentMethod
 * @property {PurchaseStatus} status
 * @property {string|null} reference      payer's transaction number (manual methods)
 * @property {string|null} paidOn         YYYY-MM-DD (manual methods)
 * @property {string|null} reviewNote     reason shown to the student when rejected
 * @property {string} createdAt           ISO date
 * @property {string} updatedAt           ISO date
 */

export const PURCHASE_STATUS = {
  NONE: "none",
  PENDING: "pending", // created, waiting for the student to pay (Slick-Pay)
  SUBMITTED: "submitted", // proof sent (BaridiMob / CCP), waiting for the Yak team
  UNDER_REVIEW: "under_review", // the Yak team is checking it
  APPROVED: "approved", // verified by the server: the unit is unlocked
  REJECTED: "rejected",
  CANCELLED: "cancelled",
};

export const REVIEW_STATUSES = [PURCHASE_STATUS.SUBMITTED, PURCHASE_STATUS.UNDER_REVIEW];

export class PaymentError extends Error {
  /** @param {"unavailable"|"network"|"not_found"|"duplicate"|"invalid"|"unauthenticated"} code */
  constructor(code, message) {
    super(message || code);
    this.name = "PaymentError";
    this.code = code;
  }
}
