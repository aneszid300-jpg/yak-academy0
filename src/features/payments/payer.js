// The student's identity on the wallet top-up screens (CCP, Slick-Pay):
// name, wilaya (official code, data/algeria.js), commune and phone.

export const EMPTY_PAYER = { firstName: "", lastName: "", wilaya: "", commune: "", phone: "" };

const PHONE = /^0[5-7]\d{8}$/;

/** { field: Arabic message } for every invalid payer field; empty when complete. */
export function payerErrors(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = "أدخل الاسم.";
  if (!form.lastName.trim()) errors.lastName = "أدخل اللقب.";
  if (!form.wilaya) errors.wilaya = "اختر الولاية.";
  if (!form.commune.trim()) errors.commune = "أدخل البلدية.";
  if (!PHONE.test(form.phone.replace(/\s/g, ""))) errors.phone = "رقم هاتف غير صحيح (مثال: 0550123456).";
  return errors;
}

/** The payer fields, trimmed, as a request would send them. */
export function cleanPayer(form) {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    wilaya: form.wilaya,
    commune: form.commune.trim(),
    phone: form.phone.replace(/\s/g, ""),
  };
}
