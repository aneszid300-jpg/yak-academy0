// ╔══════════════════════════════════════════════════════════════════════╗
// ║  MOCK / DEVELOPMENT ONLY — NOT A PAYMENT SYSTEM, NOT AUTHORIZATION.   ║
// ║  Simulates the payments backend so the UI can be built and tested.    ║
// ║  Replaced by the real backend adapter (same functions, same shapes).  ║
// ╚══════════════════════════════════════════════════════════════════════╝
//
// • Data lives in this browser tab only (sessionStorage), per signed-in user.
//   Closing the tab forgets everything. Nothing is ever granted permanently.
// • Proof images are NOT stored: only their name/size/type are kept.
// • Slick-Pay is simulated by an internal "gateway" page
//   (/dashboard/payment/mock-gateway/:purchaseId) instead of the real API.
// • The Yak team's review is simulated from the browser console:
//     yakPaymentMock.review("<purchaseId>", "approved" | "rejected", "reason")
//     yakPaymentMock.grant("<courseId>")   // pretend the unit was bought
//     yakPaymentMock.setBalance(1500)       // the student's wallet credit (default 0)
//     yakPaymentMock.reset()
// • Tests can seed the session store directly (key below) — see seedMockPayments.

import { supabase } from "../supabase.js";
import { getCourse } from "../../data/courses.js";
import { PaymentError, PURCHASE_STATUS as S, REVIEW_STATUSES } from "../paymentContract.js";
import { PROOF_UPLOAD } from "../../config/paymentConfig.js";

export const MOCK_STORAGE_KEY = "yak_payment_mock";
const METHODS = ["baridimob", "ccp", "slickpay"];

/* ---------- session store ---------- */

function load() {
  try {
    const data = JSON.parse(sessionStorage.getItem(MOCK_STORAGE_KEY));
    if (data && Array.isArray(data.purchases)) return data;
  } catch {
    // unreadable → start empty
  }
  return { purchases: [] };
}
function save(data) {
  try {
    sessionStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable: keep working for this call only
  }
}

const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());

/* ---------- helpers ---------- */

async function simulate(name) {
  const data = load();
  await new Promise((resolve) => setTimeout(resolve, data.latency ?? 450));
  if (data.fail?.includes(name)) throw new PaymentError("network", `Mock failure: ${name}`);
}

async function currentUserId() {
  const { data } = (await supabase?.auth.getSession()) ?? {};
  const id = data?.session?.user?.id;
  if (!id) throw new PaymentError("unauthenticated");
  return id;
}

function priceOf(contentType, contentId) {
  const course = contentType === "course" ? getCourse(contentId) : null;
  if (!course) return null;
  // Until the backend sends real prices, the unit price comes from the course
  // data (the same «رصيد الدورة» shown on the card), so it is defined once.
  return { amount: Number(course.credit), currency: "DZD" };
}

const now = () => new Date().toISOString();
const newId = () => "mock_" + Math.random().toString(36).slice(2, 10);

