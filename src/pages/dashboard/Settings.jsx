import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { useLogout } from "../../hooks/useLogout.js";
import { useTheme } from "../../hooks/useTheme.js";
import { getFullName, getUserInitial } from "../../utils/userName.js";

// الإعدادات — NEW. Legacy had a «الإعدادات» nav item but no settings page, so
// this small page is built from the dashboard's existing pieces: the signed-in
// user (read-only), the shared theme switch and the sidebar's logout flow.

const MISSING = "غير متوفر";

const sunIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);
const moonIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const logout = useLogout();

  const name = getFullName(user);
  const email = user?.email || "";
  const phone = user?.user_metadata?.phone || user?.phone || "";

  const [loggingOut, setLoggingOut] = useState(false);
  async function handleLogout() {
    setLoggingOut(true);
    const ok = await logout();
    if (!ok) setLoggingOut(false);
  }

  const fields = [
    ["الاسم", name, false],
    ["البريد الإلكتروني", email, true],
    ["رقم الهاتف", phone, true],
  ];

  return (
    <section className="settings-page">
      <div className="flex w-full flex-col gap-5">
        {/* ---------- الحساب ---------- */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">الحساب</div>
          </div>
          <div className="settings-user">
            <div className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-electric-violet text-lg font-bold text-white">
              {getUserInitial(user)}
            </div>
            <div className="min-w-0">
              <div className="settings-user-name">{name || MISSING}</div>
              <div className="text-xs font-semibold text-text-muted">طالب</div>
            </div>
          </div>
          <dl className="settings-fields">
            {fields.map(([label, value, ltr]) => (
              <div key={label} className="settings-field">
                <dt>{label}</dt>
                <dd className={value ? "" : "missing"} dir={value && ltr ? "ltr" : undefined}>
                  {value || MISSING}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ---------- المظهر ---------- */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">المظهر</div>
          </div>
          <p className="settings-note">اختر مظهر لوحة التحكم. يتم حفظ اختيارك على هذا الجهاز.</p>
          <div className="flex flex-wrap gap-2.5" role="group" aria-label="المظهر">
            {[
              ["light", "الوضع الفاتح", sunIcon],
              ["dark", "الوضع الداكن", moonIcon],
            ].map(([key, label, icon]) => (
              <button
                key={key}
                type="button"
                className={"courses-filter-btn" + (theme === key ? " active" : "")}
                aria-pressed={theme === key}
                onClick={() => setTheme(key)}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ---------- تسجيل الخروج ---------- */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">تسجيل الخروج</div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="settings-note m-0!">الخروج من حسابك في ياك أكاديمي.</p>
            <button type="button" className="btn-outline settings-logout" onClick={handleLogout} disabled={loggingOut}>
              <i className="fa-solid fa-right-from-bracket"></i>
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
