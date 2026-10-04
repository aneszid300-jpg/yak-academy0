import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { COURSE_SECTIONS, SUBJECT_CHIPS } from "../../data/courses.js";
import CourseCard from "../../components/dashboard/courses/CourseCard.jsx";
import { useCoursesAccess } from "../../features/payments/courseAccess.js";
import CourseExercises from "../../components/dashboard/courses/CourseExercises.jsx";

// Courses — migrated from legacy/dashboard.html #page-courses.
// The view comes from the URL: /dashboard/courses (الكل), ?view=my (دوراتي),
// ?view=exercises (تمارين الدورات). «دوراتي» shows only the units the student
// owns (server-side access from paymentService), so a unit appears there as
// soon as its purchase is approved.

const VIEWS = [
  {
    key: "all",
    label: "الكل",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </>
    ),
  },
  { key: "my", label: "دوراتي", icon: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /> },
  {
    key: "exercises",
    label: "تمارين الدورات",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </>
    ),
  },
];

const noDestination = (event) => event.preventDefault();

function viewFromParams(searchParams) {
  const view = searchParams.get("view");
  return view === "my" || view === "exercises" ? view : "all";
}

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = viewFromParams(searchParams);
  const [subject, setSubject] = useState("all");
  const chipsRef = useRef(null);
  const access = useCoursesAccess();

  const setView = (next) => setSearchParams(next === "all" ? {} : { view: next });
  // Legacy arrows: «السابق» (right side) → +200, «التالي» (left side) → −200.
  const scrollChips = (left) => chipsRef.current?.scrollBy({ left, behavior: "smooth" });

  const owns = (course) => Boolean(access.access[course.id]?.hasAccess);
  const visibleSections = COURSE_SECTIONS.filter((section) => subject === "all" || section.key === subject)
    .map((section) => (view === "my" ? { ...section, courses: section.courses.filter(owns) } : section))
    .filter((section) => section.courses.length > 0);
  // «دوراتي» before access is known, or with nothing owned yet.
  const myEmpty =
    view === "my" && visibleSections.length === 0
      ? access.status === "ready" || access.status === "error"
        ? { title: "لا توجد دورات هنا بعد", text: "الوحدات التي تشتريها تظهر هنا مع تقدّمك فيها." }
        : { title: "جاري تحميل دوراتك...", text: "" }
      : null;

  return (
    <section className="courses-page">
      <div className="flex w-full flex-col gap-5">
        {/* ---------- toolbar ---------- */}
        <div className="page-toolbar">
          <div className="search-bar">
            <input type="text" placeholder="ابحث عن درس، مادة أو موضوع..." />
          </div>
          <div className="page-toolbar-actions">
            {VIEWS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={"courses-filter-btn" + (view === item.key ? " active" : "")}
                aria-pressed={view === item.key}
                onClick={() => setView(item.key)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {item.icon}
                </svg>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {view === "exercises" ? (
          <CourseExercises />
        ) : (
          <>
            {/* ---------- subject chips ---------- */}
            <div className="subject-chips-row">
              <button type="button" className="chip-nav-btn" aria-label="السابق" onClick={() => scrollChips(200)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <div className="chips-scroll" ref={chipsRef}>
                {SUBJECT_CHIPS.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    className={(subject === chip.key ? "btn-violet" : "btn-outline") + " subject-chip"}
                    aria-pressed={subject === chip.key}
                    onClick={() => setSubject(chip.key)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <button type="button" className="chip-nav-btn" aria-label="التالي" onClick={() => scrollChips(-200)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>

            {/* ---------- course sections ---------- */}
            <div>
              {myEmpty && (
                <div className="section-card text-center">
                  <div className="section-title">{myEmpty.title}</div>
                  {myEmpty.text && <p className="mt-1.5 mb-4 text-[12.5px] text-text-muted">{myEmpty.text}</p>}
                  {myEmpty.text && (
                    <button type="button" className="btn-violet" onClick={() => setView("all")}>
                      تصفّح كل الدورات
                    </button>
                  )}
                </div>
              )}
              {visibleSections.map((section) => (
                // Legacy: every section after the first has margin-top: 32px, even when filtered.
                <div key={section.key} id={"section-" + section.key} style={section.key !== COURSE_SECTIONS[0].key ? { marginTop: 32 } : undefined}>
                  <div className="unit-section-header">
                    <div className="unit-section-title">
                      <span className="dot" style={section.dot ? { background: section.dot } : undefined}></span>
                      {section.title}
                    </div>
                    <a href="#" className="unit-section-link" onClick={noDestination}>
                      عرض الكل{" "}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </a>
                  </div>
                  <div className="unit-cards-grid">
                    {section.courses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                </div>
              ))}

              {!myEmpty && (
                <div className="mt-6 text-center">
                  <button type="button" className="btn-outline" style={{ padding: "10px 28px", fontSize: 13, borderRadius: 12 }}>
                    عرض المزيد من الدورات ▾
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
