// Visual pieces of legacy/register.html, shared by Register and ResetPassword.

/* ---------- password strength (same scoring as legacy) ---------- */
export function passwordStrength(value) {
  if (!value) return null;
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const width = Math.min(score, 5) * 20 + "%";
  if (score <= 1) return { width, color: "#D64545", label: "ضعيفة" };
  if (score <= 3) return { width, color: "#E6A700", label: "متوسطة" };
  return { width, color: "#22A06B", label: "قوية" };
}

export function StrengthMeter({ strength }) {
  if (!strength) return null;
  return (
    <div className="mt-px">
      <div className="h-1 w-full overflow-hidden rounded-full bg-card-border">
        <div
          className="h-full rounded-[inherit] transition-[width,background] duration-300"
          style={{ width: strength.width, background: strength.color }}
        ></div>
      </div>
      <div className="mt-[5px] text-[9px] font-semibold text-text-muted">{strength.label}</div>
    </div>
  );
}

/* ---------- small building blocks ---------- */
// Legacy precedence: the error border/shadow wins over :hover and :focus.
export const inputClass = (hasError, extra = "") =>
  "h-[50px] w-full rounded-(--radius-input) border bg-[rgba(255,255,255,.74)] pr-[43px] pl-[15px] text-[12px] font-semibold text-text-main outline-none transition-[border-color,box-shadow,background] duration-[250ms] ease-[ease] placeholder:font-medium placeholder:text-text-light focus:bg-card-solid dark:bg-[rgba(255,255,255,.035)] dark:focus:bg-card-solid " +
  (hasError
    ? "border-danger shadow-[0_0_0_4px_rgba(214,69,69,.07)] "
    : "border-card-border hover:border-[#D8D0E8] focus:border-electric-violet focus:shadow-[0_0_0_4px_rgba(123,79,224,.09)] ") +
  extra;

export function Field({ id, label, icon, error, errorText, after, children }) {
  return (
    <div className="flex flex-col gap-[7px]" id={id}>
      <label htmlFor={id.replace("Field", "")} className="px-0.5 text-[11px] font-bold text-text-main">
        {label}{" "}
        <span className="mr-0.5 text-danger">*</span>
      </label>
      <div className="group relative">
        <i
          className={
            icon +
            " pointer-events-none absolute top-1/2 right-[15px] -translate-y-1/2 text-[13px] text-text-light transition-colors duration-[250ms] ease-[ease] group-focus-within:text-primary-violet"
          }
        ></i>
        {children}
      </div>
      {after}
      {error && (
        <div className="flex items-center gap-[5px] text-[10px] font-semibold text-danger">
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>{errorText}</span>
        </div>
      )}
    </div>
  );
}

export function Spinner({ className }) {
  return (
    <span className={"block size-4 animate-[spin_.7s_linear_infinite] rounded-full border-2 " + className}></span>
  );
}

/* ---------- fixed grid + glows behind the page ---------- */
export function AuthBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,var(--grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-line)_1px,transparent_1px)] bg-size-[60px_60px]"></div>
      <div className="pointer-events-none fixed -top-[180px] -right-[140px] -z-[5] size-[420px] rounded-full bg-[rgba(123,79,224,.15)] opacity-[.42] blur-[90px]"></div>
      <div className="pointer-events-none fixed -bottom-[150px] -left-[100px] -z-[5] size-[330px] rounded-full bg-[rgba(250,204,21,.10)] opacity-[.42] blur-[90px]"></div>
    </>
  );
}

/* ---------- fixed footer ---------- */
export function AuthFooter() {
  return (
    <footer className="pointer-events-none fixed right-6 bottom-[15px] left-6 flex justify-center">
      <div className="text-[9px] font-semibold text-text-light">
        © {new Date().getFullYear()} Yak Academy — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
