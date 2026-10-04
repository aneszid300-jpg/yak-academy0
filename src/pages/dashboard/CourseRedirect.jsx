import { Link, Navigate, useParams } from "react-router-dom";
import { getCourse } from "../../data/courses.js";

// Legacy had no course-detail view: opening a course went straight to its
// study page. /dashboard/courses/:courseId therefore forwards there.
export default function CourseRedirect() {
  const { courseId } = useParams();
  const course = getCourse(courseId);

  if (course) return <Navigate to={`/dashboard/study/${course.id}`} replace />;

  return (
    <section className="courses-page">
      <div className="section-card text-center">
        <div className="section-title">الدورة غير موجودة</div>
        <p className="mt-1.5 mb-4 text-[12.5px] text-text-muted">الرابط غير صحيح أو أن الدورة لم تعد متوفرة.</p>
        <Link to="/dashboard/courses" className="btn-outline inline-block">
          العودة إلى الدورات
        </Link>
      </div>
    </section>
  );
}
