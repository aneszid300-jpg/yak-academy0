import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useTheme } from "../hooks/useTheme.js";
import { useBodyScope } from "../hooks/useBodyScope.js";
import { isProfessor } from "../features/roles.js";

// Arabic messages — same wording as legacy/login.html.
function loginErrorMessage(error) {
  const msg = String(error?.message || "").toLowerCase();
  if (msg.includes("invalid login credentials")) return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  if (msg.includes("email not confirmed")) return "لازم تأكد البريد الإلكتروني قبل تسجيل الدخول.";
  return "تعذر تسجيل الدخول. حاول مرة أخرى.";
}

// Two doors, same page: students sign in at /login, professors at
// /prof/login («دخول الأساتذة»). Each door only lets its own accounts in
// (features/roles.js); the other kind is signed out again and pointed to
// its own page. Professors have no sign-up or Google sign-in here: their
// accounts are set up by the Yak team.
const VARIANTS = {
  student: {
    home: "/dashboard",
    badge: "مرحباً بعودتك",
    heading: <>رحلتك نحو <span className="text-sunlit-yellow">النجاح</span> تبدأ من هنا.</>,
    text: "ادخل إلى حسابك وواصل دراستك، تابع تقدمك، واكتشف كل ما أعددناه لمساعدتك في رحلة الباك.",
    footer: "لم نبنِ منصة فقط… بنينا مكاناً باش تقرا بطريقة أفضل.",
    title: "تسجيل الدخول",
    subtitle: "أدخل معلوماتك للوصول إلى حسابك.",
    wrongRole: isProfessor,
    wrongRoleText: "هذا حساب أستاذ. ادخل من صفحة دخول الأساتذة.",
    otherDoor: { to: "/prof/login", label: "دخول الأساتذة" },
  },
  prof: {
    home: "/prof",
    badge: "فضاء الأساتذة",
    heading: <>مرحباً بك أستاذ، <span className="text-sunlit-yellow">تلاميذك</span> في انتظارك.</>,
    text: "ادخل إلى لوحة الأستاذ: دوراتك ومحتواها، جلساتك المباشرة، وملفك كما يراه التلاميذ.",
    footer: "شكراً لأنك جزء من رحلة تلاميذ Yak.",
    title: "دخول الأساتذة",
    subtitle: "أدخل معلومات حسابك كأستاذ.",
    wrongRole: (user) => !isProfessor(user),
    wrongRoleText: "هذا الحساب ليس حساب أستاذ. التلاميذ يدخلون من صفحة تسجيل الدخول.",
    otherDoor: { to: "/login", label: "دخول التلاميذ" },
  },
};

