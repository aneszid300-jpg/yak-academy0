import { Link } from "react-router-dom";
import { useMyProfessor } from "../../features/prof/useMyProfessor.js";
import { contentSummary, countOr, Empty, PENDING_NOTE } from "../../components/prof/ProfParts.jsx";
import { courseStats } from "../../services/classService.js";

// دوراتي — /prof/courses. Each course: cover, subject · unit, its registered
// and active students (counts only, no personal data — «—» until the
// backend), what it holds, and a link to its content.
export default function ProfCourses() {
  const { contents } = useMyProfessor();

  return (
    <section className="pd-page">
      <div className="pd-page-head">
        <h1>دوراتي</h1>
        <p>عدد المسجلين، والداخلين خلال آخر 7 أيام، لكل دورة — بدون معلومات شخصية.{courseStats(contents[0]?.course.id) == null && ` (${PENDING_NOTE})`}</p>
      </div>

      {contents.length ? (
        <div className="pd-courses">
          {contents.map(({ course, content }) => (
            <article key={course.id} className="pd-course">
              <div className="pd-course-cover" style={{ backgroundImage: `url(${course.image})` }} aria-hidden="true" />
              <div className="pd-course-body">
                <div className="pd-course-tag">
                  {course.subject} · {course.unit}
                </div>
                <h2 className="pd-course-name">{course.title}</h2>
                <div className="pd-course-stats">
                  <div className="pd-cstat">
                    <div className="pd-cstat-val">{countOr(courseStats(course.id)?.enrolled)}</div>
                    <div className="pd-cstat-lbl">المسجلون</div>
                  </div>
                  <div className="pd-cstat">
                    <div className="pd-cstat-val">{countOr(courseStats(course.id)?.active)}</div>
                    <div className="pd-cstat-lbl">الداخلون</div>
                  </div>
                </div>
                <p className="pd-course-content">{contentSummary(content)}</p>
                <div className="pd-course-foot">
                  <Link to={`/prof/upload?course=${course.id}`} className="pd-btn pd-btn-primary pd-btn-sm">
                    رفع ملف لهذه الدورة
                  </Link>
                  <Link to={`/prof/courses/${course.id}`} className="pd-btn pd-btn-ghost pd-btn-sm">
                    المحتوى
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty>لا توجد دورات مرتبطة بك بعد.</Empty>
      )}
    </section>
  );
}
