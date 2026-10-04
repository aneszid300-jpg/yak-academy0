import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { getPdf } from "../../data/pdfs.js";

// معاينة PDF — migrated from legacy/dashboard.html #page-pdf: the browser's
// own PDF viewer in an iframe, with «فتح في تبويب جديد» and «تحميل» links.
// Legacy used one external sample file for every paper and had no loading,
// error or saved state.

export default function PdfViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  if (!id) return <Navigate to="/dashboard/library" replace />; // legacy had no viewer without a file
  const pdf = getPdf(id);
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
            <span className="viewer-top-meta">ملف تجريبي للمعاينة</span>
          </div>
          <div className="pdf-viewer-frame-wrap">
            <iframe title="PDF Viewer" src={pdf.url}></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
