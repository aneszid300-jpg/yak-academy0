// Subject mark shown in the course card's side tile, in the card's accent
// colour. Picked by course id (visual only — the course data has no icon),
// falling back to the subject of the id's prefix.

const Line = ({ children }) => (
  <svg className="unit-card-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const Text = ({ children }) => <span className="unit-card-glyph is-text">{children}</span>;

const GLYPHS = {
  "math-equations": (
    <Line>
      <path d="M3 3v18h18" />
      <path d="m6 15 4-4 3 3 6-7" />
      <path d="M15 7h4v4" />
    </Line>
  ),
  "math-limits": <Text>√x</Text>,
  "math-definite-integral": <Text>f(x)</Text>,
  "physics-mechanics": (
    <Line>
      <circle cx="12" cy="12" r="1.6" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)" />
    </Line>
  ),
  "physics-electrostatics": (
    <Line>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </Line>
  ),
  "physics-electric-current": (
    <Line>
      <rect x="2" y="7" width="17" height="10" rx="2" />
      <path d="M22 11v2M9 9.5 7 12h4l-2 2.5" />
    </Line>
  ),
  "science-plant-nutrition": (
    <Line>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
      <path d="M2 21c0-3 1.9-5.4 5.2-6.1 2.4-.5 4.9-2 5.8-4.9" />
    </Line>
  ),
  "science-genetics": (
    <Line>
      <path d="M2 15c6.7-6 13.3 0 20-6M2 9c6.7 6 13.3 0 20 6" />
      <path d="M6 10.5v3M10 9.5v5M14 9.5v5M18 10.5v3" />
    </Line>
  ),
  "science-organ-functions": (
    <Line>
      <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />
      <path d="M3.2 12H8l1.5-3 3 6 1.5-3h6.8" />
    </Line>
  ),
  "arabic-grammar": <Text>ع</Text>,
  "arabic-rhetoric": (
    <Line>
      <path d="M20.2 12.2a6 6 0 0 0-8.5-8.5L5 10.5V19h8.5Z" />
      <path d="M16 8 2 22M17.5 15H9" />
    </Line>
  ),
  "arabic-literary-texts": (
    <Line>
      <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
    </Line>
  ),
};

const SUBJECT_GLYPHS = {
  math: GLYPHS["math-definite-integral"],
  physics: GLYPHS["physics-mechanics"],
  science: GLYPHS["science-plant-nutrition"],
  arabic: GLYPHS["arabic-literary-texts"],
};

export default function CourseGlyph({ courseId }) {
  return GLYPHS[courseId] || SUBJECT_GLYPHS[courseId.split("-")[0]] || GLYPHS["math-definite-integral"];
}
