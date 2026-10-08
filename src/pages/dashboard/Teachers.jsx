import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SUBJECT_NAMES } from "../../data/courses.js";
import { PROFESSORS, getProfessorCourses } from "../../data/professors.js";
import ProfessorAvatar from "../../components/dashboard/professors/ProfessorAvatar.jsx";
import CourseCard from "../../components/dashboard/courses/CourseCard.jsx";
import CourseRail from "../../components/dashboard/courses/CourseRail.jsx";

// أساتذتنا — /dashboard/teachers. Discover a teacher, then go to their courses.
//   hero       title, one line, the teachers' own faces + real counts
//   subjects   filter, only when it helps (2+ teachers, 2+ subjects)
//   spotlight  the selected teacher: portrait, subjects, bio, facts and their
//              courses (the Courses page's CourseCard: buy / open)
//   roster     every teacher; «استكشف دوراته» puts them in the spotlight and
//              brings their courses into view — no page change
// Data: data/professors.js + each professor's courses (getProfessorCourses).
// Motion: CSS only (opacity/transform), off with prefers-reduced-motion.

const count = (n, [one, two, few, many]) => (n === 1 ? one : n === 2 ? two : n >= 3 && n <= 10 ? `${n} ${few}` : `${n} ${many}`);
const COURSES = ["دورة واحدة", "دورتان", "دورات", "دورة"];

function useTeachers() {
  return useMemo(
    () =>
      PROFESSORS.map((professor) => {
        const courses = getProfessorCourses(professor.id);
        const keys = [...new Set(courses.map((c) => c.subjectKey))];
        if (!keys.length && professor.subject) keys.push(professor.subject);
        return { professor, courses, subjectKeys: keys, subjects: keys.map((k) => SUBJECT_NAMES[k]).filter(Boolean) };
      }).sort((a, b) => b.courses.length - a.courses.length),
    []
  );
}

const Arrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

function Spotlight({ teacher, coursesRef }) {
  const { professor, courses, subjects } = teacher;
  return (
    <article className="tx-spot" key={professor.id} aria-labelledby="txSpotName">
      <div className="tx-spot-top">
        <div className="tx-portrait">
          <ProfessorAvatar professor={professor} size={132} />
        </div>
        <div className="tx-spot-info">
          <span className="tx-kicker">{professor.specialty || "أستاذ في Yak Academy"}</span>
          <h2 className="tx-spot-name" id="txSpotName">{professor.name}</h2>
          {subjects.length > 0 && <p className="tx-spot-subjects">{subjects.join("  ·  ")}</p>}
          {professor.bio && <p className="tx-spot-bio">{professor.bio}</p>}
          <div className="tx-spot-row">
            <span className="tx-spot-fact">
              <b>{courses.length}</b> {courses.length === 1 ? "دورة" : courses.length === 2 ? "دورتان" : courses.length <= 10 ? "دورات" : "دورة"}
            </span>
            <span className="tx-spot-fact">
              <b>{subjects.length}</b> {subjects.length === 1 ? "مادة" : subjects.length === 2 ? "مادتان" : "مواد"}
            </span>
            <Link to={`/dashboard/professors/${professor.id}`} state={{ from: "/dashboard/teachers", tab: "about" }} className="tx-profile-link">
              الملف الكامل
              <Arrow />
            </Link>
          </div>
        </div>
      </div>
      <div className="tx-spot-courses" ref={coursesRef} tabIndex={-1} aria-label={`دورات ${professor.name}`}>
        <div className="tx-spot-courses-head">
          <h3>دوراته</h3>
          <span>{courses.length ? count(courses.length, COURSES) : ""}</span>
        </div>
        {courses.length ? (
          <CourseRail label={`دورات ${professor.name}`}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </CourseRail>
        ) : (
          <p className="tx-none">ستُضاف دورات هذا الأستاذ قريبًا.</p>
        )}
      </div>
    </article>
  );
}

// The whole card is the button: a click shows the teacher in the spotlight
// (with their courses). The «استكشف دوراته» pill is only its visual cue.
function RosterCard({ teacher, active, index, onExplore }) {
  const { professor, courses, subjects } = teacher;
  return (
    <li style={{ "--i": index }} className="tx-member-item">
      <button
        type="button"
        className={"tx-member" + (active ? " is-active" : "")}
        aria-pressed={active}
        aria-label={`${professor.name} — ${subjects.join("، ")} — استكشف دوراته`}
        onClick={active ? undefined : onExplore}
      >
        <span className="tx-member-photo">
          <ProfessorAvatar professor={professor} size={56} />
        </span>
        <span className="tx-member-text">
          <span className="tx-member-name">{professor.name}</span>
          <span className="tx-member-subject">{subjects.join(" · ") || professor.specialty}</span>
          <span className="tx-member-count">{courses.length ? count(courses.length, COURSES) : "دورات قريبًا"}</span>
        </span>
        {active ? (
          <span className="tx-member-now">معروض الآن</span>
        ) : (
          <span className="tx-member-cta" aria-hidden="true">
            استكشف دوراته
            <Arrow />
          </span>
        )}
      </button>
    </li>
  );
}

