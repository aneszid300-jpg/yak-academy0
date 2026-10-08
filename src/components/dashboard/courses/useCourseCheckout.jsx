import { useCallback, useEffect, useState } from "react";
import { getCourse } from "../../../data/courses.js";
import { useCoursesAccess } from "../../../features/payments/courseAccess.js";
import CourseDetailsModal from "./CourseDetailsModal.jsx";

// The one way to buy a unit, wherever the student meets it locked — a course
// card, a باك AI deck (QCM), a course exercise, or a locked page (AccessGates):
// it opens the unit's details window (CourseDetailsModal → «اشحن رصيدك» →
// CCP / BaridiMob / Slick-Pay). Price and access come from courseAccess
// (paymentService); nothing here decides access. When the unit's purchase is
// approved, access refreshes (onPaymentChange) and the window closes itself, so
// the content behind it opens without a reload.
//
//   const checkout = useCourseCheckout(from);
//   checkout.open(courseId) … {checkout.modal}
//   from — where «رجوع» on a following page returns to
//   method — a payment method already chosen («محفظتي» → ?pay=), or null
export function useCourseCheckout(from, method = null) {
  const [courseId, setCourseId] = useState(null);
  const all = useCoursesAccess();
  const course = courseId ? getCourse(courseId) : null;
  const owned = Boolean(course && all.access[course.id]?.hasAccess);
  const close = useCallback(() => setCourseId(null), []);

  useEffect(() => {
    if (owned) close();
  }, [owned, close]);

  const modal =
    course && !owned ? <CourseDetailsModal course={course} price={all.prices[course.id] ?? null} from={from} method={method} onClose={close} /> : null;
  return { open: setCourseId, close, modal };
}
