import { useCallback, useEffect, useState } from "react";
import { getLiveSession } from "../../services/liveService.js";

/**
 * One live session from liveService:
 *   { state: "loading" | "ready" | "not_found" | "error", session, error, reload }
 * `reload` re-fetches (e.g. after «إعادة المحاولة», or to pick up a join link
 * added after the page was opened).
 */
export function useLiveSession(sessionId) {
  const [data, setData] = useState({ state: "loading", session: null, error: null });

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setData({ state: "loading", session: null, error: null });
      try {
        const session = await getLiveSession(sessionId);
        setData({ state: session ? "ready" : "not_found", session, error: null });
      } catch (error) {
        setData({ state: "error", session: null, error });
      }
    },
    [sessionId]
  );

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, reload: () => load({ quiet: data.state === "ready" }) };
}
