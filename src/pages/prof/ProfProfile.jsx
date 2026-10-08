import { useMyProfessor } from "../../features/prof/useMyProfessor.js";
import { SUBJECT_NAMES } from "../../data/courses.js";
import ProfessorAvatar from "../../components/dashboard/professors/ProfessorAvatar.jsx";
import { coursesCount } from "../../components/prof/ProfParts.jsx";

// ملفي — /prof/profile. The professor's profile as data/professors.js holds
// it, and a preview of how students see them in «أساتذتنا». View only:
// changes go through the Yak team until editing comes with the backend.

const MISSING = "غير مضاف بعد";

export default function ProfProfile() {
  const { professor, courses } = useMyProfessor();
  const subject = SUBJECT_NAMES[professor.subject] || "";
  const fields = [
    ["الاسم", professor.name],
    ["المادة", subject],
    ["التخصص", professor.specialty],
    ["الخبرة", professor.experience],
  ];
  const quals = professor.qualifications || [];

  return (
    <section className="pd-page">
      <div className="pd-profile">
        <div className="section-card">
          <h1 className="section-title">ملفي</h1>
          <dl className="pd-fields">
            {fields.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd className={value ? "" : "is-missing"}>{value || MISSING}</dd>
              </div>
            ))}
          </dl>
          <h2 className="pd-sub">نبذة عنك</h2>
          <p className={"pd-text" + (professor.bio ? "" : " is-missing")}>{professor.bio || MISSING}</p>
          <h2 className="pd-sub">أسلوب التدريس</h2>
          <p className={"pd-text" + (professor.approach ? "" : " is-missing")}>{professor.approach || MISSING}</p>
          <h2 className="pd-sub">المؤهلات</h2>
          {quals.length ? (
            <ul className="pd-quals">
              {quals.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          ) : (
            <p className="pd-text is-missing">{MISSING}</p>
          )}
          <p className="pd-note">لتعديل معلومات ملفك، تواصل مع فريق Yak Academy.</p>
        </div>

        <aside className="section-card" aria-labelledby="pdPreview">
          <h2 id="pdPreview" className="section-title">كيف يراك التلاميذ</h2>
          <p className="pd-text">هكذا تظهر في صفحة «أساتذتنا».</p>
          <div className="pd-preview">
            <ProfessorAvatar professor={professor} size={72} />
            <b>{professor.name}</b>
            {(professor.specialty || subject) && <span className="pd-hero-tag is-light">{professor.specialty || subject}</span>}
            <small>{coursesCount(courses.length)}</small>
          </div>
        </aside>
      </div>
    </section>
  );
}