export default function Teachers() {
  const teachers = useTeachers();
  const [subject, setSubject] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(teachers[0]?.professor.id ?? null);
  const coursesRef = useRef(null);

  const subjectKeys = [...new Set(teachers.flatMap((t) => t.subjectKeys))];
  const totalCourses = new Set(teachers.flatMap((t) => t.courses.map((c) => c.id))).size;
  const q = query.trim();
  const visible = teachers.filter(
    (t) => (subject === "all" || t.subjectKeys.includes(subject)) && (!q || t.professor.name.includes(q) || t.subjects.some((s) => s.includes(q)))
  );
  const spotlight = visible.find((t) => t.professor.id === selectedId) || visible[0];

  const explore = (id) => {
    setSelectedId(id);
    // after the spotlight swaps, bring the courses into view and focus them
    requestAnimationFrame(() => {
      coursesRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
      coursesRef.current?.focus({ preventScroll: true });
    });
  };

  return (
    <section className="professor-page tx-page">
      <header className="tx-hero">
        <div className="tx-hero-text">
          <span className="tx-eyebrow">هيئة التدريس</span>
          <h1 className="tx-title">أساتذتنا</h1>
          <p className="tx-sub">أساتذة يعرفون البكالوريا جيدًا، ويرافقونك درسًا بدرس حتى يوم الامتحان.</p>
        </div>
        {teachers.length > 0 && (
          <div className="tx-hero-side">
            <div className="tx-faces" aria-hidden="true">
              {teachers.slice(0, 5).map((t) => (
                <ProfessorAvatar key={t.professor.id} professor={t.professor} size={40} />
              ))}
            </div>
            <dl className="tx-stats">
              <div><dt>أستاذ</dt><dd>{teachers.length}</dd></div>
              <div><dt>مادة</dt><dd>{subjectKeys.length}</dd></div>
              <div><dt>دورة</dt><dd>{totalCourses}</dd></div>
            </dl>
          </div>
        )}
      </header>

      {/* toolbar: search · subjects · how many teachers are shown */}
      {teachers.length > 0 && (
        <div className="tx-filter">
          <label className="tx-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input type="search" placeholder="ابحث عن أستاذ..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="ابحث عن أستاذ أو مادة" />
          </label>
          {subjectKeys.length > 1 && (
            <div className="tx-chips" role="tablist" aria-label="المادة">
              {[["all", "الجميع"], ...subjectKeys.map((k) => [k, SUBJECT_NAMES[k]])].map(([key, label]) => (
                <button key={key} type="button" role="tab" aria-selected={subject === key} className={"tx-chip" + (subject === key ? " is-active" : "")} onClick={() => setSubject(key)}>
                  {label}
                </button>
              ))}
            </div>
          )}
          <span className="tx-filter-count" aria-live="polite">{count(visible.length, ["أستاذ واحد", "أستاذان", "أساتذة", "أستاذ"])}</span>
        </div>
      )}

      {teachers.length === 0 ? (
        <div className="section-card th-empty">
          <div className="section-title">فريق الأساتذة في الطريق</div>
          <p className="th-empty-text">سيظهر هنا أساتذة Yak Academy ودوراتهم فور إضافتهم.</p>
          <Link to="/dashboard/courses" className="btn-outline">تصفح الدورات</Link>
        </div>
      ) : visible.length === 0 ? (
        <div className="section-card th-empty">
          <div className="section-title">لا يوجد أستاذ بهذا البحث</div>
          <p className="th-empty-text">جرّب اسمًا آخر أو مادة مختلفة.</p>
          <button type="button" className="btn-outline" onClick={() => { setQuery(""); setSubject("all"); }}>عرض كل الأساتذة</button>
        </div>
      ) : (
        <div className={"tx-stage" + (visible.length > 1 ? "" : " is-solo")}>
          <Spotlight key={spotlight.professor.id} teacher={spotlight} coursesRef={coursesRef} />
          {visible.length > 1 && (
            <aside className="tx-roster" aria-labelledby="txRoster">
              <h2 className="tx-roster-title" id="txRoster">
                الأساتذة <span>{visible.length}</span>
              </h2>
              <ul className="tx-roster-list">
                {visible.map((t, i) => (
                  <RosterCard key={t.professor.id} teacher={t} index={i} active={t === spotlight} onExplore={() => explore(t.professor.id)} />
                ))}
              </ul>
            </aside>
          )}
        </div>
      )}
    </section>
  );
}
