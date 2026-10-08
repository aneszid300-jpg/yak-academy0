import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { getPdf } from "../../data/pdfs.js";
import { getUploadedExercise, isUploadId, uploadFileUrl } from "../../services/contentService.js";

// A file a professor uploaded (contentService): its URL is fetched, then freed.
function useUploadedPdf(id) {
  const [url, setUrl] = useState(undefined); // undefined = loading, null = missing
  useEffect(() => {
    if (!isUploadId(id)) return;
    let active = true;
    let made = null;
    uploadFileUrl(id).then((u) => {
      made = u;
      if (active) setUrl(u);
    });
    return () => {
      active = false;
      if (made) URL.revokeObjectURL(made);
    };
  }, [id]);
  if (!isUploadId(id)) return null;
  const file = getUploadedExercise(id);
  if (!file || url === null) return { missing: true };
  return { title: file.title, meta: file.meta, url, loading: url === undefined };
}

// معاينة PDF — migrated from legacy/dashboard.html #page-pdf: the browser's
// own PDF viewer in an iframe, with «فتح في تبويب جديد» and «تحميل» links.
// Legacy used one external sample file for every paper and had no loading,
// error or saved state.

export default function PdfViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const uploaded = useUploadedPdf(id);

  if (!id) return <Navigate to="/dashboard/library" replace />; // legacy had no viewer without a file
  const pdf = uploaded ? (uploaded.missing ? null : uploaded) : getPdf(id);
  if (!pdf) {
    return (
      <section className="pdf-page">
        <div className="section-card text-center">
          <div className="section-title">الملف غير موجود</div>
          <p className="mt-1.5 mb-4 text-[12.5px] text-text-muted">الرابط غير صحيح أو أن الملف لم يعد متوفراً.</p>
          <Link to="/dashboard/library" className="btn-outline inline-block">العودة إلى المكتبة</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="pdf-page">
      <div className="viewer-page-wrap">
        <div className="viewer-topbar">
          {/* Legacy always went back to the Library; here it goes back to where
              the file was opened from (Library or تمارين الدورات). */}
          <button type="button" className="viewer-back-btn" onClick={() => navigate(location.state?.from || "/dashboard/library")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="m9 18 6-6-6-6" />
            </svg>
            رجوع
          </button>
          <div className="viewer-top-title">{pdf.title}</div>
          <div className="viewer-top-meta">{pdf.meta}</div>
        </div>
        <div className="pdf-viewer-card">
          <div className="pdf-viewer-toolbar">
            <div className="pdf-viewer-actions">
              <a className="btn-violet" href={pdf.url} target="_blank" rel="noopener">فتح في تبويب جديد</a>
              <a className="btn-outline" href={pdf.url} target="_blank" rel="noopener" download>تحميل</a>
            </div>
            <span className="viewer-top-meta">{uploaded ? "ملف من الأستاذ" : "ملف تجريبي للمعاينة"}</span>
          </div>
          <div className="pdf-viewer-frame-wrap">
            {pdf.loading ? <div className="pdf-viewer-loading">جاري تحميل الملف...</div> : <iframe title="PDF Viewer" src={pdf.url}></iframe>}
          </div>
        </div>
      </div>
    </section>
  );
}
