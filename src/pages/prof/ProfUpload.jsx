import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMyProfessor } from "../../features/prof/useMyProfessor.js";
import { useUploads } from "../../features/prof/useUploads.js";
import { myFiles } from "../../features/prof/files.js";
import { checkUpload, deleteUpload, isMockContent } from "../../services/contentService.js";
import { PROF_UPLOAD, UPLOAD_KINDS, getUploadKind } from "../../config/contentConfig.js";
import { Empty, FileRow, ICONS } from "../../components/prof/ProfParts.jsx";

// رفع الملفات — /prof/upload. Three plain steps, each opening the next:
//   ① what kind of file (تمارين للطلاب · ملف للـ AI Flashcards)
//   ② for which course (picked already when there is one, or from ?course=)
//   ③ the PDF (drop or pick; PDF only, 20 MB — checked before sending)
// then a clear «تم رفع الملف» with «رفع ملف آخر». Uploads go through
// contentService (development mock until the backend).

const KIND_HELP = {
  exercises: "يظهر للطلاب في قسم «تمارين الدورات».",
  flashcards: "يقرؤه الـ AI ليصنع بطاقات المراجعة للطلاب.",
};

export default function ProfUpload() {
  const { contents } = useMyProfessor();
  const { status, uploads, upload } = useUploads();
  const [params] = useSearchParams();
  const preset = contents.some(({ course }) => course.id === params.get("course")) ? params.get("course") : contents.length === 1 ? contents[0].course.id : "";

  const [kind, setKind] = useState(null);
  const [courseId, setCourseId] = useState(preset);
  const [phase, setPhase] = useState("idle"); // idle | busy | done
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [last, setLast] = useState(null);
  const inputRef = useRef(null);

  const files = myFiles(contents, uploads);
  const course = contents.find((c) => c.course.id === courseId)?.course;
  const ready = Boolean(kind && courseId);

  async function send(file) {
    if (!ready) return;
    const problem = checkUpload(file);
    if (problem) return setError(problem);
    setError(null);
    setPhase("busy");
    try {
      await upload(courseId, kind, file);
      setLast(file.name);
      setPhase("done");
    } catch (e) {
      setError(e?.code === "unavailable" ? "رفع الملفات يتوفر عند ربط الخادم." : "تعذر رفع الملف. حاول مرة أخرى.");
      setPhase("idle");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function again() {
    setPhase("idle");
    setLast(null);
    setKind(null);
    setCourseId(preset);
  }

  return (
    <section className="pd-page">
      <div className="pd-page-head">
        <h1>رفع ملف PDF {isMockContent && <span className="pd-badge is-test">وضع تجريبي</span>}</h1>
        <p>ثلاث خطوات: نوع الملف، الدورة، ثم الملف.</p>
      </div>

      {phase === "done" ? (
        <div className="pd-card pd-done" role="status">
          <span className="pd-done-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <h2>تم رفع الملف</h2>
          <p>
            «{last}» — {getUploadKind(kind).label} · {course?.title}
          </p>
          <p className="pd-muted">
            {kind === "exercises" ? "يظهر الآن لطلاب الدورة في «تمارين الدورات» وفي محتوى الدورة." : "سيصنع منه الـ AI بطاقات المراجعة عند ربط الخادم."}
          </p>
          {isMockContent && <p className="pd-muted">وضع تجريبي: الملف محفوظ في هذا المتصفح فقط.</p>}
          <button type="button" className="pd-btn pd-btn-primary" onClick={again}>
            رفع ملف آخر
          </button>
        </div>
      ) : (
        <div className="pd-card pd-steps">
          {/* ① kind */}
          <div className="pd-step is-open">
            <div className="pd-step-head">
              <span className={"pd-step-num" + (kind ? " is-done" : "")}>1</span>
              <h2>ما نوع الملف؟</h2>
            </div>
            <div className="pd-choices">
              {UPLOAD_KINDS.map((k) => (
                <button key={k.key} type="button" className={"pd-choice" + (kind === k.key ? " is-selected" : "")} aria-pressed={kind === k.key} onClick={() => setKind(k.key)}>
                  <span className={"pd-file-ico is-" + k.key}>{k.key === "flashcards" ? ICONS.spark : ICONS.file}</span>
                  <span className="pd-choice-text">
                    <b>{k.label}</b>
                    <small>{KIND_HELP[k.key]}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ② course */}
          <div className={"pd-step" + (kind ? " is-open" : "")}>
            <div className="pd-step-head">
              <span className={"pd-step-num" + (courseId ? " is-done" : "")}>2</span>
              <h2>لأي دورة؟</h2>
            </div>
            {kind && (
              <div className="pd-choices is-courses">
                {contents.map(({ course: c }) => (
                  <button key={c.id} type="button" className={"pd-choice" + (courseId === c.id ? " is-selected" : "")} aria-pressed={courseId === c.id} onClick={() => setCourseId(c.id)}>
                    <span className="pd-choice-img" style={{ backgroundImage: `url(${c.image})` }} aria-hidden="true" />
                    <span className="pd-choice-text">
                      <b>{c.title}</b>
                      <small>
                        {c.subject} · {c.unit}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ③ file */}
          <div className={"pd-step" + (ready ? " is-open" : "")}>
            <div className="pd-step-head">
              <span className="pd-step-num">3</span>
              <h2>اختر الملف</h2>
            </div>
            {ready && (
              <>
                <label
                  className={"pd-drop" + (dragging ? " is-over" : "") + (phase === "busy" ? " is-busy" : "")}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    send(e.dataTransfer.files?.[0]);
                  }}
                >
                  <span className="pd-drop-icon">{phase === "busy" ? <span className="pd-spinner" /> : ICONS.upload}</span>
                  <span className="pd-drop-title">{phase === "busy" ? "جاري الرفع..." : "اضغط هنا لاختيار الملف"}</span>
                  <span className="pd-drop-desc">
                    أو اسحبه وأفلته هنا · {PROF_UPLOAD.typesLabel} · حتى {PROF_UPLOAD.maxLabel}
                  </span>
                  <input ref={inputRef} type="file" accept=".pdf,application/pdf" disabled={phase === "busy"} onChange={(e) => send(e.target.files?.[0])} />
                </label>
                {error && (
                  <p className="pd-error" role="alert">
                    {error}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <section className="pd-card" aria-labelledby="pdMyFiles">
        <div className="pd-card-head">
          <h2 id="pdMyFiles" className="pd-card-title">ملفاتي</h2>
          <span className="pd-muted">{status === "loading" ? "..." : `${files.length} ملف`}</span>
        </div>
        {files.length ? (
          <div className="pd-files">
            {files.map(({ key, ...f }) => (
              <FileRow
                key={key}
                {...f}
                onDelete={
                  f.upload
                    ? () => window.confirm(`حذف «${f.name}»؟ لن يظهر للطلاب بعد الآن.`) && deleteUpload(f.upload.id)
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <Empty>لم ترفع أي ملف بعد.</Empty>
        )}
      </section>
    </section>
  );
}
