import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { getWallet, onPaymentChange } from "../../services/paymentService.js";

/** «محفظتي» data: { status: "loading"|"ready"|"error", wallet, error, reload }. Nothing is persisted. */
export function useWallet() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [state, setState] = useState({ status: "loading", wallet: null, error: null });

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setState({ status: "loading", wallet: null, error: null });
    try {
      setState({ status: "ready", wallet: await getWallet(), error: null });
    } catch (error) {
      setState({ status: "error", wallet: null, error });
    }
  }, []);

  useEffect(() => {
    if (!userId) return undefined;
    load();
    return onPaymentChange(() => load({ quiet: true }));
  }, [userId, load]);

  return { ...state, reload: () => load() };
}
