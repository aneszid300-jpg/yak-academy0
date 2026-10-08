import { useNavigate } from "react-router-dom";
import { COURSE_EXERCISES, EXERCISE_TABS, SAMPLE_PDF, SUBJECT_NAMES, getCourse } from "../../../data/courses.js";
import { isUploadId, publishedExercises, uploadFileUrl } from "../../../services/contentService.js";
import { useClassVersion } from "../../../services/classService.js";
import { unitLock, useCoursesAccess } from "../../../features/payments/courseAccess.js";
import StickerNotebook from "../StickerNotebook.jsx";
import { useCourseCheckout } from "./useCourseCheckout.jsx";

// «تمارين الدورات» — legacy #coursesViewExercises.
// A sticker (or «معاينة») opens it in the PDF viewer; «تحميل» opens the PDF
// in a new tab, like legacy.
// Exercises come with their unit (exercise.courseId), like the باك AI decks:
// while the unit is not bought the sticker is locked and opens that unit's
// purchase window (useCourseCheckout, same as a course card); under review it
// leads to «محفظتي». Once the purchase is approved, access refreshes (paymentService
// → courseAccess) and the sticker opens. The PDF route's own gate
// (RequireExerciseAccess) covers direct links.
const FROM = "/dashboard/courses?view=exercises";

const EXERCISE_LOCKS = {
  unavailable: { badge: "ستتوفر ضمن دورتها قريباً", action: null },
  review: { badge: "الدورة قيد المراجعة", action: "عرض الطلب" },
  locked: { badge: "متاحة بعد شراء الدورة", action: "انضم للدورة" },
};

/** The professors' uploaded exercise files, as stickers (newest first). */
function uploadedStickers() {
  return publishedExercises()
    .map((x) => {
      const course = getCourse(x.courseId);
      return course ? { ...x, subject: course.subjectKey, chip: SUBJECT_NAMES[course.subjectKey] || course.subject } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
}

async function openUpload(id) {
  const url = await uploadFileUrl(id);
  if (url) window.open(url, "_blank", "noopener");
}

export default function CourseExercises() {
  useClassVersion(); // new uploads appear at once
  const navigate = useNavigate();
  const access = useCoursesAccess();
  const checkout = useCourseCheckout(FROM);
  return (
    <div className="library-block">
      <StickerNotebook
        title="تمارين الدورات"
        meta="ملصقات التمارين على دفترك · اضغط للمعاينة أو التحميل"
        badge="ياك · تمارين"
        items={[...uploadedStickers(), ...COURSE_EXERCISES]}
        tabs={EXERCISE_TABS}
        ghostLabel="معاينة"
        solidLabel="تحميل"
        onOpen={(exercise) => navigate(`/dashboard/pdf/${exercise.id}`, { state: { from: FROM } })}
        onSolid={(exercise) => (isUploadId(exercise.id) ? openUpload(exercise.id) : window.open(SAMPLE_PDF, "_blank", "noopener"))}
        getLock={(exercise) => EXERCISE_LOCKS[unitLock(exercise.courseId, access)] || null}
        onLocked={(exercise) => {
          const lock = unitLock(exercise.courseId, access);
          if (lock === "review") navigate("/dashboard/wallet");
          else if (lock === "locked") checkout.open(exercise.courseId);
        }}
      />
      {checkout.modal}
    </div>
  );
}
