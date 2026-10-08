import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { getAiDeck } from "../../data/ai.js";
import { CHOICE_LETTERS, getFlashCards } from "../../data/flashcards.js";
import { loadQcmMemory, resetQcmMemory, saveQcmMemory } from "../../features/flash/qcmMemory.js";

// بطاقات المراجعة — migrated from legacy/dashboard.html #page-flash.
// Legacy's flashcards are QCM questions (4 choices, one try each). Answers
// and position are saved per deck in localStorage (yak_qcm_<title>) and
// restored when the deck is reopened. There is no completion screen and no
// keyboard shortcuts in legacy. Answering is immediate (one try): the picked
// choice and the correct one are marked, then all choices are disabled.

export default function Flash() {
  const { deckId } = useParams();
  if (!deckId) return <Navigate to="/dashboard/ai" replace />; // legacy had no deck-less flashcards page
  const deck = getAiDeck(deckId);
  if (!deck) {
    return (
      <section className="flash-page">
        <div className="section-card text-center">
          <div className="section-title">المجموعة غير موجودة</div>
          <p className="mt-1.5 mb-4 text-[12.5px] text-text-muted">الرابط غير صحيح أو أن مجموعة البطاقات لم تعد متوفرة.</p>
          <Link to="/dashboard/ai" className="btn-outline inline-block">العودة إلى باك AI</Link>
        </div>
      </section>
    );
  }
  return <FlashDeck key={deck.id} deck={deck} />;
}

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const CrossIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

// Question list state: current / answered right / answered wrong / not yet.
function itemState(a) {
  if (!a) return { cls: "", label: "لم تتم الإجابة" };
  return a.ok ? { cls: " is-done", label: "إجابة صحيحة" } : { cls: " is-done is-wrong", label: "إجابة خاطئة" };
}

