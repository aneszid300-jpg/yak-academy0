import { useState } from "react";
import Reveal from "./Reveal.jsx";

const QUESTIONS = [
  {
    question: "واش هي Yak Academy؟",
    answer:
      "Yak Academy هي منصة تعليمية جزائرية موجهة لطلبة البكالوريا، تجمع المحتوى الدراسي والتمارين والمتابعة في مكان واحد.",
  },
  {
    question: "واش هي المواد المتوفرة؟",
    answer: "المنصة موجهة لمسارات البكالوريا العلمية والرياضية، وسيتم تنظيم المحتوى حسب المواد والوحدات.",
  },
  {
    question: "نقدر نستعمل Yak من الهاتف؟",
    answer: "نعم. الواجهة مصممة باش تكون متجاوبة مع الكمبيوتر، التابلت والهاتف.",
  },
  {
    question: "كيفاش نبدأ؟",
    answer:
      "في المرحلة القادمة تقدر تنشئ حسابك مباشرة من زر التسجيل، وبعدها تدخل للـ Dashboard الخاص بك.",
  },
];

// Accordion: one answer open at a time; clicking the open one closes it.
export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="border-t border-card-border">
      {QUESTIONS.map(({ question, answer }, index) => {
        const open = openIndex === index;
        return (
          <Reveal key={question} className="border-b border-card-border">
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full cursor-pointer items-center justify-between gap-5 bg-transparent py-[19px] text-right text-[13px] font-extrabold text-text-main"
            >
              <span>{question}</span>
              <span
                className={
                  "flex size-7 shrink-0 items-center justify-center rounded-[9px] border border-card-border text-primary-violet transition-all duration-250 ease-yak " +
                  (open ? "rotate-45 bg-lavender-mist" : "")
                }
              >
                <i className="fa-solid fa-plus"></i>
              </span>
            </button>
            <div
              className={
                "overflow-hidden transition-[max-height] duration-300 ease-[ease] " + (open ? "max-h-[150px]" : "max-h-0")
              }
            >
              <p className="pb-[18px] text-[11px] leading-[2] text-text-muted">{answer}</p>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
