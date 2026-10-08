import { useEffect, useMemo } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { getCourse, getCourseLessons } from "../../data/courses.js";
import { useCourseProgress } from "../../features/courses/progress.js";
import VideoPlayer from "../../components/dashboard/study/VideoPlayer.jsx";
import { CourseContent } from "../../components/dashboard/courses/CourseContent.jsx";
import { recordVisit } from "../../services/classService.js";

// Study — migrated from legacy/dashboard.html #page-study.
// The lesson comes from the URL (/dashboard/study/:courseId/:lessonId);
// /dashboard/study/:courseId opens the first lesson, as legacy did.
// Progress ("✓ تمّ الدرس") is the student's saved lesson progress
// (features/courses/progress.js), shared with the course cards and «دوراتي».

export default function Study() {
  const { courseId } = useParams();
  // A different course starts from its own state (legacy reset it in openStudyPage).
  return <StudyCourse key={courseId} />;
}

function StudyCourse() {
  const { courseId, lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const course = getCourse(courseId);
  const lessons = useMemo(() => getCourseLessons(courseId), [courseId]);
  const { done, doneCount, total, pct, markDone: saveDone } = useCourseProgress(courseId);

  const index = lessons.findIndex((lesson) => lesson.id === lessonId);

  // Opening the course counts as activity (the professor's «الداخلون»).
  useEffect(() => {
    if (course) recordVisit(course.id);
  }, [course]);


  if (!course) {
    return (
      <NotFound title="الدورة غير موجودة" text="الرابط غير صحيح أو أن الدورة لم تعد متوفرة.">
        <Link to="/dashboard/courses" className="btn-outline inline-block">العودة إلى الدورات</Link>
      </NotFound>
    );
  }
  if (!lessonId) {
    return <Navigate to={`/dashboard/study/${course.id}/${lessons[0].id}`} replace state={location.state} />;
  }
  if (index === -1) {
    return (
      <NotFound title="الدرس غير موجود" text={`هذا الدرس غير متوفر في «${course.title}».`}>
        <div className="flex flex-wrap justify-center gap-2">
          <Link to={`/dashboard/study/${course.id}/${lessons[0].id}`} className="btn-violet inline-block">الذهاب إلى أول درس</Link>
          <Link to="/dashboard/courses" className="btn-outline inline-block">العودة إلى الدورات</Link>
        </div>
      </NotFound>
    );
  }

  const lesson = lessons[index];
  const hint = pct >= 100 ? "أحسنت! أكملت هذه الدورة 🎉" : pct > 0 ? "أحسنت! واصل التقدم لإكمال هذا المقرر" : "ابدأ أول درس لتتبع تقدمك";

  // Keep where the student came from (e.g. ?view=my) for «رجوع للدورات».
  const goToLesson = (i) => {
    const target = lessons[Math.max(0, Math.min(total - 1, i))];
    navigate(`/dashboard/study/${course.id}/${target.id}`, { state: location.state });
  };
  const markDone = () => {
    saveDone(lesson.id);
    if (index < total - 1) goToLesson(index + 1);
  };

  return (
    <section className="study-page">
      <div className="study-page-wrap">
        <div className="study-topbar">
          <div className="study-top-meta">{course.subject}</div>
          <div className="study-top-title">{course.title}</div>
          <button type="button" className="study-back-btn" onClick={() => navigate(location.state?.from || "/dashboard/courses")}>
            رجوع للدورات
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>

        <div className="study-layout">
          <aside className="study-side">
            <div className="study-progress-card">
              <div className="study-progress-head">
                <span className="study-progress-label">تقدمك</span>
                <span className="study-progress-pct">{pct}%</span>
              </div>
              <div className="study-progress-track">
                <div className="study-progress-fill" style={{ width: pct + "%" }}></div>
              </div>
              <p className="study-progress-hint">{hint}</p>
            </div>

            {/* «دروس الدورة»: lessons, Live, QCM, exercises (CourseContent) */}
            <CourseContent courseId={course.id} currentLessonId={lesson.id} done={done} lessonState={location.state} />
          </aside>

          <div className="study-main">
            <VideoPlayer src={lesson.video} />

            <div className="study-lesson-bar">
              <div className="study-lesson-bar-text">
                <div className="study-video-title">{lesson.title}</div>
                <div className="study-video-sub">
                  <span className="study-chip">{course.title}</span>
                  {lesson.duration && <span className="study-chip">⏱ {lesson.duration}</span>}
                  <span className="study-chip">الدرس {index + 1} / {total}</span>
                </div>
              </div>
              <button type="button" className="btn-violet study-done-btn" onClick={markDone}>✓ تمّ الدرس</button>
            </div>

            <div className="study-nav-row">
              <button type="button" className="study-nav-btn" disabled={index <= 0} onClick={() => goToLesson(index - 1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="m9 18 6-6-6-6" />
                </svg>
                السابق
              </button>
              <button type="button" className="study-nav-btn study-nav-btn--next" disabled={index >= total - 1} onClick={() => goToLesson(index + 1)}>
                التالي
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Small not-found card in the existing section-card style.
function NotFound({ title, text, children }) {
  return (
    <section className="study-page">
      <div className="section-card text-center">
        <div className="section-title">{title}</div>
        <p className="mt-1.5 mb-4 text-[12.5px] text-text-muted">{text}</p>
        {children}
      </div>
    </section>
  );
}