function FlashDeck({ deck }) {
  const navigate = useNavigate();
  const location = useLocation();
  const cards = getFlashCards(deck.id);
  const total = cards.length;
  // Legacy opened the deck at the saved question with the saved answers.
  const [state, setState] = useState(() => loadQcmMemory(deck.title, total));
  const { index, score, answered } = state;
  const card = cards[index];
  const answer = answered[index];

  const answeredCount = Object.keys(answered).length;
  const [listOpen, setListOpen] = useState(true);
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const clamp = (i) => Math.max(0, Math.min(total - 1, i));
  // «السابق» / «التالي» save the position; picking from the list doesn't (legacy).
  const move = (i, save) => {
    const next = { ...state, index: clamp(i) };
    setState(next);
    if (save) saveQcmMemory(deck.title, next);
  };
  const choose = (selected) => {
    if (answered[index]) return;
    const ok = selected === card.correct;
    const next = { index, score: score + (ok ? 1 : 0), answered: { ...answered, [index]: { selected, ok } } };
    setState(next);
    saveQcmMemory(deck.title, next);
  };
  const reset = () => {
    if (!window.confirm("بغيت تمسح تقدم هاد المجموعة وتعاود من الصفر؟")) return;
    resetQcmMemory(deck.title);
    const next = { score: 0, answered: {}, index: 0 };
    setState(next);
    saveQcmMemory(deck.title, next);
  };

  const pct = total ? Math.round((answeredCount / total) * 100) : 0;
  const hint = answeredCount === 0 ? "أجب على أول سؤال لتتبع تقدمك" : answeredCount === total ? `أنهيت كل الأسئلة — النقاط: ${score} / ${total}` : `النقاط حتى الآن: ${score} / ${total}`;

  // Same page structure as the course Study page (study.css): topbar,
  // progress + contents on the side, the question in place of the video, the
  // question bar and the previous / next row below it.
  return (
    <section className="flash-page">
      <div className="study-page-wrap">
        <div className="study-topbar">
          <div className="study-top-meta">{deck.chip}</div>
          <div className="study-top-title">{deck.title}</div>
          <button type="button" className="study-back-btn" onClick={() => navigate(location.state?.from || "/dashboard/ai")}>
            رجوع لباك AI
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>

        <div className="study-layout">
          <aside className="study-side">
            <div className="study-progress-card">
              <div className="study-progress-head">
                <span className="study-progress-label">تقدمك</span>
                <span className="study-progress-pct">{pct}%</span>
              </div>
              <div className="study-progress-track" role="progressbar" aria-label="الأسئلة المُجابة" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answeredCount}>
                <div className="study-progress-fill" style={{ width: pct + "%" }}></div>
              </div>
              <p className="study-progress-hint">{hint}</p>
            </div>

            <div className="study-content-card">
              <div className="study-content-head">
                <span className="study-content-title">أسئلة QCM</span>
                <span className="study-content-count">{answeredCount}/{total} مُجاب</span>
              </div>
              <div className="study-content-list">
                <div className={"study-unit-block" + (listOpen ? " is-open" : "")}>
                  <button type="button" className="study-unit-toggle" aria-expanded={listOpen} onClick={() => setListOpen((open) => !open)}>
                    <span className="study-unit-num">1</span>
                    <span className="study-unit-name">{deck.title}</span>
                    <span className="study-unit-meta">{total} أسئلة</span>
                    <svg className="study-unit-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  <div className="study-unit-lessons">
                    {cards.map((c, i) => {
                      const st = itemState(answered[i]);
                      return (
                        <button
                          key={i}
                          type="button"
                          className={"study-lesson-item" + (i === index ? " active" : "") + st.cls}
                          aria-current={i === index ? "step" : undefined}
                          onClick={() => move(i, false)}
                        >
                          <span className="study-lesson-icon" aria-hidden="true">
                            {answered[i] ? (answered[i].ok ? <CheckIcon /> : <CrossIcon />) : <span className="qcm-item-num">{i + 1}</span>}
                          </span>
                          <span className="study-lesson-info">
                            <span className="study-lesson-name" title={c.q}>{c.q}</span>
                            <span className="study-lesson-meta">{`السؤال ${i + 1} · ${st.label}`}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="study-main">
            <div className="qcm-question-card">
              <div className="qcm-q-label">سؤال QCM</div>
              <h2 className="qcm-question-text" id="qcmQuestion">{card.q}</h2>
              <div className={"qcm-choices" + (answer ? " is-answered" : "")} role="group" aria-labelledby="qcmQuestion">
                {card.choices.slice(0, 4).map((choice, i) => {
                  let extra = "";
                  let mark = null;
                  if (answer) {
                    if (i === card.correct) {
                      extra = " correct";
                      mark = <CheckIcon />;
                    } else if (i === answer.selected) {
                      extra = " wrong";
                      mark = <CrossIcon />;
                    }
                    if (i === answer.selected) extra += " selected";
                  }
                  return (
                    <button key={i} type="button" className={"qcm-choice" + extra} disabled={!!answer} aria-pressed={answer ? i === answer.selected : undefined} onClick={() => choose(i)}>
                      <span className="qcm-choice-letter" aria-hidden="true">{CHOICE_LETTERS[i]}</span>
                      <span className="qcm-choice-text" dir="auto">{choice}</span>
                      {mark && <span className="qcm-choice-mark" aria-hidden="true">{mark}</span>}
                    </button>
                  );
                })}
              </div>
              <div className={"qcm-feedback-wrap" + (answer ? " show" : "")}>
                <div className={"qcm-feedback" + (answer ? (answer.ok ? " ok" : " bad") : "")} role="status">
                  {answer &&
                    (answer.ok ? (
                      <>
                        <CheckIcon />
                        <span>إجابة صحيحة</span>
                      </>
                    ) : (
                      <>
                        <CrossIcon />
                        <span>
                          إجابة خاطئة — الصحيح: <b className="qcm-feedback-letter">{CHOICE_LETTERS[card.correct]}</b> <bdi>{card.choices[card.correct]}</bdi>
                        </span>
                      </>
                    ))}
                </div>
              </div>
            </div>

            <div className="study-lesson-bar">
              <div className="study-lesson-bar-text">
                <div className="study-video-title">{`السؤال ${index + 1} من ${total}`}</div>
                <div className="study-video-sub">
                  <span className="study-chip">{deck.title}</span>
                  <span className="study-chip">QCM</span>
                  <span className="study-chip">{`النقاط: ${score} / ${total}`}</span>
                </div>
              </div>
              <button type="button" className="study-back-btn qcm-reset-btn" title="مسح التقدم المحفوظ" onClick={reset}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                إعادة من الصفر
              </button>
            </div>

            {/* No completion screen in this QCM: on the last question «التالي»
                is disabled (it used to do nothing) and the bar says what's left. */}
            <div className="study-nav-row">
              <button type="button" className="study-nav-btn" disabled={isFirst} onClick={() => move(index - 1, true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
                السابق
              </button>
              <button type="button" className="study-nav-btn study-nav-btn--next" disabled={isLast} onClick={() => move(index + 1, true)}>
                التالي
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            </div>
            {isLast && answeredCount < total && (
              <p className="qcm-end-note" role="status">{`هذا آخر سؤال — بقي ${total - answeredCount} من ${total} دون إجابة`}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
