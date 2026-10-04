import { useEffect, useState } from "react";

// Tracks which <main> section sits in the middle band of the viewport
// (legacy "ACTIVE NAV" observer, same rootMargin).
export function useActiveSection(initial = "home") {
  const [activeSection, setActiveSection] = useState(initial);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return activeSection;
}
