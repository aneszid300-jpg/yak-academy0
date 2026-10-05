import { useEffect } from "react";

// Shared behaviour of the centered dialogs (course details, wallet top-up):
// Escape closes, and the page behind does not scroll while it is open.
export function useDialog(onClose) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);
}
