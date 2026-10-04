import { useEffect, useId, useRef, useState } from "react";
import { PROOF_UPLOAD } from "../../../config/paymentConfig.js";
import { AlertIcon, CheckIcon, UploadIcon } from "./icons.jsx";

// Validates a picked/dropped file; returns an Arabic message or null.
export function proofFileError(file) {
  if (!file) return "أرفق صورة وصل الدفع.";
  if (!PROOF_UPLOAD.types.includes(file.type)) return `الصيغ المقبولة: ${PROOF_UPLOAD.typesLabel}.`;
  if (file.size > PROOF_UPLOAD.maxBytes) return `حجم الصورة يتجاوز ${PROOF_UPLOAD.maxLabel}.`;
  return null;
}

const formatSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} ميغابايت` : `${Math.max(1, Math.round(bytes / 1024))} كيلوبايت`);

/**
 * Screenshot / receipt photo: drag & drop or tap to pick (camera on phones),
 * preview, change and remove. The file stays in memory until it is submitted.
 */
export default function PaymentProofUpload({ file, onChange, error }) {
  const inputRef = useRef(null);
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pick(next) {
    if (!next) return;
    const problem = proofFileError(next);
    setLocalError(problem);
    onChange(problem ? null : next);
  }

  const shownError = localError || error;
  const open = () => inputRef.current?.click();

  return (
    <div className="payment-field">
      <label htmlFor={id}>صورة وصل الدفع</label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={PROOF_UPLOAD.types.join(",")}
        className="sr-only"
        onChange={(event) => {
          pick(event.target.files?.[0]);
          event.target.value = ""; // allow picking the same file again after removing it
        }}
      />

      {file ? (
        <div className="payment-file">
          {preview && <img className="payment-file-thumb" src={preview} alt="معاينة وصل الدفع" />}
          <div className="payment-file-info">
            <div className="payment-file-name" title={file.name}>{file.name}</div>
            <div className="payment-file-size"><CheckIcon />{formatSize(file.size)} · جاهزة للإرسال</div>
          </div>
          <div className="payment-file-actions">
            <button type="button" className="payment-link-btn" onClick={open}>تغيير</button>
            <button
              type="button"
              className="payment-link-btn is-danger"
              onClick={() => {
                setLocalError(null);
                onChange(null);
              }}
            >
              حذف
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-describedby={`${id}-hint`}
          className={"payment-drop" + (dragging ? " is-dragging" : "") + (shownError ? " is-invalid" : "")}
          onClick={open}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              open();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            pick(event.dataTransfer.files?.[0]);
          }}
        >
          <span className="payment-drop-icon"><UploadIcon /></span>
          <span className="payment-drop-title">
            اسحب صورة الوصل هنا أو <span>اختر صورة</span>
          </span>
          <span className="payment-drop-hint" id={`${id}-hint`}>
            {`${PROOF_UPLOAD.typesLabel} · حتى ${PROOF_UPLOAD.maxLabel}`}
          </span>
        </div>
      )}

      {shownError && <span className="payment-field-error" role="alert"><AlertIcon />{shownError}</span>}
    </div>
  );
}
