import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useBodyScope } from "../hooks/useBodyScope.js";
import { useActiveSection } from "../hooks/useActiveSection.js";
import { scrollToSection } from "../utils/scrollToSection.js";
import Navbar from "../components/public/Navbar.jsx";
import Footer from "../components/public/Footer.jsx";
import FAQ from "../components/public/FAQ.jsx";
import Reveal from "../components/public/Reveal.jsx";
import SectionLink from "../components/public/SectionLink.jsx";
import { Section, SectionHeader, SectionLabel, SectionTitle, container } from "../components/public/Section.jsx";

// Migrated from legacy/index.html — same sections, same order.

const FEATURES = [
  {
    number: "01",
    icon: "fa-solid fa-compass",
    iconClass: "bg-lavender-mist text-primary-violet",
    title: "طريق واضح",
    text: "كل وحدة منظمة بطريقة تخليك تعرف الخطوة اللي بعدها بلا ما تضيع وقتك.",
  },
  {
    number: "02",
    icon: "fa-solid fa-bolt",
    iconClass: "bg-[rgba(250,204,21,.13)] text-[#B68B00]",
    title: "تعلم بذكاء",
    text: "دروس، تطبيقات وتمارين مبنية باش تساعدك تفهم المعلومة وتستعملها.",
    highlight: true,
  },
  {
    number: "03",
    icon: "fa-solid fa-clock",
    iconClass: "bg-[rgba(59,130,246,.10)] text-[#3B82F6]",
    title: "على وقتك",
    text: "تقدر تتعلم من الهاتف أو الكمبيوتر وفي الوقت اللي يناسبك.",
  },
];

const STEPS = [
  { number: "01", title: "أنشئ حسابك", text: "سجل حسابك وابدأ رحلتك الدراسية داخل Yak." },
  { number: "02", title: "اختار وحدتك", text: "اختار المادة والوحدة اللي تحتاج تركز عليها." },
  { number: "03", title: "تعلم وطبق", text: "شوف الدرس وحل التمارين وطبق واش تعلمت." },
  { number: "04", title: "تابع تقدمك", text: "اعرف واش كملت وواش باقي عليك في رحلتك." },
];

const PROFESSORS = [
  { subject: "الرياضيات", name: "أستاذ الرياضيات", focus: "شرح + منهجية + تطبيق" },
  { subject: "العلوم", name: "أستاذ العلوم", focus: "فهم + تطبيق" },
  { subject: "الفيزياء", name: "أستاذ الفيزياء", focus: "شرح + تمارين" },
];

const CONTACTS = [
  { href: "mailto:contact@yakacademy.dz", icon: "fa-solid fa-envelope", label: "البريد الإلكتروني", value: "contact@yakacademy.dz" },
  // No WhatsApp number in the legacy page yet.
  { href: "#", icon: "fa-brands fa-whatsapp", label: "WhatsApp", value: "تواصل معنا مباشرة" },
];

// Legacy: cards carry `.reveal`, whose `.visible` transform (and transition)
// override the hover lift — so hover only changes shadow/border, instantly.
const card = "border border-card-border bg-card-bg";

const floatingCard =
  "absolute flex size-[50px] items-center justify-center rounded-[15px] border border-card-border bg-card-bg shadow-(--shadow-card) backdrop-blur-[10px] animate-[yak-floating_5s_ease-in-out_infinite] max-[650px]:size-[42px] max-[650px]:text-[13px]";

const gradientButton =
  "bg-[linear-gradient(135deg,var(--electric-violet),var(--primary-violet))] text-white shadow-(--shadow-purple) transition-all duration-250 ease-yak hover:-translate-y-0.5";

