import { useNavigate } from "react-router-dom";
import { COURSE_EXERCISES, EXERCISE_TABS, SAMPLE_PDF } from "../../../data/courses.js";
import StickerNotebook from "../StickerNotebook.jsx";

// «تمارين الدورات» — legacy #coursesViewExercises.
// A sticker (or «معاينة») opens it in the PDF viewer; «تحميل» opens the PDF
// in a new tab, like legacy.
export default function CourseExercises() {
  const navigate = useNavigate();
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
        onOpen={(exercise) => navigate(`/dashboard/pdf/${exercise.id}`, { state: { from: "/dashboard/courses?view=exercises" } })}
        onSolid={() => window.open(SAMPLE_PDF, "_blank", "noopener")}
      />
    </div>
  );
}
