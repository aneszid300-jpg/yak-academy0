import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { SUBJECT_NAMES } from "../../data/courses.js";
import { getProfessor, getProfessorCourses } from "../../data/professors.js";
import CourseCard from "../../components/dashboard/courses/CourseCard.jsx";
import ProfessorAvatar from "../../components/dashboard/professors/ProfessorAvatar.jsx";

// Professor profile — /dashboard/professors/:professorId, opened from a course
// details window. Photo, name, specialty, subject and bio from
// data/professors.js, then the courses they teach (the same CourseCard as the
// Courses page). «رجوع» returns to where the profile was opened from.
export default function Professor() {
  const { professorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const professor = getProfessor(professorId);
  const back = () => navigate(location.state?.from || "/dashboard/courses");

  if (!professor) {
    return (
      <section className="professor-page">
        <div className="section-card text-center">
          <div className="section-title">الأستاذ غير موجود</div>
          <p className="mt-1.5 mb-4 text-[12.5px] text-text-muted">الرابط غير صحيح أو أن صفحة الأستاذ لم تعد متوفرة.</p>
          <Link to="/dashboard/courses" className="btn-outline inline-block">العودة إلى الدورات</Link>
        </div>
      </section>
    );
  }

  const courses = getProfessorCourses(professor.id);
  return (
    <section className="professor-page">
      <div className="viewer-topbar">
        <button type="button" className="viewer-back-btn" onClick={back}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="m9 18 6-6-6-6" />
          </svg>
          رجوع
        </button>
        <div className="viewer-top-title">{professor.name}</div>
        <div className="viewer-top-meta">{professor.subject ? SUBJECT_NAMES[professor.subject] : ""}</div>
      </div>

      <div className="section-card professor-card">
        <ProfessorAvatar professor={professor} size={88} />
        <div className="professor-info">
          <h1 className="professor-name">{professor.name}</h1>
          <div className="professor-tags">
            {professor.specialty && <span className="professor-tag">{professor.specialty}</span>}
            {professor.subject && <span className="professor-tag is-subject">{SUBJECT_NAMES[professor.subject]}</span>}
          </div>
          {professor.bio && <p className="professor-bio">{professor.bio}</p>}
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <span className="section-title">دورات الأستاذ</span>
        </div>
        {courses.length > 0 ? (
          <div className="unit-cards-grid">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-[12.5px] text-text-muted">لا توجد دورات منشورة لهذا الأستاذ بعد.</p>
        )}
      </div>
    </section>
  );
}
