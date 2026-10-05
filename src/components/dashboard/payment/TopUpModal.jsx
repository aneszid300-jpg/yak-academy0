import { useState } from "react";
import { createPortal } from "react-dom";
import { useDialog } from "../../../hooks/useDialog.js";
import TopUpMethodView, { TopUpChooserView } from "./TopUpMethodView.jsx";

// «محفظتي» → «شحن الرصيد»: the same top-up views as the course details
// window, centered over the page, for a top-up with a typed amount. Starts on
// the method list («شحن المحفظة»), or directly on `method` when given.
export default function TopUpModal({ method: initial = null, onClose }) {
  useDialog(onClose);
  const [method, setMethod] = useState(initial);
  return createPortal(
    <div
      className="course-modal"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={"course-modal-card" + (method ? " is-wide" : "")} role="dialog" aria-modal="true" aria-labelledby="courseModalTitle">
        {method ? (
          <TopUpMethodView method={method} onBack={initial ? undefined : () => setMethod(null)} onClose={onClose} />
        ) : (
          <TopUpChooserView onChoose={setMethod} onClose={onClose} />
        )}
      </div>
    </div>,
    document.body
  );
}
