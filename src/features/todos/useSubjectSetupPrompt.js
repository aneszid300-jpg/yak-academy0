import { useEffect, useState } from "react";
import { isSubjectSetupDone } from "./store.js";

// «ثبّت ألوان موادك» opens once, 250 ms after the first dashboard visit
// (legacy DOMContentLoaded). Used by the views that show tasks.
export function useSubjectSetupPrompt() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (isSubjectSetupDone()) return;
    const id = setTimeout(() => setOpen(true), 250);
    return () => clearTimeout(id);
  }, []);
  return [open, setOpen];
}
