import { Link } from "react-router-dom";
import { useMyProfessor } from "../../features/prof/useMyProfessor.js";
import { useUploads } from "../../features/prof/useUploads.js";
import { myFiles } from "../../features/prof/files.js";
import { dayAr, dayLabel, scheduleDays, useNow } from "../../features/prof/schedule.js";
import { SUBJECT_NAMES } from "../../data/courses.js";
import { sessionDuration, startsIn } from "../../features/live/status.js";
import { contentSummary, countOr, Empty, FileRow, ICONS, LivePill, PENDING_NOTE, StartButton, StatCard, statsFor, TimeRange } from "../../components/prof/ProfParts.jsx";
import { courseStats } from "../../services/classService.js";

// لوحة الأستاذ — /prof. Simple first: a greeting, the next session with its
// «بدء الجلسة», the three things a professor comes to do (upload a file, see
// the courses, see the sessions), then the numbers, the courses and the
// latest files. Student numbers show «—» until the backend exists.

const ACTIONS = [
  { to: "/prof/upload", icon: ICONS.upload, title: "رفع ملف PDF", text: "تمارين للطلاب أو ملف للـ AI Flashcards.", primary: true },
  { to: "/prof/courses", icon: ICONS.book, title: "دوراتي", text: "محتوى كل دورة وعدد المسجلين." },
  { to: "/prof/sessions", icon: ICONS.calendar, title: "الجلسات", text: "جدول جلساتك المباشرة." },
];

export default function ProfHome() {
  const { professor, contents, sessions } = useMyProfessor();
  const { uploads } = useUploads();
  const now = useNow();

  const first = professor.name.split(/\s+/)[0];
  const next = scheduleDays(sessions, now, 7)
    .flatMap((d) => d.items)
    .find((o) => o.status.key !== "ended");
  const files = myFiles(contents, uploads);
  const totals = statsFor(contents.map(({ course }) => course.id));
  const subjects = [...new Set(contents.map(({ course }) => SUBJECT_NAMES[course.subjectKey]))].join(" + ");

  return (
    <section className="pd-page">
      <header className="pd-welcome">
        <h1>مرحباً أ. {first}</h1>
        <p>{dayAr(now, true)}</p>
      </header>

      {/* the next session, first thing */}
      {next ? (
        <section className={"pd-next" + (next.status.key === "live" ? " is-live" : "")} aria-labelledby="pdNextTitle">
          <div className="pd-next-info">
            <span className="pd-next-kicker">{next.status.key === "live" ? <LivePill>مباشر الآن</LivePill> : "جلستك القادمة"}</span>
            <h2 id="pdNextTitle">{next.session.title}</h2>
            <p>
              {dayLabel(next.day, now)} · <TimeRange session={next.session} /> · {sessionDuration(next.session)}
              {next.status.key === "soon" && !next.status.farOff && <> · {startsIn(next.status.minutesToStart)}</>}
            </p>
          </div>
          <div className="pd-next-action">
            <StartButton session={next.session} small={false} />
            {!next.session.provider?.joinUrl ? (
              <small>رابط Zoom لم يُضف بعد</small>
            ) : (
              !next.status.canJoin && <small>يفتح قبل البداية بـ 10 دقائق</small>
            )}
          </div>
        </section>
      ) : (
        <section className="pd-next is-empty">
          <div className="pd-next-info">
            <span className="pd-next-kicker">جلستك القادمة</span>
            <h2>لا توجد جلسات في الأيام القادمة</h2>
          </div>
        </section>
      )}

      {/* what a professor comes to do */}
      <nav className="pd-actions" aria-label="ماذا تريد أن تفعل؟">
        {ACTIONS.map((a) => (
          <Link key={a.to} to={a.to} className={"pd-action" + (a.primary ? " is-primary" : "")}>
            <span className="pd-action-icon">{a.icon}</span>
            <span className="pd-action-text">
              <b>{a.title}</b>
              <small>{a.text}</small>
            </span>
          </Link>
        ))}
      </nav>

      <div className="pd-stats">
        <StatCard label="دوراتي" icon={ICONS.book} value={contents.length} sub={subjects} />
        <StatCard label="إجمالي المسجلين" icon={ICONS.users} value={countOr(totals?.enrolled)} sub={totals ? `${totals.active} دخلوا هذا الأسبوع` : PENDING_NOTE} />
        <StatCard label="ملفاتي" icon={ICONS.file} value={files.length} sub="تمارين + Flashcards" />
        <StatCard label="جلساتي" icon={ICONS.live} value={sessions.length} sub={sessions.some((s) => !s.date) ? "منها جلسة يومية" : "جلسات مباشرة"} />
      </div>

      <div className="pd-grid">
        <section className="pd-card" aria-labelledby="pdSummary">
          <div className="pd-card-head">
            <h2 id="pdSummary" className="pd-card-title">دوراتي</h2>
            <Link to="/prof/courses" className="pd-link">عرض الكل</Link>
          </div>
          {contents.length ? (
            <ul className="pd-summary">
              {contents.map(({ course, content }) => (
                <li key={course.id}>
                  <Link to={`/prof/courses/${course.id}`} className="pd-summary-row">
                    <span className="pd-summary-img" style={{ backgroundImage: `url(${course.image})` }} aria-hidden="true" />
                    <span className="pd-summary-info">
                      <b>{course.title}</b>
                      <small>{contentSummary(content)}</small>
                    </span>
                    <span className="pd-summary-num">
                      <b>{countOr(courseStats(course.id)?.enrolled)}</b>
                      <small>مسجل</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>لا توجد دورات مرتبطة بك بعد.</Empty>
          )}
        </section>

        <section className="pd-card" aria-labelledby="pdFiles">
          <div className="pd-card-head">
            <h2 id="pdFiles" className="pd-card-title">آخر الملفات</h2>
            <Link to="/prof/upload" className="pd-link">رفع ملف</Link>
          </div>
          {files.length ? (
            <div className="pd-files">
              {files.slice(0, 4).map(({ key, ...f }) => (
                <FileRow key={key} {...f} />
              ))}
            </div>
          ) : (
            <Empty>لم ترفع أي ملف بعد.</Empty>
          )}
        </section>
      </div>
    </section>
  );
}
