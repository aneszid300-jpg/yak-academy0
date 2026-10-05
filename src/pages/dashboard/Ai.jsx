import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AI_DECKS, AI_TABS } from "../../data/ai.js";
import StickerNotebook from "../../components/dashboard/StickerNotebook.jsx";
import { unitLock, useCoursesAccess } from "../../features/payments/courseAccess.js";

// Decks are not sold: each comes with its unit (deck.courseId). A deck whose
// unit the student has not bought is shown locked and leads to that UNIT's
// checkout. While access is still loading, decks look as before and the
// flashcards route's own gate decides.
const DECK_LOCKS = {
  unavailable: { badge: "ستتوفر ضمن وحدتها قريباً", action: null },
  review: { badge: "الوحدة قيد المراجعة", action: "عرض الطلب" },
  locked: { badge: "متاحة بعد شراء الوحدة", action: "شراء الوحدة" },
};
const deckLock = (deck, access) => DECK_LOCKS[unitLock(deck.courseId, access)] || null;

// باك AI — migrated from legacy/dashboard.html #page-ai.
// Legacy's «باك AI» is a board of revision-card decks, not a chat: there is
// no API, no conversation and no storage. «الكل» and «بطاقاتي» (?view=my)
// show the same decks in legacy — only the highlighted button changes.
// Opening a deck starts its flashcards (QCM): /dashboard/flash/:deckId.

const VIEWS = [
  {
    key: "all",
    label: "الكل",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </>
    ),
  },
  { key: "my", label: "بطاقاتي", icon: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /> },
];

export default function Ai() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const view = params.get("view") === "my" ? "my" : "all"; // unknown views fall back to «الكل» (as Courses)
  const access = useCoursesAccess();

  return (
    <section className="ai-page">
      <div className="flex w-full flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-(--radius-card) border border-card-border bg-card-bg px-5 py-3 shadow-(--shadow-subtle) backdrop-blur-[12px]">
          <div className="search-bar" style={{ width: 320, maxWidth: "100%" /* phones: legacy fixed 320px clipped at 390 */ }}>
            <input type="text" placeholder="ابحث عن بطاقات، مادة، أو درس..." />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {VIEWS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={"courses-filter-btn" + (view === item.key ? " active" : "")}
                aria-pressed={view === item.key}
                onClick={() => setParams(item.key === "all" ? {} : { view: item.key })}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {item.icon}
                </svg>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <StickerNotebook
            title="بطاقات المراجعة"
            meta="ملصقات البطاقات على دفترك · اضغط للمعاينة أو المتابعة"
            badge="ياك · باك AI"
            items={AI_DECKS}
            tabs={AI_TABS}
            ghostLabel="معاينة"
            solidLabel="متابعة"
            // «رجوع» on the flashcards returns to this exact view (e.g. ?view=my).
            onOpen={(deck) => navigate(`/dashboard/flash/${deck.id}`, { state: { from: pathname + search } })}
            getLock={(deck) => deckLock(deck, access)}
            onLocked={(deck) =>
              navigate(deck.courseId ? `/dashboard/payment/course/${deck.courseId}` : `/dashboard/flash/${deck.id}`, { state: { from: pathname + search } })
            }
          />
        </div>
      </div>
    </section>
  );
}
