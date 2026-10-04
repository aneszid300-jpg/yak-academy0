import { useLayoutEffect } from "react";

// Legacy login/register styled <body> itself (tokens, background, font).
// Put the page's scope class on <body> before first paint, remove on leave.
export function useBodyScope(className) {
  useLayoutEffect(() => {
    document.body.classList.add(className);
    return () => document.body.classList.remove(className);
  }, [className]);
}
