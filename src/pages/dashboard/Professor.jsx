import { useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { SUBJECT_NAMES } from "../../data/courses.js";
import { getProfessor, getProfessorCourses } from "../../data/professors.js";
import { getCourseContent } from "../../features/courses/content.js";
import CourseCard from "../../components/dashboard/courses/CourseCard.jsx";
import ProfessorAvatar from "../../components/dashboard/professors/ProfessorAvatar.jsx";

// الملف الكامل للأستاذ — /dashboard/professors/:professorId.
//   hero   portrait · name · subjects · short bio | real stat tiles
//   tabs   «الدورات (N)» — the Courses page's CourseCard grid
//          «عن الأستاذ»  — bio, approach, qualifications | «إحصائيات» + CTA
// Only data that exists is shown (no ratings or student counts: not in the
// data). Data: data/professors.js by professorId — the same record as
// «أساتذتنا»; content via features/courses/content.js, each item once.

const count = (n, [one, two, few, many]) => (n === 1 ? one : n === 2 ? two : n >= 3 && n <= 10 ? `${n} ${few}` : `${n} ${many}`);
const WORDS = {
  courses: ["دورة واحدة", "دورتان", "دورات", "دورة"],
  lessons: ["درس واحد", "درسان", "دروس", "درسًا"],
  live: ["جلسة واحدة", "جلستان", "جلسات", "جلسة"],
  qcm: ["سؤال واحد", "سؤالان", "أسئلة", "سؤالًا"],
  exercises: ["ملف واحد", "ملفان", "ملفات", "ملفًا"],
};

const Arrow = ({ back }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {back ? <path d="m9 18 6-6-6-6" /> : <path d="M19 12H5M12 19l-7-7 7-7" />}
  </svg>
);

// Everything the professor's courses contain, each item once.
function useProfessorContent(courses) {
  return useMemo(() => {
    const live = new Map();
    const qcm = new Map();
    const exercises = new Map();
    let lessons = 0;
    for (const course of courses) {
      const c = getCourseContent(course.id);
      if (!c) continue;
      lessons += c.lessons.length;
      c.live.forEach((x) => live.set(x.id, { ...x, course: course.title }));
      c.qcm.forEach((x) => qcm.set(x.id, { ...x, course: course.title }));
      c.exercises.forEach((x) => exercises.set(x.id, { ...x, course: course.title }));
    }
    const qcmList = [...qcm.values()];
    return {
      lessons,
      live: [...live.values()],
      qcm: qcmList,
      questions: qcmList.reduce((n, d) => n + d.questions, 0),
      exercises: [...exercises.values()],
    };
  }, [courses]);
}

export default function Professor() {
  const { professorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const professor = getProfessor(professorId);
  const courses = useMemo(() => (professor ? getProfessorCourses(professor.id) : []), [professor]);
  const content = useProfessorContent(courses);
  // «الملف الكامل» (state.tab = "about") opens on «عن الأستاذ»; otherwise «الدورات».
  const [tab, setTab] = useState(location.state?.tab === "about" ? "about" : "courses");
  const contentRef = useRef(null);

  const from = location.state?.from || "/dashboard/teachers";
  const backLabel = from === "/dashboard/teachers" ? "أساتذتنا" : "رجوع";

  if (!professor) {
    return (
      <section className="professor-page pf-page">
        <div className="section-card pf-missing">
          <h1 className="section-title">الأستاذ غير موجود</h1>
          <p>الرابط غير صحيح أو أن صفحة الأستاذ لم تعد متوفرة.</p>
          <Link to="/dashboard/teachers" className="btn-outline">العودة إلى أساتذتنا</Link>
        </div>
      </section>
    );
  }

  const subjectKeys = [...new Set(courses.map((c) => c.subjectKey))];
  if (!subjectKeys.length && professor.subject) subjectKeys.push(professor.subject);
  const subjects = subjectKeys.map((k) => SUBJECT_NAMES[k]).filter(Boolean);
  const qualifications = professor.qualifications || [];

  // Stat tiles (hero) and the «إحصائيات» rows: real counts only, 0 hidden.
  const stats = [
    ["courses", "الدورات", courses.length, WORDS.courses],
    ["lessons", "الدروس", content.lessons, WORDS.lessons],
    ["live", "Live", content.live.length, WORDS.live],
    ["qcm", "أسئلة QCM", content.questions, WORDS.qcm],
    ["exercises", "ملفات التمارين", content.exercises.length, WORDS.exercises],
  ].filter(([, , n]) => n > 0);


  const tabs = [
    { key: "courses", label: "الدورات", n: courses.length },
    { key: "about", label: "عن الأستاذ" },
  ].filter(Boolean);
  const current = tabs.some((t) => t.key === tab) ? tab : "courses";
  const showCourses = () => {
    setTab("courses");
    contentRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };

  return (
    <section className="professor-page pf-page">
      <nav className="pf-crumb" aria-label="مسار التنقل">
        <button type="button" className="pf-back" onClick={() => navigate(from)}>
          <Arrow back />
          {backLabel}
        </button>
        <span aria-hidden="true">/</span>
        <span className="pf-crumb-here" aria-current="page">{professor.name}</span>
      </nav>

      {/* ---------- hero ---------- */}
      <header className="pf-hero">
        <div className="pf-portrait">
          <ProfessorAvatar professor={professor} size={112} />
        </div>
        <div className="pf-hero-info">
          <h1 className="pf-name">{professor.name}</h1>
          {/* the specialty alone («أستاذة رياضيات»); the subjects only when there is none */}
          <div className="pf-tags">
            {professor.specialty ? (
              <span className="pf-tag">{professor.specialty}</span>
            ) : (
              subjects.map((s) => <span key={s} className="pf-tag">{s}</span>)
            )}
          </div>
          {professor.bio && <p className="pf-bio">{professor.bio}</p>}
        </div>
        {stats.length > 0 && (
          <dl className="pf-tiles">
            {stats.slice(0, 3).map(([key, label, n]) => (
              <div key={key} className="pf-tile">
                <dd>{n}</dd>
                <dt>{label}</dt>
              </div>
            ))}
          </dl>
        )}
      </header>

      {/* ---------- tabs ---------- */}
      <div className="pf-tabs" role="tablist" aria-label="ملف الأستاذ" ref={contentRef}>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`pf-tab-${t.key}`}
            aria-selected={current === t.key}
            aria-controls="pf-panel"
            className={"pf-tab" + (current === t.key ? " is-active" : "")}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.n != null && <span>({t.n})</span>}
          </button>
        ))}
      </div>

      <div id="pf-panel" role="tabpanel" aria-labelledby={`pf-tab-${current}`} key={current}>
        {current === "courses" &&
          (courses.length ? (
            <div className="unit-cards-grid">
              {courses.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>
          ) : (
            <p className="pf-none">ستُضاف دورات هذا الأستاذ قريبًا.</p>
          ))}

        {current === "about" && (
          <div className="pf-about-row">
            <section className="pf-card" aria-labelledby="pfAbout">
              <h2 id="pfAbout" className="pf-card-title">عن الأستاذ</h2>
              <p className="pf-about-text">{professor.bio || `${professor.name} من أساتذة Yak Academy.`}</p>
              {professor.experience && (
                <>
                  <h3 className="pf-sub">الخبرة</h3>
                  <p className="pf-about-text">{professor.experience}</p>
                </>
              )}
              {professor.approach && (
                <>
                  <h3 className="pf-sub">أسلوب التدريس</h3>
                  <p className="pf-about-text">{professor.approach}</p>
                </>
              )}
              {qualifications.length > 0 && (
                <>
                  <h3 className="pf-sub">المؤهلات</h3>
                  <ul className="pf-quals">
                    {qualifications.map((q) => <li key={q}>{q}</li>)}
                  </ul>
                </>
              )}
              {subjects.length > 0 && (
                <>
                  <h3 className="pf-sub">المواد</h3>
                  <div className="pf-tags">
                    {subjects.map((s) => <span key={s} className="pf-tag">{s}</span>)}
                  </div>
                </>
              )}
            </section>

            <aside className="pf-card pf-stats" aria-labelledby="pfStats">
              <h2 id="pfStats" className="pf-card-title">إحصائيات</h2>
              {stats.length > 0 ? (
                <dl className="pf-rows">
                  {stats.map(([key, label, n, words]) => (
                    <div key={key}>
                      <dt>{label}</dt>
                      <dd>{count(n, words)}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="pf-none">لا توجد إحصائيات بعد.</p>
              )}
              {courses.length > 0 && (
                <button type="button" className="btn-violet pf-cta" onClick={showCourses}>
                  تصفح دورات الأستاذ
                  <Arrow />
                </button>
              )}
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
