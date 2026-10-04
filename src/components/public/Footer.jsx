import { yakLogoPurple } from "../../assets/images/index.js";
import { container } from "./Section.jsx";
import SectionLink from "./SectionLink.jsx";

const footerLink = "text-[10px] text-text-muted transition-all duration-250 ease-yak hover:text-primary-violet";

export default function Footer() {
  return (
    <footer className="border-t border-card-border py-[25px]">
      <div className={container + " flex items-center justify-between gap-5 max-[650px]:flex-col max-[650px]:text-center"}>
        <SectionLink to="home" className="flex items-center gap-2.5 text-[20px] font-black text-primary-violet">
          <img src={yakLogoPurple} alt="Yak Logo" className="block h-[38px] w-auto object-contain" />
        </SectionLink>

        <div className="text-[9px] text-text-muted">
          © {new Date().getFullYear()} Yak Academy — جميع الحقوق محفوظة.
        </div>

        <div className="flex gap-[18px]">
          <SectionLink to="story" className={footerLink}>
            قصتنا
          </SectionLink>
          <SectionLink to="contact" className={footerLink}>
            الاتصال بنا
          </SectionLink>
        </div>
      </div>
    </footer>
  );
}
