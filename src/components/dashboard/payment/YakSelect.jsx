import { useEffect, useId, useMemo, useRef, useState } from "react";

// Yak-styled dropdown (replaces the native <select> on the payment screens):
// trigger with the payment-input look, a floating list with Yak hover /
// selected states, an internal scroll, optional search and full keyboard
// support (↑ ↓ Home End Enter Esc, type to search).
//
//   options      [{ value, label }]
//   value        selected value ("" = none)
//   onChange(value)
//   placeholder  trigger text when nothing is selected
//   searchable   show «searchPlaceholder» field at the top of the list
//   invalid, disabled
export default function YakSelect({ options, value, onChange, placeholder, searchable = false, searchPlaceholder = "ابحث...", invalid = false, disabled = false, id }) {
  const autoId = useId();
  const listId = `${id || autoId}-list`;
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const selected = options.find((option) => option.value === value) || null;
  const shown = useMemo(() => {
    const q = query.trim();
    return q ? options.filter((option) => option.label.includes(q)) : options;
  }, [options, query]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // On open: start on the selected option, focus the search, scroll it into view.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    const index = Math.max(0, options.findIndex((option) => option.value === value));
    setActive(index);
    setTimeout(() => {
      if (searchable) searchRef.current?.focus();
      listRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
    }, 0);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function choose(option) {
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onKeyDown(event) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }
    const last = shown.length - 1;
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((i) => Math.min(last, i + 1)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (event.key === "Home") { event.preventDefault(); setActive(0); }
    else if (event.key === "End") { event.preventDefault(); setActive(last); }
    else if (event.key === "Enter") { event.preventDefault(); if (shown[active]) choose(shown[active]); }
    else if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setOpen(false); triggerRef.current?.focus(); }
    else if (event.key === "Tab") setOpen(false);
  }

  return (
    <div className={"yak-select" + (open ? " is-open" : "")} ref={rootRef} onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={"payment-input yak-select-trigger" + (invalid ? " is-invalid" : "") + (selected ? "" : " is-placeholder")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="yak-select-value">{selected ? selected.label : placeholder}</span>
        <svg className="yak-select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="yak-select-pop">
          {searchable && (
            <div className="yak-select-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => { setQuery(event.target.value); setActive(0); }}
                placeholder={searchPlaceholder}
                aria-controls={listId}
                aria-label={searchPlaceholder}
              />
            </div>
          )}
          <ul className="yak-select-list" role="listbox" id={listId} ref={listRef} aria-activedescendant={shown[active] ? `${listId}-${active}` : undefined}>
            {shown.length === 0 && <li className="yak-select-empty">لا توجد نتائج</li>}
            {shown.map((option, index) => (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                data-index={index}
                role="option"
                aria-selected={option.value === value}
                className={"yak-select-option" + (option.value === value ? " is-selected" : "") + (index === active ? " is-active" : "")}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
