import { useState } from "react";

// Legacy "sticker notebook": sticker notes on a grid-paper notebook with
// vertical subject tabs on its right edge (styles in courses.css). Used by
// «تمارين الدورات» and «باك AI», which share the exact same markup in legacy.
//
//   onOpen(item)  — clicking a sticker (and its ghost button)
//   onSolid(item) — the solid button; when omitted it opens the sticker too
//   getLock(item) — optional: { badge, action } when the sticker is locked
//                   (باك AI decks whose unit is not bought); then the whole
//                   sticker and its single button call onLocked(item).
//                   `action: null` = nothing to do yet (button disabled).
export default function StickerNotebook({ title, meta, badge, items, tabs, ghostLabel, solidLabel, onOpen, onSolid, getLock, onLocked }) {
  const [subject, setSubject] = useState("all");

  return (
    <div className="ex-notebook-wrap">
      <div className="ex-notebook">
        <div className="ex-notebook-head">
          <div>
            <div className="ex-notebook-title">{title}</div>
            <div className="ex-notebook-meta">{meta}</div>
          </div>
          <span className="ex-notebook-badge">{badge}</span>
        </div>

        <div className="ex-stickers">
          {items.map((item) => {
            const lock = getLock?.(item) || null;
            const open = () => (lock ? onLocked?.(item) : onOpen(item));
            return (
              <div
                key={item.id}
                className={"ex-sticker color-" + item.subject + (lock ? " is-locked" : "")}
                data-locked={lock ? "true" : undefined}
                style={subject === "all" || subject === item.subject ? undefined : { display: "none" }}
                role="link"
                tabIndex={0}
                onClick={open}
                onKeyDown={(event) => {
                  if (event.key === "Enter") open();
                }}
              >
                <span className="ex-sticker-chip">{item.chip}</span>
                {lock && (
                  <span className="ex-sticker-lock">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="4" y="11" width="16" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    {lock.badge}
                  </span>
                )}
                <div className="ex-sticker-title">{item.title}</div>
                <div className="ex-sticker-meta">{item.meta}</div>
                <div className="ex-sticker-actions">
                  {lock ? (
                    <button
                      type="button"
                      className="ex-sticker-btn solid is-locked"
                      disabled={!lock.action}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (lock.action) onLocked?.(item);
                      }}
                    >
                      {lock.action || "قريباً"}
                    </button>
                  ) : (
                    <>
                      <button type="button" className="ex-sticker-btn ghost">
                        {ghostLabel}
                      </button>
                      <button
                        type="button"
                        className="ex-sticker-btn solid"
                        onClick={
                          onSolid
                            ? (event) => {
                                event.stopPropagation();
                                onSolid(item);
                              }
                            : undefined
                        }
                      >
                        {solidLabel}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="subject-side-tabs" role="tablist" aria-label="تصفية حسب المادة">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`side-tab tab-${tab.key}` + (subject === tab.key ? " active" : "")}
            role="tab"
            tabIndex={0}
            aria-selected={subject === tab.key}
            onClick={() => setSubject(tab.key)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSubject(tab.key);
              }
            }}
          >
            {tab.label}
          </div>
        ))}
      </div>
    </div>
  );
}
