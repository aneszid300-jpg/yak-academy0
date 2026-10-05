import { PaymentError } from "../../services/paymentService.js";

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  Slick-Pay integration — NOT CONNECTED YET.                          ║
// ║  Nothing here talks to Slick-Pay, creates a purchase or a payment.   ║
// ╚══════════════════════════════════════════════════════════════════════╝
//
// Entry point of «إدفع الآن» on the «الدفع الإلكتروني» wallet top-up screen.
// It always fails with PaymentError("unavailable") until the backend exists.
//
// Future flow (to implement when connecting — keep secrets on the backend):
//   1. POST to the backend with { courseId, amount, payer } (courseId null for
//      a «محفظتي» top-up). The backend creates the purchase / top-up (it sets
//      or checks the amount), creates the Slick-Pay invoice with its
//      secret key, and returns { purchaseId, paymentUrl } — paymentUrl is the
//      SATIM hosted page generated for this payment (never hard-coded).
//   2. The frontend redirects: window.location.assign(paymentUrl).
//   3. The student pays on SATIM (3-D Secure if asked) and comes back to
//      /dashboard/payment/return/:purchaseId.
//   4. That page asks the backend for the status; the backend verifies the
//      invoice with Slick-Pay and only then marks the purchase paid / unlocks.
// The UI must never mark anything paid on its own.

/** True once the backend Slick-Pay integration is live. */
export const SLICKPAY_CONNECTED = false;

/**
 * Starts a Slick-Pay payment (a course, or a «محفظتي» top-up when courseId is null).
 * @param {{ courseId: string|null, amount: Price, payer: { firstName, lastName, wilaya, commune, phone } }} request
 * @returns {Promise<{ purchaseId: string, paymentUrl: string }>} — once connected
 */
// eslint-disable-next-line no-unused-vars
export async function requestSlickPayCheckout(request) {
  throw new PaymentError("unavailable", "Slick-Pay integration — not connected yet");
}
