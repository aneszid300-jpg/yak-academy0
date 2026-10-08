import { useCallback, useEffect, useState } from "react";
import { listUploads, onContentChange, uploadFile } from "../../services/contentService.js";

/** The professor's uploads: { status: "loading"|"ready"|"error", uploads, upload(courseId, kind, file) } */
export function useUploads() {
  const [state, setState] = useState({ status: "loading", uploads: [] });

  const load = useCallback(async () => {
    try {
      setState({ status: "ready", uploads: await listUploads() });
    } catch {
      setState({ status: "error", uploads: [] });
    }
  }, []);

  useEffect(() => {
    load();
    return onContentChange(load);
  }, [load]);

  const upload = useCallback((courseId, kind, file) => uploadFile({ courseId, kind, file }), []);
  return { ...state, upload };
}
