import Reveal from "./Reveal.jsx";

// Shared landing section pieces (legacy .section / .section-header /
// .section-label / .section-title / .section-description).

export const container = "mx-auto w-[min(var(--container),calc(100%-40px))] max-[650px]:w-[calc(100%-28px)]";

export function Section({ id, soft = false, className = "", children }) {
  return (
    <section
      id={id}
      className={
        "py-[110px] max-[650px]:py-[75px] " +
        (soft ? "bg-[rgba(255,255,255,.22)] dark:bg-[rgba(255,255,255,.015)] " : "") +
        className
      }
    >
      <div className={container}>{children}</div>
    </section>
  );
}

export function SectionLabel({ children }) {
  return (
    <div className="mb-3 inline-flex items-center gap-[7px] text-[11px] font-black text-primary-violet before:size-1.5 before:rounded-full before:bg-sunlit-yellow before:content-['']">
      {children}
    </div>
  );
}

export function SectionTitle({ children }) {
  return (
    <h2 className="text-[clamp(30px,4vw,48px)] leading-[1.25] font-black tracking-[-1.5px] max-[650px]:text-[31px] [&_span]:text-primary-violet">
      {children}
    </h2>
  );
}

export function SectionHeader({ label, title, description, center = false }) {
  return (
    <Reveal className={"mb-[55px] max-w-[650px] " + (center ? "mx-auto text-center" : "")}>
      <SectionLabel>{label}</SectionLabel>
      <SectionTitle>{title}</SectionTitle>
      <p className="mt-[15px] text-[14px] leading-[2] text-text-muted">{description}</p>
    </Reveal>
  );
}
