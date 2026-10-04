import { useAuth } from "../../hooks/useAuth.js";
import { getDisplayName, getUserInitial } from "../../utils/userName.js";

// Legacy .top-navbar: search field (not wired to anything yet, as in legacy)
// and the user's name/avatar. The menu button exists only below 900px, where
// the sidebar becomes a drawer; it reuses the sidebar's toggle-button style.
export default function TopNavbar({ onOpenMenu, menuOpen }) {
  const { user } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between gap-3 rounded-(--radius-card) border border-card-border bg-card-bg px-5 shadow-(--shadow-subtle) backdrop-blur-[12px] transition-[background,border-color] duration-300 max-[900px]:px-3">
      <div className="flex min-w-0 items-center gap-2.5 max-[900px]:flex-1">
        <button
          type="button"
          className="toggle-sidebar-btn hidden! max-[900px]:flex! shrink-0"
          onClick={onOpenMenu}
          aria-label="القائمة"
          aria-controls="sidebar"
          aria-expanded={menuOpen}
        >
          <svg className="toggle-panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="M9 4v16" />
          </svg>
        </button>

        <div className="flex w-[280px] items-center gap-2 rounded-[30px] border border-card-border bg-search-bg px-3.5 py-1.5 transition-[background,border-color,width] duration-300 max-[900px]:w-auto max-[900px]:min-w-0 max-[900px]:flex-1">
          <input
            type="text"
            placeholder="ابحث عن درس، مادة، ملف أو سؤال..."
            className="w-full min-w-0 border-none bg-transparent text-[12.5px] text-text-main outline-none placeholder:text-[#757575]"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="text-left max-[420px]:hidden">
          <div className="text-[13px] font-extrabold">{getDisplayName(user)}</div>
          <div className="text-[10px] text-text-muted">طالب</div>
        </div>
        <div className="flex size-[34px] items-center justify-center rounded-full bg-electric-violet font-bold text-white">
          {getUserInitial(user)}
        </div>
      </div>
    </header>
  );
}
