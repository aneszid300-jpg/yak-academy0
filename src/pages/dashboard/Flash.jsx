import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { getAiDeck } from "../../data/ai.js";
import { CHOICE_LETTERS, getFlashCards } from "../../data/flashcards.js";
import { loadQcmMemory, resetQcmMemory, saveQcmMemory } from "../../features/flash/qcmMemory.js";

// بطاقات المراجعة — migrated from legacy/dashboard.html #page-flash.
// Legacy's flashcards are QCM questions (4 choices, one try each). Answers
// and position are saved per deck in localStorage (yak_qcm_<title>) and
// restored when the deck is reopened. There is no completion screen and no
// keyboard shortcuts in legacy.

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

function feedbackText(card, answer) {
  return answer.ok ? "إجابة صحيحة ✓" : "إجابة خاطئة — الصحيح: " + CHOICE_LETTERS[card.correct] + ") " + card.choices[card.correct];
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

  return (
    <section className="flash-page">
      <div className="viewer-page-wrap">
        <div className="viewer-topbar">
          <button type="button" className="viewer-back-btn" onClick={() => navigate(location.state?.from || "/dashboard/ai")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="m9 18 6-6-6-6" />
            </svg>
            رجوع
          </button>
          <div className="viewer-top-title">{deck.title}</div>
          <div className="viewer-top-meta">{`${deck.chip} · QCM`}</div>
        </div>

        <div className="flash-study-layout">
          <aside className="flash-side">
            <div className="study-lessons-head">
              <div className="study-lessons-title">الأسئلة</div>
              <div className="study-lessons-count">{`${total} بطاقة`}</div>
            </div>
            <div>
              {cards.map((c, i) => {
                const a = answered[i];
                return (
                  <button key={i} type="button" className={"flash-deck-item" + (i === index ? " active" : "")} aria-current={i === index ? "true" : undefined} onClick={() => move(i, false)}>
                    <span className="study-lesson-num">{i + 1}</span>
                    <span className="study-lesson-info">
                      <span className="study-lesson-name">{c.q + (a ? (a.ok ? " ✓" : " ✗") : "")}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="flash-main">
            <div className="flash-progress-row">
              <span className="viewer-top-meta">{`${index + 1} / ${total}`}</span>
              <div className="flash-progress-bar">
                <div className="flash-progress-fill" style={{ width: ((index + 1) / total) * 100 + "%" }}></div>
              </div>
              <span className="qcm-score">{`النقاط: ${score} / ${total}`}</span>
            </div>

            <div className="qcm-question-card">
              <div className="qcm-q-label">سؤال QCM</div>
              <div className="qcm-question-text">{card.q}</div>
              <div className="qcm-choices">
                {card.choices.slice(0, 4).map((choice, i) => {
                  let extra = "";
                  if (answer) {
                    if (i === card.correct) extra = " correct";
                    else if (i === answer.selected) extra = " wrong";
                  }
                  return (
                    <button key={i} type="button" className={"qcm-choice" + extra} disabled={!!answer} onClick={() => choose(i)}>
                      <span className="qcm-choice-letter">{CHOICE_LETTERS[i]}</span>
                      <span>{choice}</span>
                    </button>
                  );
                })}
              </div>
              <div className={"qcm-feedback" + (answer ? " show " + (answer.ok ? "ok" : "bad") : "")} role="status">
                {answer ? feedbackText(card, answer) : ""}
              </div>
            </div>

            <div className="flash-nav">
              <button type="button" className="btn-outline" onClick={() => move(index - 1, true)}>السابق</button>
              <button type="button" className="btn-violet" onClick={() => move(index + 1, true)}>التالي</button>
              <button type="button" className="btn-outline" title="مسح التقدم المحفوظ" onClick={reset}>إعادة من الصفر</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
