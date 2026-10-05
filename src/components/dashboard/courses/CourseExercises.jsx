import { useNavigate } from "react-router-dom";
import { COURSE_EXERCISES, EXERCISE_TABS, SAMPLE_PDF } from "../../../data/courses.js";
import { unitLock, useCoursesAccess } from "../../../features/payments/courseAccess.js";
import StickerNotebook from "../StickerNotebook.jsx";

// «تمارين الدورات» — legacy #coursesViewExercises.
// A sticker (or «معاينة») opens it in the PDF viewer; «تحميل» opens the PDF
// in a new tab, like legacy.
// Exercises come with their unit (exercise.courseId), like the باك AI decks:
// while the unit is not bought the sticker is locked and leads to that unit's
// checkout; once the purchase is approved, access refreshes (paymentService
// → courseAccess) and the sticker opens. The PDF route's own gate
// (RequireExerciseAccess) covers direct links.
const FROM = "/dashboard/courses?view=exercises";

const EXERCISE_LOCKS = {
  unavailable: { badge: "ستتوفر ضمن دورتها قريباً", action: null },
  review: { badge: "الدورة قيد المراجعة", action: "عرض الطلب" },
  locked: { badge: "متاحة بعد شراء الدورة", action: "انضم للدورة" },
};

export default function CourseExercises() {
  const navigate = useNavigate();
  const access = useCoursesAccess();
  return (
    <div className="library-block">
      <StickerNotebook
        title="تمارين الدورات"
        meta="ملصقات التمارين على دفترك · اضغط للمعاينة أو التحميل"
        badge="ياك · تمارين"
        items={COURSE_EXERCISES}
        tabs={EXERCISE_TABS}
        ghostLabel="معاينة"
        solidLabel="تحميل"
        onOpen={(exercise) => navigate(`/dashboard/pdf/${exercise.id}`, { state: { from: FROM } })}
        onSolid={() => window.open(SAMPLE_PDF, "_blank", "noopener")}
        getLock={(exercise) => EXERCISE_LOCKS[unitLock(exercise.courseId, access)] || null}
        onLocked={(exercise) =>
          navigate(exercise.courseId ? `/dashboard/payment/course/${exercise.courseId}` : `/dashboard/pdf/${exercise.id}`, { state: { from: FROM } })
        }
      />
    </div>
  );
}
