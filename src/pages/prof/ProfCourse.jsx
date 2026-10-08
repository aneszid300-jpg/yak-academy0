import { Link, Navigate, useParams } from "react-router-dom";
import { useMyProfessor } from "../../features/prof/useMyProfessor.js";
import { countAr, COUNT_WORDS } from "../../features/courses/content.js";
import { contentSummary, Empty } from "../../components/prof/ProfParts.jsx";

// One course of the professor — /prof/courses/:courseId: its lessons, Live
// sessions, QCM and exercise files (features/courses/content.js). Only the
// professor's own courses; any other id goes back to «دوراتي».

const GROUPS = [
  { key: "lessons", title: "الدروس", empty: "لا توجد دروس بعد.", meta: (x) => x.meta },
  { key: "live", title: "جلسات Live", empty: "لا توجد جلسات بعد.", meta: (x) => <bdi dir="ltr">{x.meta}</bdi> },
  { key: "qcm", title: "QCM", empty: "لا توجد أسئلة بعد.", meta: (x) => countAr(x.questions, COUNT_WORDS.qcm) },
  { key: "exercises", title: "ملفات التمارين", empty: "لا توجد ملفات بعد.", meta: (x) => x.meta },
];

export default function ProfCourse() {
  const { courseId } = useParams();
  const { contents } = useMyProfessor();
  const mine = contents.find(({ course }) => course.id === courseId);
  if (!mine) return <Navigate to="/prof/courses" replace />;
  const { course, content } = mine;

  return (
    <section className="pd-page pd-course-page">
      <nav className="pd-crumb" aria-label="مسار التنقل">
        <Link to="/prof/courses">دوراتي</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{course.title}</span>
      </nav>

      <header className="pd-course-hero" style={{ backgroundImage: `url(${course.image})` }}>
        <small>
          {course.subject} · {course.unit}
        </small>
        <h1>{course.title}</h1>
        <span>{contentSummary(content)}</span>
        <Link to={`/prof/upload?course=${course.id}`} className="pd-btn pd-btn-light">
          رفع ملف لهذه الدورة
        </Link>
      </header>

      <div className="pd-grid">
        {GROUPS.map((g) => {
          const items = content?.[g.key] || [];
          return (
            <section key={g.key} className="section-card" aria-labelledby={`pdg-${g.key}`}>
              <div className="pd-card-head">
                <h2 id={`pdg-${g.key}`} className="section-title">{g.title}</h2>
                <span className="pd-count">{items.length}</span>
              </div>
              {items.length ? (
                <ol className="pd-items">
                  {items.map((item, i) => (
                    <li key={item.id}>
                      <span className="pd-items-num">{i + 1}</span>
                      <span className="pd-items-title">{item.title}</span>
                      {g.meta(item) && <small>{g.meta(item)}</small>}
                    </li>
                  ))}
                </ol>
              ) : (
                <Empty>{g.empty}</Empty>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
