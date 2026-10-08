import { Children, useCallback, useEffect, useRef, useState } from "react";

// A row of CourseCards (each subject on the Courses page, Home «أحدث
// الدورات»): cards keep a readable width (min 280px) and scroll sideways;
// when they all fit, it is a plain row. Round chevron buttons (the
// same .chip-nav-btn as the subject chips) sit over the edges only while
// there is more to see. RTL: «التالي» scrolls to the left.
export default function CourseRail({ label, children }) {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const scrolled = Math.abs(el.scrollLeft); // negative in RTL
    // a few px of slack: scroll-snap and the track padding nudge the ends
    setEdges({ start: scrolled < 8, end: scrolled + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    const observer = new ResizeObserver(measure);
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  const step = (dir) => {
    const el = ref.current;
    if (!el) return;
    const card = el.firstElementChild;
    const width = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * width, behavior: "smooth" });
  };

  return (
    <div className="course-rail">
      <div className="course-rail-track" ref={ref} onScroll={measure} role="list" aria-label={label}>
        {Children.map(children, (child) => (
          <div className="course-rail-item" role="listitem">{child}</div>
        ))}
      </div>
      {!edges.start && (
        <button type="button" className="chip-nav-btn course-rail-btn is-prev" aria-label="السابق" onClick={() => step(1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
      {!edges.end && (
        <button type="button" className="chip-nav-btn course-rail-btn is-next" aria-label="التالي" onClick={() => step(-1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
