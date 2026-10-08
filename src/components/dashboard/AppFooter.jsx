import { Link } from "react-router-dom";
import { yakLogoPurple } from "../../assets/images/index.js";

const socialIcon = "flex size-[38px] items-center justify-center rounded-full bg-sunlit-yellow text-[#1E293B] shadow-[0_2px_8px_rgba(250,204,21,.4)] transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-95 [&_svg]:size-[18px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.2] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]";
const footerLink = "text-[13.5px] font-bold text-text-main transition-colors duration-200 hover:text-electric-violet";

// Legacy .app-footer. The logout button that sat under the copyright moved
// to the sidebar. Social links have no destinations yet (legacy "#").
export default function AppFooter() {
  return (
    <footer className="mt-auto shrink-0 rounded-(--radius-card) border border-card-border bg-card-bg px-8 pt-6 pb-4 shadow-(--shadow-subtle) backdrop-blur-[12px] transition-[background,border-color] duration-300 max-[640px]:px-5">
      <div className="flex flex-wrap items-center justify-between gap-5 pb-5">
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2.5">
            <img src={yakLogoPurple} alt="Yak Academy" className="h-10 w-auto max-w-40 object-contain object-left" />
          </div>
          {/* Brand tagline: Cairo ExtraBold, Yak muted grey (follows light/dark) */}
          <p className="m-0 font-['Cairo',var(--font-yak)] text-[13px] leading-[1.6] font-extrabold text-text-muted max-[640px]:text-[12.5px]">
            ياك تجاوبك على كل ياك
          </p>
        </div>

        <ul className="flex flex-wrap items-center gap-6 max-[640px]:gap-x-5 max-[640px]:gap-y-2">
          <li><Link to="/#story" className={footerLink}>من نحن</Link></li>
          <li><Link to="/dashboard/courses" className={footerLink}>الدورات</Link></li>
          <li><Link to="/dashboard/teachers" className={footerLink}>أساتذتنا</Link></li>
          <li><Link to="/#contact" className={footerLink}>اتصل بنا</Link></li>
        </ul>

        <div className="flex items-center gap-2.5">
          <a href="#" className={socialIcon} aria-label="LinkedIn">
            <svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
          </a>
          <a href="#" className={socialIcon} aria-label="Facebook">
            <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
          </a>
          <a href="#" className={socialIcon} aria-label="Instagram">
            <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
          </a>
          <a href="#" className={socialIcon} aria-label="Telegram">
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </a>
          <a href="#" className={socialIcon} aria-label="Chat Support">
            <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
          </a>
        </div>
      </div>

      <div className="border-t border-footer-border pt-3.5 text-center">
        <p className="text-[11.5px] font-semibold text-text-muted">جميع الحقوق محفوظة © {new Date().getFullYear()} أكاديمية ياك</p>
      </div>
    </footer>
  );
}
