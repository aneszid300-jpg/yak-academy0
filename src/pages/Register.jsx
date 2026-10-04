import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useTheme } from "../hooks/useTheme.js";
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

/* ---------- validation (same rules as legacy/register.html) ---------- */
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidPhone = (value) => /^[567]\d{8}$/.test(value);

// Arabic messages — same wording as legacy/register.html.
function registerErrorMessage(error) {
  const message = String(error?.message || "").toLowerCase();
  if (message.includes("user already registered")) return "هذا البريد الإلكتروني مسجل من قبل. جرّب تسجيل الدخول.";
  if (message.includes("password should be at least")) return "كلمة المرور قصيرة جداً.";
  if (message.includes("invalid email")) return "البريد الإلكتروني غير صحيح.";
  if (message.includes("rate limit")) return "تم تجاوز عدد محاولات التسجيل. حاول بعد قليل.";
  return error?.message || "تعذر إنشاء الحساب. حاول مرة أخرى.";
}

const SUPABASE_MISSING = "تعذر الاتصال بخدمة التسجيل. تأكد من إعداد Supabase.";

const EMPTY_FORM = { fullName: "", phone: "", email: "", password: "" };
const NO_ERRORS = { fullName: false, phone: false, email: false, password: false };

export default function Register() {
  useBodyScope("yak-scope-register");
  const { isDark, toggleTheme } = useTheme();
  const { supabase, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState(NO_ERRORS);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState(null); // { text, type }

  const strength = passwordStrength(form.password);

  // Editing a field clears its error and the message (legacy behavior).
  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: false }));
    setMessage(null);
  };

  function validate() {
    const next = {
      fullName: form.fullName.trim().length < 2,
      phone: !isValidPhone(form.phone.trim()),
      email: !isValidEmail(form.email.trim()),
      password: form.password.length < 8,
    };
    setErrors(next);
    setMessage(null);
    return !Object.values(next).some(Boolean);
  }

  /* ---------- email registration ---------- */
  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    if (!supabase) {
      setMessage({ type: "error", text: SUPABASE_MISSING });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await signUp({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: "+213" + form.phone.trim(),
      });

      if (error) {
        console.error("❌ Registration error:", error);
        setMessage({ type: "error", text: registerErrorMessage(error) });
        return;
      }

      // With email confirmation enabled Supabase returns a user but no session.
      if (data.user && !data.session) {
        setMessage({
          type: "success",
          text: "تم إنشاء حسابك بنجاح. تفقد بريدك الإلكتروني لتأكيد الحساب.",
        });
        setForm(EMPTY_FORM);
      } else {
        setMessage({ type: "success", text: "تم إنشاء حسابك بنجاح. سيتم تحويلك..." });
        // Small delay so the user can see the success message (legacy: 1000ms).
        setTimeout(() => navigate("/dashboard", { replace: true }), 1000);
      }
    } catch (error) {
      console.error("❌ Unexpected registration error:", error);
      setMessage({ type: "error", text: "حدث خطأ غير متوقع. حاول مرة أخرى." });
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- Google ---------- */
  async function handleGoogle() {
    if (!supabase) {
      setMessage({ type: "error", text: SUPABASE_MISSING });
      return;
    }
    setGoogleLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error("❌ Google Auth error:", error);
        setGoogleLoading(false);
        setMessage({ type: "error", text: error.message || "تعذر التسجيل عبر Google." });
      }
    } catch (error) {
      console.error("❌ Google OAuth error:", error);
      setGoogleLoading(false);
      setMessage({ type: "error", text: "حدث خطأ أثناء التسجيل عبر Google." });
    }
  }

  return (
    <>
      <AuthBackground />

      {/* ================= NAVBAR ================= */}
      <header className="fixed top-0 right-0 left-0 z-[100] px-6 py-[18px] max-[680px]:px-3.5 max-[680px]:py-3">
        <nav className="mx-auto flex h-[68px] w-[min(1180px,100%)] items-center justify-between rounded-[18px] border border-[rgba(236,232,223,.9)] bg-[rgba(255,255,255,.72)] pr-[18px] pl-3.5 shadow-[0_8px_30px_rgba(45,45,45,.04)] backdrop-blur-[18px] max-[680px]:h-[62px] max-[680px]:px-3 dark:border-card-border dark:bg-[rgba(31,28,38,.76)]">
          <Link to="/" className="inline-flex shrink-0 items-center gap-[11px]" aria-label="Yak Academy">
            <div className="grid size-[39px] place-items-center rounded-[11px] bg-[linear-gradient(135deg,var(--primary-violet),var(--electric-violet))] text-[17px] text-white shadow-[0_7px_18px_rgba(91,58,166,.22)] max-[420px]:size-[35px]">
              <i className="fa-solid fa-y"></i>
            </div>
            <div className="text-[18px] font-extrabold tracking-[-0.4px] max-[680px]:text-[16px] max-[420px]:hidden">
              Yak <span className="text-primary-violet">Academy</span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 max-[680px]:hidden">
            {[
              ["/", "الرئيسية"],
              ["/#story", "قصتنا"],
              ["/#contact", "الاتصال بنا"],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="rounded-[10px] px-3.5 py-[9px] text-[13px] font-semibold text-text-muted transition-colors duration-[250ms] ease-[ease] hover:bg-lavender-mist hover:text-primary-violet"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="تغيير المظهر"
              className="grid size-10 cursor-pointer place-items-center rounded-[11px] bg-transparent text-text-muted transition-all duration-[250ms] ease-[ease] hover:-translate-y-px hover:bg-lavender-mist hover:text-primary-violet max-[680px]:size-9"
            >
              <i className={isDark ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
            </button>

            <Link
              to="/login"
              className="inline-flex min-h-10 items-center justify-center rounded-[11px] bg-primary-violet px-[17px] text-[13px] font-bold text-white shadow-[0_7px_18px_rgba(91,58,166,.18)] transition-all duration-[250ms] ease-[ease] hover:-translate-y-0.5 hover:bg-electric-violet hover:shadow-[0_10px_24px_rgba(91,58,166,.24)] max-[680px]:px-[13px] max-[680px]:text-[11px] max-[420px]:min-h-9"
            >
              تسجيل الدخول
            </Link>
          </div>
        </nav>
      </header>

      {/* ================= PAGE ================= */}
      <main className="flex min-h-screen items-center justify-center px-5 pt-[125px] pb-[60px] max-[680px]:px-3.5 max-[680px]:pt-[95px] max-[680px]:pb-[35px]">
        <section className="w-[min(500px,100%)] animate-[yak-card-appear_.45s_ease_both] rounded-(--radius-card) border border-card-border bg-card-bg p-[42px] shadow-(--shadow-card) backdrop-blur-[20px] max-[680px]:rounded-[22px] max-[680px]:px-[22px] max-[680px]:py-[30px] max-[420px]:px-[18px] max-[420px]:py-[26px]">
          {/* ---------- HEADER ---------- */}
          <div className="mb-[30px] text-center">
            <div className="inline-flex items-center gap-[7px] text-[11px] font-extrabold text-primary-violet before:size-1.5 before:rounded-full before:bg-sunlit-yellow before:content-['']">
              مرحباً بك في Yak Academy
            </div>
            <h1 className="mt-[9px] text-[28px] leading-[1.35] font-extrabold tracking-[-0.7px] max-[680px]:text-[24px]">
              إنشاء حساب جديد
            </h1>
            <p className="mt-2 text-[12px] leading-[1.9] text-text-muted">
              أنشئ حسابك وابدأ رحلتك نحو النجاح في البكالوريا.
            </p>
          </div>

          {/* ---------- FORM ---------- */}
          <form className="flex flex-col gap-[17px]" onSubmit={handleSubmit} noValidate>
            <Field id="fullNameField" label="الاسم" icon="fa-regular fa-user" error={errors.fullName} errorText="أدخل اسمك.">
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="مثال: أنس زيد"
                autoComplete="name"
                required
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className={inputClass(errors.fullName)}
              />
            </Field>

            <Field id="phoneField" label="رقم الهاتف" icon="fa-solid fa-phone" error={errors.phone} errorText="أدخل رقم هاتف جزائري صحيح.">
              <span className="pointer-events-none absolute top-1/2 left-[15px] -translate-y-1/2 text-[11px] font-bold text-text-muted [direction:ltr]">
                +213
              </span>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="5 XX XX XX XX"
                autoComplete="tel"
                maxLength={9}
                inputMode="numeric"
                required
                value={form.phone}
                onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 9))}
                className={inputClass(errors.phone, "pl-[58px]! text-right [direction:ltr]")}
              />
            </Field>

            <Field id="emailField" label="البريد الإلكتروني" icon="fa-regular fa-envelope" error={errors.email} errorText="أدخل بريد إلكتروني صحيح.">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="example@email.com"
                autoComplete="email"
                dir="ltr"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass(errors.email)}
              />
            </Field>

            <Field
              id="passwordField"
              label="كلمة المرور"
              icon="fa-solid fa-lock"
              error={errors.password}
              errorText="كلمة المرور يجب أن تكون 8 أحرف على الأقل."
              after={<StrengthMeter strength={strength} />}
            >
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={8}
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
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
              disabled={submitting}
              className="mt-[3px] inline-flex h-[50px] w-full cursor-pointer items-center justify-center gap-[9px] rounded-(--radius-btn) bg-[linear-gradient(135deg,var(--primary-violet),var(--electric-violet))] text-[12px] font-extrabold text-white shadow-[0_9px_24px_rgba(91,58,166,.20)] transition-[transform,box-shadow,opacity] duration-[250ms] ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_13px_30px_rgba(91,58,166,.27)] active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-[.68] disabled:shadow-none"
            >
              {submitting ? (
                <Spinner className="border-[rgba(255,255,255,.35)] border-t-white" />
              ) : (
                <>
                  <span>إنشاء حساب</span>
                  <i className="fa-solid fa-arrow-left"></i>
                </>
              )}
            </button>
          </form>

          {/* ---------- DIVIDER ---------- */}
          <div className="mt-6 mb-[18px] flex items-center gap-3 text-[10px] font-semibold text-text-light before:h-px before:flex-1 before:bg-card-border before:content-[''] after:h-px after:flex-1 after:bg-card-border after:content-['']">
            أو
          </div>

          {/* ---------- GOOGLE ---------- */}
          <button
            type="button"
            onClick={handleGoogle}
            className={
              "flex h-[50px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-(--radius-btn) border border-card-border bg-card-solid text-[12px] font-bold text-text-main transition-[border-color,background,transform,box-shadow] duration-[250ms] ease-[ease] hover:-translate-y-px hover:border-[#D8D0E8] hover:bg-lavender-mist hover:shadow-[0_7px_20px_rgba(45,45,45,.06)]" +
              (googleLoading ? " pointer-events-none opacity-65" : "")
            }
          >
            {googleLoading ? (
              <Spinner className="border-card-border border-t-primary-violet" />
            ) : (
              <>
                <svg className="size-[19px] flex-[0_0_19px]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.23-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.92-4.18 2.92-7.4z" />
                  <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.5z" />
                  <path fill="#FBBC05" d="M6.54 13.59A5.85 5.85 0 0 1 6.23 12c0-.55.11-1.09.31-1.59V7.89H3.3A9.5 9.5 0 0 0 2.25 12c0 1.53.37 2.98 1.05 4.11l3.24-2.52z" />
                  <path fill="#EA4335" d="M12 6.38c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.83 3.49 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.39l3.24 2.52C7.31 8.1 9.46 6.38 12 6.38z" />
                </svg>
                <span>إنشاء حساب عبر Google</span>
              </>
            )}
          </button>

          {/* ---------- LOGIN ---------- */}
          <div className="mt-[22px] text-center text-[11px] font-medium text-text-muted">
            هل لديك حساب بالفعل؟{" "}
            <Link to="/login" className="font-extrabold text-primary-violet hover:underline">
              سجّل الدخول
            </Link>
          </div>

          {/* ---------- SECURITY ---------- */}
          <div className="mt-5 flex items-center justify-center gap-[7px] border-t border-card-border pt-4 text-[9px] font-semibold text-text-light">
            <i className="fa-solid fa-lock text-success"></i>
            معلوماتك محمية ولن يتم مشاركتها مع أي جهة.
          </div>
        </section>
      </main>

      <AuthFooter />
    </>
  );
}
