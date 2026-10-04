import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme.js";
import { yakLogoPurple } from "../../assets/images/index.js";
import SectionLink from "./SectionLink.jsx";

const NAV_ITEMS = [
  { id: "home", label: "الرئيسية" },
  { id: "story", label: "قصتنا" },
  { id: "contact", label: "الاتصال بنا" },
];

// The ≤650px widening applies to the navbar only; legacy left the menu at 100% − 40px.
const menuWidth = "w-[min(var(--container),calc(100%-40px))]";
const navWidth = menuWidth + " max-[650px]:w-[calc(100%-28px)]";
const iconButton =
  "size-[38px] cursor-pointer items-center justify-center rounded-[11px] bg-transparent text-text-muted";
const mobileLink = "rounded-[10px] px-3.5 py-3 text-[13px] text-text-muted hover:bg-hover-nav-bg hover:text-primary-violet";

// Fixed landing navbar + mobile menu (legacy .navbar-wrapper).
// `activeSection` comes from the page's section observer.
export default function Navbar({ activeSection }) {
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-4 z-1000">
      <nav
        className={
          navWidth +
          " mx-auto flex h-[66px] items-center justify-between rounded-[18px] border border-card-border bg-card-bg px-3 shadow-(--shadow-subtle) backdrop-blur-[14px] transition-all duration-300 ease-[ease]"
        }
      >
        <SectionLink to="home" className="flex items-center gap-2.5 text-[20px] font-black text-primary-violet">
          <img src={yakLogoPurple} alt="Yak Logo" className="block h-[38px] w-auto object-contain" />
        </SectionLink>

        <div className="flex items-center gap-1 max-[900px]:hidden">
          {NAV_ITEMS.map(({ id, label }) => {
            const active = activeSection === id;
            return (
              <SectionLink
                key={id}
                to={id}
                className={
                  "relative rounded-(--radius-btn) px-[15px] py-[9px] text-[13px] font-bold transition-all duration-250 ease-yak hover:bg-hover-nav-bg " +
                  (active
                    ? "text-primary-violet after:absolute after:bottom-0.5 after:left-1/2 after:size-[5px] after:-translate-x-1/2 after:rounded-full after:bg-primary-violet after:content-['']"
                    : "text-text-muted hover:text-electric-violet")
                }
              >
                {label}
              </SectionLink>
            );
          })}
        </div>

        <div className="flex items-center gap-[7px]">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="تغيير المظهر"
            className={iconButton + " flex transition-all duration-250 ease-yak hover:bg-lavender-mist hover:text-primary-violet"}
          >
            <i className={isDark ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
          </button>

          <Link
            to="/login"
            className="rounded-(--radius-btn) px-[15px] py-[9px] text-[13px] font-bold text-text-muted transition-all duration-250 ease-yak hover:bg-hover-nav-bg hover:text-electric-violet max-[900px]:hidden"
          >
            تسجيل الدخول
          </Link>

          <Link
            to="/register"
            className="flex items-center gap-2 rounded-(--radius-btn) bg-[linear-gradient(135deg,var(--electric-violet),var(--primary-violet))] px-4 py-2.5 text-[12px] font-extrabold text-white shadow-[0_6px_16px_rgba(123,79,224,.20)] transition-all duration-250 ease-yak hover:-translate-y-0.5 hover:shadow-(--shadow-purple) max-[650px]:hidden"
          >
            التسجيل
            <i className="fa-solid fa-arrow-left"></i>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="القائمة"
            aria-expanded={menuOpen}
            className={iconButton + " hidden max-[900px]:flex"}
          >
            <i className={menuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          className={
            menuWidth +
            " mx-auto mt-2.5 flex flex-col rounded-[18px] border border-card-border bg-card-bg p-2.5 shadow-(--shadow-card) backdrop-blur-[14px]"
          }
        >
          {NAV_ITEMS.map(({ id, label }) => (
            <SectionLink key={id} to={id} onClick={closeMenu} className={mobileLink}>
              {label}
            </SectionLink>
          ))}
          <Link to="/register" onClick={closeMenu} className={mobileLink}>
            التسجيل
          </Link>
          <Link to="/login" onClick={closeMenu} className={mobileLink}>
            تسجيل الدخول
          </Link>
        </div>
      )}
    </header>
  );
}
