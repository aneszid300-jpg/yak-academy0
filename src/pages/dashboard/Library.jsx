import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  BAC_SUBJECTS,
  BAC_YEARS,
  SAMPLE_PDF,
  STREAM_ICONS,
  bacPaperId,
  getBacStreams,
  getBacSubject,
  streamShortName,
} from "../../data/library.js";

// Library (المكتبة) — migrated from legacy/dashboard.html #page-library.
// Legacy's library is «مواضيع البكالوريا» only, three levels deep:
//   /dashboard/library                       subjects
//   /dashboard/library?subject=math          that subject's streams (شعب)
//   /dashboard/library?subject=math&stream=3 that stream's years
// (legacy kept the level in page state; here it's in the URL so refresh and
// Back/Forward work). The two search boxes have no handler, as in legacy.

const backArrow = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default function Library() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  // Legacy had no other library views: any ?view=… goes back to the library.
  if (params.has("view")) return <Navigate to="/dashboard/library" replace />;

  const subject = getBacSubject(params.get("subject"));
  const streams = subject ? getBacStreams(subject.id) : [];
  const streamNumber = parseInt(params.get("stream"), 10);
  const stream = subject && streamNumber >= 1 ? streams[streamNumber - 1] : null;

  const showSubjects = () => setParams({});
  const showStreams = () => setParams({ subject: subject.id });
  // «رجوع» in the PDF viewer comes back to this years list.
  const openPaper = (year) =>
    navigate(`/dashboard/pdf/${bacPaperId(subject.id, streamNumber, year)}`, { state: { from: `/dashboard/library?${params.toString()}` } });

  return (
    <section className="library-page">
      <div className="flex w-full flex-col gap-5">
        {/* ---------- top bar: search + «مواضيع الباك» ---------- */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-(--radius-card) border border-card-border bg-card-bg px-5 py-3 shadow-(--shadow-subtle) backdrop-blur-[12px]">
          <div className="search-bar" style={{ width: 320, maxWidth: "100%" /* phones: legacy fixed 320px clipped at 390 */ }}>
            <input type="text" placeholder="ابحث عن ملف PDF، تمارين أو موضوع باك..." />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" className="courses-filter-btn active" onClick={showSubjects}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              مواضيع الباك
            </button>
          </div>
        </div>

        {!subject && (
          /* ---------- level 1: subjects ---------- */
          <div>
            <div className="bac-notebook">
              <div className="bac-notebook-head">
                <div>
                  <div className="bac-notebook-title">مواضيع البكالوريا</div>
                  <div className="bac-notebook-meta">مواضيع رسمية مع حلول نموذجية · اختر المادة وابدأ التحضير</div>
                </div>
                <span className="bac-notebook-badge">ياك · باك</span>
              </div>
              <div className="bac-stickers">
                {BAC_SUBJECTS.map((s, i) => (
                  <button key={s.id} type="button" className={`bac-sticker color-${i}`} onClick={() => setParams({ subject: s.id })}>
                    <div className="bac-sticker-icon">{s.icon}</div>
                    <div className="bac-sticker-name">{s.name}</div>
                    <div className="bac-sticker-count">{s.count}</div>
                    <span className="bac-sticker-go">استعرض المواضيع</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {subject && !stream && (
          /* ---------- level 2: streams ---------- */
          <div>
            <div className="bac-crumb">
              <button type="button" onClick={showSubjects}>مواضيع الباك</button>
              <span>/</span>
              <span className="current">{subject.name}</span>
            </div>
            <div className="bac-streams-notebook">
              <div className="bac-streams-head">
                <div>
                  <div className="bac-streams-title">{subject.name}</div>
                  <div className="bac-streams-meta">اختر الشعبة باش تشوف المواضيع والحلول حسب تخصصك</div>
                </div>
                <button type="button" className="bac-streams-back" onClick={showSubjects}>
                  {backArrow}
                  رجوع
                </button>
              </div>
              <div className="bac-stream-cards">
                {streams.map((s, i) => (
                  <button key={s.name} type="button" className="bac-stream-card" onClick={() => setParams({ subject: subject.id, stream: String(i + 1) })}>
                    <div className="bac-stream-card-left">
                      <div className="bac-stream-card-icon">{STREAM_ICONS[i % STREAM_ICONS.length]}</div>
                      <div className="bac-stream-card-name">{s.name}</div>
                    </div>
                    <div className="bac-stream-card-right">
                      <span className="bac-stream-card-count">{`${s.count} ملف`}</span>
                      <span className="bac-stream-card-arrow">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="m15 18-6-6 6-6" />
                        </svg>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {subject && stream && (
          /* ---------- level 3: years ---------- */
          <div>
            <div className="bac-crumb">
              <button type="button" onClick={showSubjects}>مواضيع الباك</button>
              <span>/</span>
              <button type="button" onClick={showStreams}>{subject.name}</button>
              <span>/</span>
              <span className="current">{streamShortName(stream.name)}</span>
            </div>
            <div className="bac-years-notebook">
              <div className="bac-years-head">
                <div>
                  <div className="bac-years-title">{subject.name + " — " + streamShortName(stream.name)}</div>
                  <div className="bac-years-meta">مواضيع رسمية + حلول نموذجية حسب السنة</div>
                </div>
                <button type="button" className="bac-streams-back" onClick={showStreams}>
                  {backArrow}
                  رجوع
                </button>
              </div>
              <div className="bac-years-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B8FB5" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input type="text" placeholder="ابحث عن سنة..." />
              </div>
              <div className="bac-year-cards">
                {BAC_YEARS.map((year) => (
                  <div
                    key={year}
                    className="bac-year-card"
                    role="link"
                    tabIndex={0}
                    onClick={() => openPaper(year)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") openPaper(year);
                    }}
                  >
                    <span className="bac-year-card-badge">{`BAC ${year}`}</span>
                    <div className="bac-year-card-title">{"موضوع " + subject.name + " – " + streamShortName(stream.name)}</div>
                    <div className="bac-year-card-actions">
                      <button
                        type="button"
                        className="bac-year-card-sol"
                        onClick={(event) => {
                          event.stopPropagation();
                          openPaper(year);
                        }}
                      >
                        ✓ الحل
                      </button>
                      <button
                        type="button"
                        className="bac-year-card-lock"
                        title="تحميل"
                        onClick={(event) => {
                          // Legacy: download = open the PDF in a new tab.
                          event.stopPropagation();
                          window.open(SAMPLE_PDF, "_blank", "noopener");
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
