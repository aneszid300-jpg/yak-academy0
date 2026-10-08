// Payment service: the ONLY module the UI talks to for prices, access and
// purchases. It delegates to an adapter:
//
//   UI → paymentService → adapter
//                          ├─ mock        (src/services/mock/paymentMock.js, DEVELOPMENT ONLY)
//                          ├─ unavailable (default in production until the backend exists: nothing unlocks)
//                          └─ backend     (to be written by the backend developer; same functions)
//
// Choose it with VITE_PAYMENT_ADAPTER ("mock" | "unavailable"). Default: "mock" in
// `npm run dev`, "unavailable" in production builds, so a mock payment can never
// grant access on a deployed site unless someone opts in explicitly.
//
// Every adapter function is async and resolves to the shapes documented below,
// or throws a PaymentError. Access decisions MUST come from the server: the UI
// never decides that something is paid.

import { PaymentError, PURCHASE_STATUS, REVIEW_STATUSES } from "./paymentContract.js";
import { installMockDevTools, mockAdapter, mockGatewayPurchase, mockGatewayResult, mockGrant, mockReset, mockReview } from "./mock/paymentMock.js";

// Types, statuses and the error class (see paymentContract.js for the shapes).
export { PURCHASE_STATUS, REVIEW_STATUSES, PaymentError } from "./paymentContract.js";

// Fail-closed adapter: used in production until the real backend is connected.
const unavailable = () => {
  throw new PaymentError("unavailable", "Payments backend is not connected yet.");
};
const unavailableAdapter = {
  name: "unavailable",
  getContentPrices: async () => unavailable(),
  getContentAccessMap: async () => unavailable(),
  createPurchase: async () => unavailable(),
  submitManualPayment: async () => unavailable(),
  createSlickPayPayment: async () => unavailable(),
  getPurchaseStatus: async () => unavailable(),
  getPurchaseHistory: async () => unavailable(),
  getBalance: async () => unavailable(),
  cancelPurchase: async () => unavailable(),
};

const ADAPTERS = { mock: mockAdapter, unavailable: unavailableAdapter };
const adapterName = import.meta.env.VITE_PAYMENT_ADAPTER || (import.meta.env.DEV ? "mock" : "unavailable");
const adapter = ADAPTERS[adapterName] || unavailableAdapter;

/** True while the development mock is active (the UI then labels itself as a demo). */
export const isMockPayments = adapter === mockAdapter;

// Tell listeners (e.g. the course access cache) that a purchase changed.
const listeners = new Set();
export const onPaymentChange = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const changed = (value) => {
  listeners.forEach((listener) => listener());
  return value;
};
if (isMockPayments) {
  mockAdapter.onExternalChange(() => changed());
  installMockDevTools();
}

/** Mock only (null otherwise): simulated gateway and Yak-team review, for the demo pages. */
export const devTools = isMockPayments
  ? { review: mockReview, grant: mockGrant, reset: mockReset, gatewayResult: mockGatewayResult, gatewayPurchase: mockGatewayPurchase }
  : null;

/* ---------- public API (the backend contract) ---------- */

/** @returns {Promise<Record<string, Price>>} */
export const getContentPrices = (contentType, contentIds) => adapter.getContentPrices(contentType, contentIds);

/** @returns {Promise<Price>} */
export const getContentPrice = async (contentType, contentId) =>
  (await adapter.getContentPrices(contentType, [contentId]))[contentId];

/** @returns {Promise<Record<string, Access>>} */
export const getContentAccessMap = (contentType, contentIds) => adapter.getContentAccessMap(contentType, contentIds);

/** @returns {Promise<Access>} */
export const getContentAccess = async (contentType, contentId) =>
  (await adapter.getContentAccessMap(contentType, [contentId]))[contentId];

/** Starts a purchase. The server sets the amount; the client never sends a price. @returns {Promise<Purchase>} */
export const createPurchase = async (contentType, contentId, paymentMethod) =>
  changed(await adapter.createPurchase(contentType, contentId, paymentMethod));

/**
 * BaridiMob / CCP proof. The file goes to the backend's private storage, never to localStorage.
 * @param {{ reference: string, paidOn: string, note: string, proofFile: File }} payload
 * @returns {Promise<Purchase>} status "submitted"
 */
export const submitManualPayment = async (purchaseId, payload) =>
  changed(await adapter.submitManualPayment(purchaseId, payload));

/** Server creates the Slick-Pay invoice. @returns {Promise<{ paymentUrl: string }>} */
export const createSlickPayPayment = (purchaseId) => adapter.createSlickPayPayment(purchaseId);

/** Server-verified status (for Slick-Pay the server re-checks the invoice). @returns {Promise<Purchase>} */
export const getPurchaseStatus = async (purchaseId) => changed(await adapter.getPurchaseStatus(purchaseId));

/** @returns {Promise<Purchase>} status "cancelled" */
export const cancelPurchase = async (purchaseId) => changed(await adapter.cancelPurchase(purchaseId));

/** The signed-in student's wallet credit («رصيدك في المحفظة»), set by the server. @returns {Promise<Balance>} */
export const getBalance = () => adapter.getBalance();

/** Every purchase of the signed-in student, newest first. @returns {Promise<Purchase[]>} */
export const getPurchaseHistory = () => adapter.getPurchaseHistory();

/**
 * «محفظتي»: derived on the client from the history, so it can never disagree with it.
 * @returns {Promise<{ units: Array<{ contentId: string, status: string, purchase: Purchase }>,
 *   history: Purchase[], ownedCount: number, reviewCount: number, totalPaid: number, currency: string }>}
 */
export async function getWallet() {
  const history = await getPurchaseHistory();
  // One entry per unit: its approved purchase if any, otherwise its latest attempt.
  const units = new Map();
  for (const purchase of history) {
    if (purchase.status === PURCHASE_STATUS.CANCELLED) continue;
    const current = units.get(purchase.contentId);
    if (!current || (purchase.status === PURCHASE_STATUS.APPROVED && current.status !== PURCHASE_STATUS.APPROVED)) {
      units.set(purchase.contentId, { contentId: purchase.contentId, status: purchase.status, purchase });
    }
  }
  const approved = history.filter((p) => p.status === PURCHASE_STATUS.APPROVED);
  return {
    units: [...units.values()],
    history,
    ownedCount: [...units.values()].filter((u) => u.status === PURCHASE_STATUS.APPROVED).length,
    reviewCount: [...units.values()].filter((u) => REVIEW_STATUSES.includes(u.status)).length,
    totalPaid: approved.reduce((sum, p) => sum + p.amount, 0),
    currency: "DZD",
  };
}