// What the UI receives: no user id, no internal mock fields.
const toPublic = (p) => ({
  id: p.id,
  contentType: p.contentType,
  contentId: p.contentId,
  amount: p.amount,
  currency: p.currency,
  paymentMethod: p.paymentMethod,
  status: p.status,
  reference: p.reference ?? null,
  paidOn: p.paidOn ?? null,
  reviewNote: p.reviewNote ?? null,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

function accessFor(purchases, userId, contentType, contentId) {
  const mine = purchases
    .filter((p) => p.userId === userId && p.contentType === contentType && p.contentId === contentId && p.status !== S.CANCELLED)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  const approved = mine.find((p) => p.status === S.APPROVED);
  const latest = approved || mine[0] || null;
  return { hasAccess: Boolean(approved), status: latest ? latest.status : S.NONE, purchase: latest ? toPublic(latest) : null };
}

function ownPurchase(data, userId, purchaseId) {
  const purchase = data.purchases.find((p) => p.id === purchaseId && p.userId === userId);
  if (!purchase) throw new PaymentError("not_found"); // someone else's purchase looks the same as none
  return purchase;
}

/* ---------- adapter ---------- */

export const mockAdapter = {
  name: "mock",

  async getContentPrices(contentType, contentIds) {
    await simulate("getContentPrices");
    return Object.fromEntries(contentIds.map((id) => [id, priceOf(contentType, id)]).filter(([, price]) => price));
  },

  async getContentAccessMap(contentType, contentIds) {
    await simulate("getContentAccessMap");
    const userId = await currentUserId();
    const { purchases } = load();
    return Object.fromEntries(contentIds.map((id) => [id, accessFor(purchases, userId, contentType, id)]));
  },

  async createPurchase(contentType, contentId, paymentMethod) {
    await simulate("createPurchase");
    const userId = await currentUserId();
    const price = priceOf(contentType, contentId);
    if (!price || !METHODS.includes(paymentMethod)) throw new PaymentError("invalid");
    const data = load();
    const access = accessFor(data.purchases, userId, contentType, contentId);
    if (access.hasAccess || REVIEW_STATUSES.includes(access.status)) throw new PaymentError("duplicate");
    // An unfinished attempt is replaced by the new one.
    data.purchases.forEach((p) => {
      if (p.userId === userId && p.contentType === contentType && p.contentId === contentId && p.status === S.PENDING) {
        p.status = S.CANCELLED;
        p.updatedAt = now();
      }
    });
    const purchase = { id: newId(), userId, contentType, contentId, ...price, paymentMethod, status: S.PENDING, createdAt: now(), updatedAt: now() };
    data.purchases.push(purchase);
    save(data);
    return toPublic(purchase);
  },

  async submitManualPayment(purchaseId, { reference, paidOn, note, proofFile } = {}) {
    await simulate("submitManualPayment");
    const userId = await currentUserId();
    const data = load();
    const purchase = ownPurchase(data, userId, purchaseId);
    const validProof = proofFile && PROOF_UPLOAD.types.includes(proofFile.type) && proofFile.size <= PROOF_UPLOAD.maxBytes;
    if (purchase.paymentMethod === "slickpay" || purchase.status !== S.PENDING || !reference?.trim() || !paidOn || !validProof) {
      throw new PaymentError("invalid");
    }
    Object.assign(purchase, {
      status: S.SUBMITTED,
      reference: reference.trim(),
      paidOn,
      note: note?.trim() || null,
      proof: { name: proofFile.name, size: proofFile.size, type: proofFile.type }, // metadata only
      updatedAt: now(),
    });
    save(data);
    return toPublic(purchase);
  },

  async createSlickPayPayment(purchaseId) {
    await simulate("createSlickPayPayment");
    const userId = await currentUserId();
    const purchase = ownPurchase(load(), userId, purchaseId);
    if (purchase.paymentMethod !== "slickpay" || purchase.status !== S.PENDING) throw new PaymentError("invalid");
    // The real backend returns Slick-Pay's hosted payment page URL.
    return { paymentUrl: `/dashboard/payment/mock-gateway/${purchaseId}` };
  },

  async getPurchaseStatus(purchaseId) {
    await simulate("getPurchaseStatus");
    const userId = await currentUserId();
    const data = load();
    const purchase = ownPurchase(data, userId, purchaseId);
    // "Server-side verification": only the (simulated) gateway result counts,
    // never anything in the return URL.
    if (purchase.paymentMethod === "slickpay" && purchase.status === S.PENDING && purchase.gatewayResult) {
      purchase.status = purchase.gatewayResult === "paid" ? S.APPROVED : S.REJECTED;
      purchase.reviewNote = purchase.gatewayResult === "paid" ? null : "لم تكتمل عملية الدفع لدى Slick-Pay.";
      purchase.updatedAt = now();
      save(data);
    }
    return toPublic(purchase);
  },

  async getBalance() {
    await simulate("getBalance");
    await currentUserId();
    return { amount: load().balance ?? 0, currency: "DZD" };
  },

  async getPurchaseHistory() {
    await simulate("getPurchaseHistory");
    const userId = await currentUserId();
    return load()
      .purchases.filter((p) => p.userId === userId)
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0))
      .map(toPublic);
  },

  async cancelPurchase(purchaseId) {
    await simulate("cancelPurchase");
    const userId = await currentUserId();
    const data = load();
    const purchase = ownPurchase(data, userId, purchaseId);
    if (purchase.status !== S.PENDING) throw new PaymentError("invalid");
    purchase.status = S.CANCELLED;
    purchase.updatedAt = now();
    save(data);
    return toPublic(purchase);
  },

  onExternalChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/* ---------- simulated outside world (mock only) ---------- */

// The fake Slick-Pay page reports what "happened" at the gateway.
export async function mockGatewayResult(purchaseId, result /* "paid" | "failed" */) {
  const userId = await currentUserId();
  const data = load();
  const purchase = ownPurchase(data, userId, purchaseId);
  purchase.gatewayResult = result;
  save(data);
}

export async function mockGatewayPurchase(purchaseId) {
  const userId = await currentUserId();
  return toPublic(ownPurchase(load(), userId, purchaseId));
}

// The Yak team's decision on a manual payment.
function review(purchaseId, decision, note) {
  const data = load();
  const purchase = data.purchases.find((p) => p.id === purchaseId);
  if (!purchase || !REVIEW_STATUSES.includes(purchase.status)) return false;
  purchase.status = decision === "approved" ? S.APPROVED : decision === "under_review" ? S.UNDER_REVIEW : S.REJECTED;
  purchase.reviewNote = purchase.status === S.REJECTED ? note || "تعذر العثور على عملية الدفع بالمعلومات المرسلة." : null;
  purchase.updatedAt = now();
  save(data);
  notify();
  return true;
}

export const mockReview = review;

// Console helpers — installed by paymentService only while the mock is the active adapter.
export function installMockDevTools() {
  window.yakPaymentMock = {
    review,
    async grant(courseId) {
      const userId = await currentUserId();
      const data = load();
      const price = priceOf("course", courseId);
      if (!price) return false;
      data.purchases.push({ id: newId(), userId, contentType: "course", contentId: courseId, ...price, paymentMethod: "ccp", status: S.APPROVED, createdAt: now(), updatedAt: now() });
      save(data);
      notify();
      return true;
    },
    setBalance(amount) {
      const data = load();
      data.balance = Math.max(0, Number(amount) || 0);
      save(data);
      notify();
      return true;
    },
    reset() {
      save({ purchases: [] });
      notify();
    },
    state: load,
  };
}