export default function Login({ variant = "student" }) {
  useBodyScope("yak-scope-login");
  const { isDark, toggleTheme } = useTheme();
  const { supabase, session, signIn, signInWithGoogle, signOut, requestPasswordReset } = useAuth();
  const navigate = useNavigate();
  const v = VARIANTS[variant];
  const isProf = variant === "prof";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleDisabled, setGoogleDisabled] = useState(false);
  const [message, setMessage] = useState(null); // { text, type: "error" | "success" }

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const showMessage = (text, type = "error") => setMessage({ text, type });
  const hideMessage = () => setMessage(null);

  /* ---------- login ---------- */
  async function handleSubmit(event) {
    event.preventDefault();
    hideMessage();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showMessage("دخل البريد الإلكتروني.");
      emailRef.current?.focus();
      return;
    }
    if (!trimmedEmail.includes("@")) {
      showMessage("دخل بريد إلكتروني صحيح.");
      emailRef.current?.focus();
      return;
    }
    if (!password) {
      showMessage("دخل كلمة المرور.");
      passwordRef.current?.focus();
      return;
    }
    if (!supabase) {
      showMessage("تعذر تسجيل الدخول. حاول مرة أخرى.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signIn(trimmedEmail, password);

      if (error) {
        console.error("❌ Login error:", error);
        showMessage(loginErrorMessage(error));
        setLoading(false);
        return;
      }

      // The other door's account: sign it out again and point to its page.
      if (v.wrongRole(data?.user)) {
        await signOut();
        showMessage(v.wrongRoleText);
        setLoading(false);
        return;
      }

      showMessage("تم تسجيل الدخول بنجاح. جاري فتح حسابك...", "success");
      // Small delay so the user can see the success message (legacy: 700ms).
      setTimeout(() => navigate(v.home, { replace: true }), 700);
    } catch (error) {
      console.error("❌ Unexpected login error:", error);
      showMessage("حدث خطأ غير متوقع. حاول مرة أخرى.");
      setLoading(false);
    }
  }

  /* ---------- Google ---------- */
  async function handleGoogle() {
    hideMessage();
    if (!supabase) {
      showMessage("تعذر تسجيل الدخول باستخدام Google. حاول مرة أخرى.");
      return;
    }
    setGoogleDisabled(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error("❌ Google login error:", error);
        showMessage("تعذر تسجيل الدخول باستخدام Google. حاول مرة أخرى.");
        setGoogleDisabled(false);
      }
    } catch (error) {
      console.error("❌ Unexpected Google login error:", error);
      showMessage("حدث خطأ أثناء تسجيل الدخول باستخدام Google.");
      setGoogleDisabled(false);
    }
  }

  /* ---------- forgot password ---------- */
  async function handleForgotPassword(event) {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showMessage("دخل البريد الإلكتروني أولاً باش نبعثولك رابط تغيير كلمة المرور.");
      emailRef.current?.focus();
      return;
    }
    if (!trimmedEmail.includes("@")) {
      showMessage("دخل بريد إلكتروني صحيح.");
      emailRef.current?.focus();
      return;
    }
    if (!supabase) {
      showMessage("ما قدرناش نبعثو رابط تغيير كلمة المرور.");
      return;
    }

    setLoading(true);
    hideMessage();

    try {
      const { error } = await requestPasswordReset(trimmedEmail);
      if (error) {
        console.error("❌ Password reset error:", error);
        showMessage("ما قدرناش نبعثو رابط تغيير كلمة المرور.");
        return;
      }
      showMessage("تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني.", "success");
    } catch (error) {
      console.error("❌ Unexpected error:", error);
      showMessage("حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  if (!loading && session?.user && !v.wrongRole(session.user)) return <Navigate to={v.home} replace />;

  const inputClass =
    "h-[50px] w-full rounded-[13px] border border-card-border bg-bg-main pr-[45px] pl-[15px] text-[13px] text-text-main outline-none transition-[border-color,box-shadow,background] duration-200 placeholder:text-[#aaa6ae] focus:border-electric-violet focus:bg-card-solid focus:shadow-[0_0_0_4px_rgba(123,79,224,.10)]";
  const inputIconClass =
    "pointer-events-none absolute top-1/2 right-[15px] -translate-y-1/2 text-[14px] text-text-muted";

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <header className="fixed top-[18px] left-1/2 z-[1000] flex h-[68px] w-[min(1180px,calc(100%-32px))] -translate-x-1/2 items-center justify-between rounded-[18px] border border-[rgba(255,255,255,.75)] bg-[rgba(255,255,255,.72)] px-[18px] shadow-[0_10px_35px_rgba(45,45,45,.07)] backdrop-blur-[18px] transition-all duration-300 max-[820px]:top-[11px] max-[820px]:w-[calc(100%-22px)] dark:border-[rgba(255,255,255,.06)] dark:bg-[rgba(25,22,32,.78)]">
        <Link to="/" className="flex items-center gap-2.5 text-[20px] font-extrabold text-primary-violet">
          <div className="grid size-[38px] place-items-center rounded-xl bg-[linear-gradient(135deg,var(--primary-violet),var(--electric-violet))] text-white shadow-[0_8px_20px_rgba(123,79,224,.25)]">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <span>Yak Academy</span>
        </Link>

        <nav className="flex items-center gap-[30px] text-[14px] font-semibold max-[820px]:hidden">
          {[
            ["/", "الرئيسية"],
            ["/#story", "قصتنا"],
            ["/#contact", "الاتصال بنا"],
          ].map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className="text-text-main opacity-[.78] transition-all duration-200 hover:text-primary-violet hover:opacity-100"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="تغيير المظهر"
            className="grid size-[42px] cursor-pointer place-items-center rounded-xl bg-lavender-mist text-primary-violet transition-all duration-200 hover:-translate-y-0.5"
          >
            <i className={isDark ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
          </button>

          {!isProf && (
            <Link
              to="/register"
              className="inline-flex h-[42px] items-center justify-center rounded-xl bg-primary-violet px-[17px] text-[13px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-electric-violet max-[480px]:px-[13px]"
            >
              إنشاء حساب
            </Link>
          )}
        </div>
      </header>

      {/* ================= PAGE ================= */}
      <main className="grid min-h-screen place-items-center px-5 pt-[125px] pb-[50px] max-[480px]:px-3 max-[480px]:pt-[100px] max-[480px]:pb-[30px]">
        <section className="grid min-h-[570px] w-[min(980px,100%)] grid-cols-[.9fr_1.1fr] overflow-hidden rounded-[28px] border border-card-border bg-card-bg shadow-(--shadow-card) backdrop-blur-[15px] max-[820px]:max-w-[560px] max-[820px]:grid-cols-1 max-[480px]:rounded-[20px]">
          {/* ---------- BRAND ---------- */}
          <div className="auth-brand-panel relative flex flex-col justify-between overflow-hidden p-12 text-white max-[820px]:min-h-[250px] max-[820px]:p-[34px] max-[480px]:min-h-[225px] max-[480px]:px-6 max-[480px]:py-7">
            <div className="relative z-[2]">
              <div className="mb-[25px] inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,.14)] bg-[rgba(255,255,255,.11)] px-3 py-[7px] text-[12px] font-bold">
                <i className={(isProf ? "fa-solid fa-chalkboard-user" : "fa-solid fa-sparkles") + " text-sunlit-yellow"}></i>
                <span>{v.badge}</span>
              </div>

              <h2 className="mb-[18px] max-w-[330px] text-[clamp(30px,4vw,44px)] leading-[1.35] font-extrabold max-[820px]:text-[32px] max-[480px]:text-[27px]">
                {v.heading}
              </h2>

              <p className="max-w-[360px] text-[14px] leading-[2] text-[rgba(255,255,255,.76)] max-[480px]:text-[12px]">
                {v.text}
              </p>
            </div>

            <div className="relative z-[2] max-[820px]:hidden">
              <div className="mb-[13px] h-1 w-[42px] rounded-[10px] bg-sunlit-yellow"></div>
              <p className="text-[12px] text-[rgba(255,255,255,.58)]">
                {v.footer}
              </p>
            </div>
          </div>

          {/* ---------- FORM ---------- */}
          <div className="flex flex-col justify-center bg-card-solid px-[52px] py-12 max-[820px]:px-[30px] max-[820px]:py-[38px] max-[480px]:px-5 max-[480px]:py-[30px]">
            <div className="mb-7">
              <h1 className="mb-[7px] text-[29px] font-extrabold max-[480px]:text-[25px]">{v.title}</h1>
              <p className="text-[13px] text-text-muted">{v.subtitle}</p>
            </div>

            {message && (
              <div
                role="alert"
                className={
                  "mb-[18px] block rounded-xl border px-3.5 py-3 text-[13px] leading-[1.7] " +
                  (message.type === "success"
                    ? "border-[rgba(22,132,91,.14)] bg-[rgba(22,132,91,.08)] text-[#126846]"
                    : "border-[rgba(220,53,69,.14)] bg-[rgba(220,53,69,.08)] text-[#a72834]")
                }
              >
                {message.text}
                {message.text === v.wrongRoleText && (
                  <Link to={v.otherDoor.to} className="mr-1 font-extrabold underline underline-offset-2">
                    {v.otherDoor.label}
                  </Link>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* EMAIL */}
              <div className="mb-[18px]">
                <label htmlFor="email" className="mb-2 block text-[13px] font-bold">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <i className={"fa-regular fa-envelope " + inputIconClass}></i>
                  <input
                    ref={emailRef}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="example@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="mb-[18px]">
                <label htmlFor="password" className="mb-2 block text-[13px] font-bold">
                  كلمة المرور
                </label>
                <div className="relative">
                  <i className={"fa-solid fa-lock " + inputIconClass}></i>
                  <input
                    ref={passwordRef}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="أدخل كلمة المرور"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="إظهار كلمة المرور"
                    className="absolute top-1/2 left-[15px] grid size-7 -translate-y-1/2 cursor-pointer place-items-center bg-transparent text-text-muted hover:text-primary-violet"
                  >
                    <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
                  </button>
                </div>
              </div>

              {/* OPTIONS */}
              <div className="mt-0.5 mb-[22px] flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-[12px] text-text-muted">
                  <input type="checkbox" id="remember" className="size-[15px] cursor-pointer accent-primary-violet" />
                  <span>تذكرني</span>
                </label>

                <a
                  href="#"
                  onClick={handleForgotPassword}
                  className="cursor-pointer text-[12px] font-bold text-primary-violet hover:text-electric-violet"
                >
                  نسيت كلمة المرور؟
                </a>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-(--radius-btn) bg-[linear-gradient(135deg,var(--primary-violet),var(--electric-violet))] text-[14px] font-extrabold text-white shadow-[0_10px_25px_rgba(91,58,166,.20)] transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(91,58,166,.27)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className={loading ? "opacity-90" : ""}>تسجيل الدخول</span>
                {loading && (
                  <span className="block size-[18px] animate-[spin_.7s_linear_infinite] rounded-full border-2 border-[rgba(255,255,255,.35)] border-t-white"></span>
                )}
              </button>

              {/* GOOGLE — students only */}
              {!isProf && (
              <>
              <div className="mt-5 mb-4 flex items-center gap-3 text-[12px] text-text-muted before:h-px before:flex-1 before:bg-card-border before:content-[''] after:h-px after:flex-1 after:bg-card-border after:content-['']">
                <span>أو</span>
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleDisabled}
                className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-(--radius-btn) border border-card-border bg-card-solid text-[14px] font-bold text-text-main transition-[transform,border-color,box-shadow,background] duration-200 hover:-translate-y-0.5 hover:border-[rgba(91,58,166,.25)] hover:bg-bg-main hover:shadow-[0_8px_22px_rgba(45,45,45,.08)] active:translate-y-0"
              >
                <i className="fa-brands fa-google text-[16px]"></i>
                <span>المتابعة باستخدام Google</span>
              </button>
              </>
              )}
            </form>

            {isProf ? (
              <div className="mt-[25px] text-center text-[12px] text-text-muted">
                حسابات الأساتذة يجهّزها فريق Yak Academy.
              </div>
            ) : (
              <div className="mt-[25px] text-center text-[12px] text-text-muted">
                ما عندكش حساب؟
                <Link to="/register" className="mr-1 font-extrabold text-primary-violet hover:text-electric-violet">
                  إنشاء حساب جديد
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
