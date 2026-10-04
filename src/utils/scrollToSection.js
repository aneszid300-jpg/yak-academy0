// Same as the legacy landing's smooth-scroll handler: scroll to the section
// while leaving room for the fixed navbar (90px).
const NAVBAR_OFFSET = 90;

export function scrollToSection(id, behavior = "smooth") {
  const target = document.getElementById(id);
  if (!target) return false;

  const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
  window.scrollTo({ top, behavior });
  return true;
}
