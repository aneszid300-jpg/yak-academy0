import { Link, useNavigate } from "react-router-dom";
import { aiRobot } from "../../assets/images/index.js";
import { getCourse } from "../../data/courses.js";
import CourseCard from "../../components/dashboard/courses/CourseCard.jsx";
import { useSubjectSetupPrompt } from "../../features/todos/useSubjectSetupPrompt.js";
import TodoPreview from "../../components/dashboard/home/TodoPreview.jsx";
import SubjectColorsModal from "../../components/dashboard/todos/SubjectColorsModal.jsx";

// Dashboard Home — migrated from legacy/dashboard.html #page-home.
// Figures, courses and the live session are the same hard-coded data as legacy.

const STATS = [
  { className: "stat-lessons", title: "دروس اليوم", icon: "📖", value: "3", unit: "دروس" },
  { className: "stat-streak", title: "السلسلة", icon: "🔥", value: "7", unit: "أيام" },
  { className: "stat-progress", title: "التقدم العام", icon: "📈", value: "78%", sub: "+12% عن الماضي" },
  { className: "stat-bac", title: "باقي على البكالوريا", icon: "📅", value: "18", unit: "يوماً" },
];

// «أحدث الدورات»: the same three courses as legacy (math integration, physics
// electricity, science genetics), shown with the Courses page's CourseCard.
const LATEST_COURSES = ["math-definite-integral", "physics-electric-current", "science-genetics"].map(getCourse);

// Legacy links without a destination yet (the course/lesson pages come later).
const noDestination = (event) => event.preventDefault();

export default function Home() {
  const navigate = useNavigate();

  // First dashboard visit: legacy opens «ثبّت ألوان موادك» after 250 ms.
  const [showSubjectSetup, setShowSubjectSetup] = useSubjectSetupPrompt();

  return (
    <section className="dashboard-home">
      <div className="dashboard-grid">
        <div className="content-column">
          {/* ---------- welcome + stats ---------- */}
          <div className="welcome-hero">
            <div className="hero-header">
              <h1>
                مرحباً بك في{" "}
                <span className="decorated-title-container">
                  ياك
                  <svg className="handdrawn-underline-svg" viewBox="0 0 120 15" fill="none" stroke="#FACC15" strokeWidth="6" strokeLinecap="round">
                    <path d="M 4 5 C 35 2, 85 8, 116 4" />
                    <path d="M 12 11 C 45 9, 75 12, 108 10" />
                  </svg>
                </span>
              </h1>
              <p>كل يوم خطوة صغيرة تقربك من حلمك الكبير.</p>
            </div>

            <div className="stats-row">
              {STATS.map((stat) => (
                <div key={stat.className} className={"stat-card " + stat.className}>
                  <div className="stat-card-top">
                    <div className="stat-title">{stat.title}</div>
                    <div className="stat-icon-wrap">{stat.icon}</div>
                  </div>
                  <div className="stat-value">
                    {stat.value}
                    {stat.unit && <> <span>{stat.unit}</span></>}
                  </div>
                  {stat.sub && <div className="stat-sub">{stat.sub}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* ---------- live session ---------- */}
          <div className="mb-1 flex items-center justify-between gap-3 rounded-2xl border border-hero-border bg-hero-bg px-4 py-3 shadow-(--shadow-subtle) transition-[background,border-color] duration-300">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="rounded-[20px] bg-[#EF4444] px-[9px] py-[3px] text-[10px] font-bold whitespace-nowrap text-white">مباشر</div>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-extrabold text-text-main">جلسة مراجعة شاملة في الفيزياء</div>
                <div className="mt-0.5 text-[11px] text-text-muted">20:00 - 22:00</div>
              </div>
            </div>
            <button type="button" className="btn-violet" style={{ padding: "8px 16px", fontSize: 12, whiteSpace: "nowrap", flexShrink: 0 }}>
              انضم الآن
            </button>
          </div>

          {/* ---------- latest courses ---------- */}
          <div className="section-card">
            <div className="section-header">
              <span className="section-title">أحدث الدورات</span>
              <Link to="/dashboard/courses" className="section-link">
                عرض الكل
              </Link>
            </div>

            <div className="unit-cards-grid">
              {LATEST_COURSES.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>

          {/* ---------- continue learning ---------- */}
          <div className="section-card">
            <div className="section-header">
              <span className="section-title">متابعة التعلم</span>
              <a href="#" className="section-link" onClick={noDestination}>
                عرض كل الدروس
              </a>
            </div>

            <div className="active-course-banner">
              <div className="video-preview">
                <div className="play-btn">▶</div>
              </div>

              <div className="course-details">
                <div className="course-tag">الرياضيات - التكامل • الوحدة 05 - الدوال الأصلية</div>
                <div className="course-name">الدرس 4 من 8: التكامل بالتجزئة والتعويض</div>

                <div className="progress-bar-sm">
                  <div className="progress-fill-sm" style={{ width: "64%" }}></div>
                </div>

                <div className="course-actions-row flex items-center justify-between">
                  <div className="meta-chips">
                    <span>64% مكتمل</span>
                    <span>PDF الملفات</span>
                    <span>12:45 الوقت المتبقي</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="btn-violet">متابعة الدرس</button>
                    <button type="button" className="btn-outline">عرض التفاصيل</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- call to action: courses ---------- */}
          <div className="home-cta flex items-center justify-between gap-4 rounded-(--radius-card) bg-[linear-gradient(135deg,var(--electric-violet)_0%,var(--primary-violet)_100%)] px-6 py-[22px] shadow-[0_6px_20px_rgba(123,79,224,0.25)]">
            <div>
              <div className="mb-1 text-[16px] font-extrabold text-white">استكشف جميع الدورات</div>
              <div className="text-[12.5px] leading-[1.4] text-white/85">أكثر من 40 دورة جاهزة تساعدك تنجح في البكالوريا</div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/dashboard/courses")}
              className="cursor-pointer rounded-xl border-none bg-white px-5 py-[11px] text-[13px] font-extrabold whitespace-nowrap text-primary-violet shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-transform duration-200"
            >
              تصفح الدورات ←
            </button>
          </div>
        </div>

        <div className="content-column">
          {/* ---------- AI assistant ---------- */}
          <div className="ai-suggestion-card ai-dashboard-card">
            <div className="badge-container">
              <span className="ai-card-badge">مساعدك الذكي</span>
            </div>
            <div className="ai-card-body">
              <div className="ai-avatar-box large-avatar">
                <img src={aiRobot} alt="مساعد ياك الذكي" />
              </div>
              <div className="ai-content-box">
                <h2 className="ai-card-title">رفيقك اليومي للنجاح في الباكالوريا</h2>
                <p className="ai-card-desc">اطرح أسئلتك. لخص دروسك. نظّم وقتك بسهولة وسرعة.</p>
                <div className="cta-container">
                  <button type="button" className="btn-violet ai-cta-btn" onClick={() => navigate("/dashboard/ai")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                    </svg>
                    اكتشف ياك AI
                  </button>
                </div>
              </div>
            </div>
          </div>

          <TodoPreview />
        </div>
      </div>

      {showSubjectSetup && <SubjectColorsModal onClose={() => setShowSubjectSetup(false)} />}
    </section>
  );
}
