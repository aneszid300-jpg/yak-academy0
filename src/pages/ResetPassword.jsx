import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useBodyScope } from "../hooks/useBodyScope.js";
import {
  AuthBackground,
  AuthFooter,
  Field,
  Spinner,
  StrengthMeter,
  inputClass,
  passwordStrength,
} from "../components/auth/RegisterParts.jsx";

// Replaces the missing legacy reset-password.html.
// The email link from login's "نسيت كلمة المرور؟" lands here; the Supabase
// client reads the recovery token from the URL and opens a session, then the
// user sets a new password with updateUser().

function resetErrorMessage(error) {
  const message = String(error?.message || "").toLowerCase();
  if (message.includes("different from the old password")) return "كلمة المرور الجديدة لازم تكون مختلفة عن القديمة.";
  if (message.includes("password should be at least")) return "كلمة المرور قصيرة جداً.";
  if (message.includes("rate limit")) return "تم تجاوز عدد المحاولات. حاول بعد قليل.";
  return "تعذر تغيير كلمة المرور. حاول مرة أخرى.";
}

// Supabase appends ?error=… / #error=… when the link is expired or invalid.
function linkErrorFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return params.get("error") || hash.get("error");
}

export default function ResetPassword() {
  useBodyScope("yak-scope-register");
  const { session, loading, updatePassword } = useAuth();
  const navigate = useNavigate();

  const linkError = useMemo(linkErrorFromUrl, []);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ password: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState(null);

  const strength = passwordStrength(password);
  const linkValid = !linkError && Boolean(session);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);

    const next = {
      password: password.length < 8,
      confirm: confirm !== password,
    };
    setErrors(next);
    if (next.password || next.confirm) return;

    setSubmitting(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        console.error("❌ Update password error:", error);
        setMessage({ type: "error", text: resetErrorMessage(error) });
        return;
      }
      setDone(true);
      setMessage({ type: "success", text: "تم تغيير كلمة المرور بنجاح. سيتم تحويلك..." });
      setTimeout(() => navigate("/dashboard", { replace: true }), 1000);
    } catch (error) {
      console.error("❌ Unexpected update password error:", error);
      setMessage({ type: "error", text: "حدث خطأ غير متوقع. حاول مرة أخرى." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AuthBackground />

      <main className="flex min-h-screen items-center justify-center px-5 py-[60px] max-[680px]:px-3.5 max-[680px]:py-[35px]">
        <section className="w-[min(500px,100%)] animate-[yak-card-appear_.45s_ease_both] rounded-(--radius-card) border border-card-border bg-card-bg p-[42px] shadow-(--shadow-card) backdrop-blur-[20px] max-[680px]:rounded-[22px] max-[680px]:px-[22px] max-[680px]:py-[30px] max-[420px]:px-[18px] max-[420px]:py-[26px]">
          <div className="mb-[30px] text-center">
            <div className="inline-flex items-center gap-[7px] text-[11px] font-extrabold text-primary-violet before:size-1.5 before:rounded-full before:bg-sunlit-yellow before:content-['']">
              Yak Academy
            </div>
            <h1 className="mt-[9px] text-[28px] leading-[1.35] font-extrabold tracking-[-0.7px] max-[680px]:text-[24px]">
              تغيير كلمة المرور
            </h1>
            <p className="mt-2 text-[12px] leading-[1.9] text-text-muted">
              أدخل كلمة مرور جديدة لحسابك.
            </p>
          </div>

          {loading && !linkError ? (
            <div className="flex justify-center py-6">
              <Spinner className="size-6! border-card-border border-t-primary-violet" />
            </div>
          ) : !linkValid ? (
            <div
              role="alert"
              className="flex items-start gap-[9px] rounded-[11px] border border-[rgba(214,69,69,.12)] bg-danger-bg px-[13px] py-[11px] text-[10px] leading-[1.7] font-semibold text-danger"
            >
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>
                رابط تغيير كلمة المرور غير صالح أو انتهت صلاحيته. ارجع لصفحة تسجيل الدخول واطلب رابطاً جديداً.
              </span>
            </div>
          ) : (
            <form className="flex flex-col gap-[17px]" onSubmit={handleSubmit} noValidate>
              <Field
                id="passwordField"
                label="كلمة المرور الجديدة"
                icon="fa-solid fa-lock"
                error={errors.password}
                errorText="كلمة المرور يجب أن تكون 8 أحرف على الأقل."
                after={<StrengthMeter strength={strength} />}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((x) => ({ ...x, password: false }));
                    setMessage(null);
                  }}
                  className={inputClass(errors.password, "pl-[50px]!")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="إظهار كلمة المرور"
                  className="absolute top-1/2 left-3 grid size-[30px] -translate-y-1/2 cursor-pointer place-items-center rounded-lg bg-transparent text-text-light transition-colors duration-[250ms] ease-[ease] hover:bg-lavender-mist hover:text-primary-violet"
                >
                  <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
                </button>
              </Field>

              <Field
                id="confirmField"
                label="تأكيد كلمة المرور"
                icon="fa-solid fa-lock"
                error={errors.confirm}
                errorText="كلمتا المرور غير متطابقتين."
              >
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirm"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setErrors((x) => ({ ...x, confirm: false }));
                    setMessage(null);
                  }}
                  className={inputClass(errors.confirm)}
                />
              </Field>

              {message && (
                <div
                  role="alert"
                  className={
                    "flex items-start gap-[9px] rounded-[11px] border px-[13px] py-[11px] text-[10px] leading-[1.7] font-semibold " +
                    (message.type === "success"
                      ? "border-[rgba(34,160,107,.12)] bg-success-bg text-success"
                      : "border-[rgba(214,69,69,.12)] bg-danger-bg text-danger")
                  }
                >
                  <i className={"fa-solid " + (message.type === "success" ? "fa-circle-check" : "fa-circle-exclamation")}></i>
                  <span>{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || done}
                className="mt-[3px] inline-flex h-[50px] w-full cursor-pointer items-center justify-center gap-[9px] rounded-(--radius-btn) bg-[linear-gradient(135deg,var(--primary-violet),var(--electric-violet))] text-[12px] font-extrabold text-white shadow-[0_9px_24px_rgba(91,58,166,.20)] transition-[transform,box-shadow,opacity] duration-[250ms] ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_13px_30px_rgba(91,58,166,.27)] active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-[.68] disabled:shadow-none"
              >
                {submitting ? (
                  <Spinner className="border-[rgba(255,255,255,.35)] border-t-white" />
                ) : (
                  <>
                    <span>حفظ كلمة المرور</span>
                    <i className="fa-solid fa-arrow-left"></i>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-[22px] text-center text-[11px] font-medium text-text-muted">
            <Link to="/login" className="font-extrabold text-primary-violet hover:underline">
              الرجوع لتسجيل الدخول
            </Link>
          </div>
        </section>
      </main>

      <AuthFooter />
    </>
  );
}
