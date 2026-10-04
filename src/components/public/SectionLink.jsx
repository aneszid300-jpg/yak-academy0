import { scrollToSection } from "../../utils/scrollToSection.js";

// In-page link (#story, #contact, …). Smooth-scrolls with the navbar offset
// instead of jumping, and leaves the URL untouched — like the legacy page.
export default function SectionLink({ to, onClick, children, ...props }) {
  function handleClick(event) {
    if (scrollToSection(to)) event.preventDefault();
    onClick?.(event);
  }

  return (
    <a href={`#${to}`} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