export default function Landing() {
  useBodyScope("yak-scope-landing");
  const activeSection = useActiveSection();
  const location = useLocation();

  // Arriving on /#story or /#contact (e.g. from the login/register navbar).
  useEffect(() => {
    const id = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!id) return;
    // Jump right away, then re-align once the web fonts have loaded and the
    // layout has settled — unless the user has scrolled in the meantime.
    scrollToSection(id, "instant");
    let cancelled = false;
    const userEvents = ["wheel", "touchstart", "keydown", "mousedown"];
    const stop = () => {
      cancelled = true;
    };
    userEvents.forEach((type) => window.addEventListener(type, stop, { once: true, passive: true }));
    document.fonts.ready.then(() => {
      if (!cancelled) scrollToSection(id, "instant");
    });
    return () => {
      cancelled = true;
      userEvents.forEach((type) => window.removeEventListener(type, stop));
    };
  }, [location.hash, location.key]);

  return (
    <>
      <div className="landing-grid"></div>
      <div className="pointer-events-none fixed -top-[250px] -right-[180px] -z-4 size-[500px] rounded-full bg-electric-violet opacity-10 blur-[120px]"></div>
      <div className="pointer-events-none fixed -bottom-[300px] -left-[180px] -z-4 size-[500px] rounded-full bg-sunlit-yellow opacity-10 blur-[120px]"></div>

      <Navbar activeSection={activeSection} />

      <main>
        {/* ================= HERO ================= */}
        <section
          id="home"
          className="relative flex min-h-[820px] items-center overflow-hidden pt-[125px] max-[650px]:min-h-[720px] max-[650px]:pt-[120px]"
        >
          <div className={floatingCard + " top-[30%] right-[9%] text-primary-violet max-[650px]:right-[2%]"}>
            <i className="fa-solid fa-flask"></i>
          </div>
          <div className={floatingCard + " top-[24%] left-[9%] text-electric-violet [animation-delay:-2s] max-[650px]:left-[2%]"}>
            <i className="fa-solid fa-atom"></i>
          </div>
          <div className={floatingCard + " right-[16%] bottom-[15%] text-[#C69B00] [animation-delay:-3.5s]"}>
            <i className="fa-solid fa-book-open"></i>
          </div>

          <div className={container + " relative z-5 flex flex-col items-center text-center"}>
            <Reveal className="inline-flex items-center gap-[9px] rounded-full border border-card-border bg-card-bg px-[13px] py-[7px] text-[11px] font-bold text-text-muted shadow-(--shadow-subtle) backdrop-blur-[10px]">
              <span className="size-[7px] rounded-full bg-[#10B981] shadow-[0_0_0_4px_rgba(16,185,129,.10)]"></span>
              منصة جزائرية مخصصة للبكالوريا
            </Reveal>

            <Reveal
              as="h1"
              className="mt-[25px] max-w-[850px] text-[clamp(50px,7vw,86px)] leading-[1.08] font-black tracking-[-3px] max-[650px]:text-[47px] max-[650px]:tracking-[-2px]"
            >
              <span className="text-primary-violet">مستقبلك الدراسي</span>
              <br />
              يبدأ{" "}
              <span className="relative text-text-main after:absolute after:inset-x-0 after:-bottom-1 after:h-[9px] after:rotate-[-1deg] after:border-b-[3px] after:border-sunlit-yellow after:content-['']">
                من هنا.
              </span>
            </Reveal>

            <Reveal as="p" className="mt-[22px] max-w-[610px] text-[15px] leading-[2] text-text-muted max-[650px]:text-[12px]">
              Yak هي المساحة اللي تجمعلك الدروس، التمارين، المراجعة، والمتابعة في طريق واحد واضح نحو البكالوريا.
            </Reveal>

            <Reveal className="mt-[30px] flex items-center gap-2.5 max-[650px]:w-full max-[650px]:flex-col">
              <Link
                to="/register"
                className={
                  gradientButton +
                  " inline-flex items-center gap-2.5 rounded-(--radius-btn) px-[18px] py-3 text-[13px] font-extrabold max-[650px]:w-full max-[650px]:justify-center"
                }
              >
                ابدأ رحلتك
                <i className="fa-solid fa-arrow-left text-[11px]"></i>
              </Link>

              <SectionLink
                to="why-yak"
                className="inline-flex items-center gap-[9px] rounded-(--radius-btn) border border-card-border bg-card-bg px-[17px] py-[11px] text-[12px] font-bold text-text-main transition-all duration-250 ease-yak hover:border-[rgba(123,79,224,.3)] hover:bg-hover-nav-bg hover:text-primary-violet max-[650px]:w-full max-[650px]:justify-center"
              >
                اكتشف Yak
                <i className="fa-solid fa-arrow-down"></i>
              </SectionLink>
            </Reveal>

            <Reveal className="mt-[26px] flex items-center gap-[22px] text-[10px] font-semibold text-text-muted max-[650px]:flex-col max-[650px]:gap-1.5">
              {["محتوى مخصص للـ BAC", "تعلم في أي وقت", "مع أساتذة مختصين"].map((text) => (
                <span key={text} className="flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-check text-[9px] text-[#10B981]"></i>
                  {text}
                </span>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ================= WHY YAK ================= */}
        <Section id="why-yak" soft>
          <SectionHeader
            center
            label="لماذا Yak؟"
            title={
              <>
                لأن التحضير للبكالوريا <span>ما لازمش يكون فوضى.</span>
              </>
            }
            description="بدل ما تبقى تتنقل بين مصادر كثيرة، Yak ترتبلك الطريق وتخليك تعرف واش تقرا، واش تطبق، ووين وصلت."
          />

          <div className="grid grid-cols-3 gap-[15px] max-[900px]:grid-cols-2 max-[650px]:grid-cols-1">
            {FEATURES.map((feature) => (
              <Reveal
                as="article"
                key={feature.number}
                className={
                  "relative min-h-[260px] overflow-hidden rounded-(--radius-card) p-[25px] shadow-(--shadow-subtle) hover:shadow-(--shadow-card) " +
                  (feature.highlight
                    ? "border border-[rgba(123,79,224,.16)] bg-[linear-gradient(135deg,rgba(123,79,224,.09),rgba(255,255,255,.55))] dark:bg-[linear-gradient(135deg,rgba(139,92,246,.14),rgba(21,15,35,.85))]"
                    : card + " hover:border-[rgba(123,79,224,.18)]")
                }
              >
                <span className="absolute top-[18px] left-[22px] text-[10px] text-text-muted opacity-65">{feature.number}</span>
                <div className={"mb-[25px] flex size-12 items-center justify-center rounded-[13px] " + feature.iconClass}>
                  <i className={feature.icon}></i>
                </div>
                <h3 className="text-[18px] font-black">{feature.title}</h3>
                <p className="mt-[9px] max-w-[300px] text-[12px] leading-[2] text-text-muted">{feature.text}</p>
                <div className="absolute right-[25px] bottom-[23px] h-[3px] w-[30px] rounded-[10px] bg-primary-violet"></div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ================= HOW IT WORKS ================= */}
        <Section id="how">
          <SectionHeader
            label="كيفاش تخدم Yak؟"
            title={
              <>
                بسيطة. <span>واضحة.</span> ومبنية عليك.
              </>
            }
            description="من التسجيل حتى متابعة تقدمك، كل خطوة عندها مكانها."
          />

          <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[650px]:grid-cols-1">
            {STEPS.map((step) => (
              <Reveal
                as="article"
                key={step.number}
                className={card + " rounded-(--radius-card) px-5 py-6 shadow-(--shadow-subtle) hover:shadow-(--shadow-card)"}
              >
                <div className="mb-6 flex size-10 items-center justify-center rounded-[11px] bg-lavender-mist text-[11px] font-black text-primary-violet">
                  {step.number}
                </div>
                <h3 className="text-[16px] font-black">{step.title}</h3>
                <p className="mt-2 text-[11px] leading-[1.9] text-text-muted">{step.text}</p>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ================= STORY ================= */}
        <Section id="story" soft>
          <Reveal
            className={
              card +
              " grid min-h-[450px] grid-cols-2 overflow-hidden rounded-[28px] shadow-(--shadow-card) max-[900px]:grid-cols-1"
            }
          >
            <div className="relative min-h-[450px] overflow-hidden bg-[linear-gradient(135deg,#5B3AA6,#35206C)] max-[900px]:min-h-[350px]">
              <div className="story-pattern"></div>
              <div className="absolute -top-[100px] -left-[80px] size-[320px] rounded-full border border-[rgba(255,255,255,.12)]"></div>
              <div className="absolute -right-[60px] -bottom-[80px] size-[230px] rounded-full border border-[rgba(255,255,255,.12)]"></div>

              <div className="absolute inset-x-[35px] bottom-[35px] text-white">
                <small className="mb-[9px] block text-[9px] font-black tracking-[2px] text-sunlit-yellow">YAK ACADEMY</small>
                <h3 className="max-w-[400px] text-[32px] leading-[1.3] font-black max-[650px]:text-[26px]">
                  لم نبنِ منصة فقط… بنينا طريقة جديدة للتعلم.
                </h3>
                <p className="mt-2 text-[11px] text-[rgba(255,255,255,.65)]">لأن الطالب يستحق تجربة أبسط وأوضح.</p>
              </div>
            </div>

            <div className="flex flex-col justify-center p-[55px] max-[650px]:px-[25px] max-[650px]:py-[35px]">
              <SectionLabel>قصتنا</SectionLabel>
              <SectionTitle>
                بدأت الفكرة <span>من مشكلة حقيقية.</span>
              </SectionTitle>
              <p className="mt-[15px] max-w-[490px] text-[13px] leading-[2] text-text-muted">
                كثير من الطلبة يلقاو رواحهم وسط دروس كثيرة، مصادر كثيرة، وضغط أكبر من اللازم.
              </p>
              <p className="mt-[15px] max-w-[490px] text-[13px] leading-[2] text-text-muted">
                Yak جاءت باش ترتب هذه الرحلة. نخليو التعلم أقرب، أوضح، وأكثر تركيزًا على الطالب.
              </p>
              <SectionLink
                to="contact"
                className="mt-[23px] inline-flex w-fit items-center gap-2 text-[12px] font-black text-primary-violet hover:text-electric-violet"
              >
                تعرف علينا أكثر
                <i className="fa-solid fa-arrow-left"></i>
              </SectionLink>
            </div>
          </Reveal>
        </Section>

        {/* ================= PROFESSORS ================= */}
        <Section id="professors">
          <SectionHeader
            center
            label="الأساتذة"
            title={
              <>
                تتعلم مع ناس <span>يعرفو واش تحتاج.</span>
              </>
            }
            description="فريق من الأساتذة المختصين لصناعة محتوى يخدم هدفك."
          />

          <div className="grid grid-cols-3 gap-[15px] max-[900px]:grid-cols-2 max-[650px]:grid-cols-1">
            {PROFESSORS.map((professor) => (
              <Reveal
                as="article"
                key={professor.subject}
                className={card + " flex items-center gap-3.5 rounded-(--radius-card) p-[18px] hover:shadow-(--shadow-card)"}
              >
                <div className="flex size-[58px] shrink-0 items-center justify-center rounded-[15px] bg-lavender-mist text-[19px] text-primary-violet">
                  <i className="fa-solid fa-user"></i>
                </div>
                <div>
                  <small className="text-[9px] font-black text-primary-violet">{professor.subject}</small>
                  <h3 className="mt-0.5 text-[14px] font-black">{professor.name}</h3>
                  <p className="mt-0.5 text-[10px] text-text-muted">{professor.focus}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ================= FAQ ================= */}
        <Section id="faq" soft>
          <div className="grid grid-cols-[.8fr_1.2fr] items-start gap-[70px] max-[900px]:grid-cols-1 max-[900px]:gap-[35px]">
            <SectionHeader
              label="الأسئلة الشائعة"
              title={
                <>
                  عندك سؤال؟ <span>جاوبناك.</span>
                </>
              }
              description="إذا ما لقيتش الإجابة اللي تبحث عليها، تقدر تتواصل معنا مباشرة."
            />
            <FAQ />
          </div>
        </Section>

        {/* ================= CTA ================= */}
        <Section id="register">
          <Reveal className="relative overflow-hidden rounded-[28px] border border-[rgba(123,79,224,.15)] bg-[linear-gradient(135deg,rgba(123,79,224,.10),rgba(239,239,253,.55))] px-[30px] py-[65px] text-center shadow-(--shadow-card) before:absolute before:-top-[150px] before:-left-[80px] before:size-[250px] before:rounded-full before:bg-[rgba(250,204,21,.12)] before:blur-[30px] before:content-[''] max-[650px]:px-5 max-[650px]:py-[50px] dark:bg-[linear-gradient(135deg,rgba(139,92,246,.16),rgba(21,15,35,.85))]">
            <div className="relative inline-block rounded-full border border-[rgba(123,79,224,.15)] bg-card-bg px-[11px] py-[5px] text-[10px] font-black text-primary-violet">
              مستعد تبدأ؟
            </div>
            <h2 className="relative mt-[13px] text-[clamp(34px,5vw,55px)] font-black">
              رحلتك تبدأ <span className="text-primary-violet">من هنا.</span>
            </h2>
            <p className="relative mt-2 text-[12px] text-text-muted">خطوة واحدة تفصلك عن بداية جديدة في طريقة دراستك.</p>
            <Link
              to="/register"
              className={
                gradientButton +
                " relative mt-[22px] inline-flex items-center gap-[9px] rounded-(--radius-btn) px-[18px] py-[11px] text-[12px] font-extrabold"
              }
            >
              ابدأ الآن
              <i className="fa-solid fa-arrow-left"></i>
            </Link>
          </Reveal>
        </Section>

        {/* ================= CONTACT ================= */}
        <Section id="contact">
          <div className="grid grid-cols-2 items-center gap-[60px] max-[900px]:grid-cols-1">
            <Reveal>
              <SectionLabel>الاتصال بنا</SectionLabel>
              <SectionTitle>
                عندك سؤال؟ <span>نحن هنا.</span>
              </SectionTitle>
              <p className="mt-3 max-w-[450px] text-[13px] leading-[2] text-text-muted">
                عندك اقتراح، سؤال، أو حاب تعرف أكثر على Yak؟ تواصل معنا.
              </p>
            </Reveal>

            <div className="flex flex-col gap-2.5">
              {CONTACTS.map((contact) => (
                <Reveal
                  as="a"
                  key={contact.label}
                  href={contact.href}
                  className={card + " flex items-center gap-[13px] rounded-[15px] p-[15px] hover:shadow-(--shadow-subtle)"}
                >
                  <span className="flex size-10 items-center justify-center rounded-[11px] bg-lavender-mist text-primary-violet">
                    <i className={contact.icon}></i>
                  </span>
                  <div className="flex flex-col">
                    <small className="text-[9px] text-text-muted">{contact.label}</small>
                    <strong className="mt-px text-[11px]">{contact.value}</strong>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </>
  );
}
