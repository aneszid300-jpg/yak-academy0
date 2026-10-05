import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { getBalance, onPaymentChange } from "../../services/paymentService.js";

/**
 * The student's wallet credit, from paymentService.getBalance():
 * { status: "loading"|"ready"|"error", balance: Balance|null, reload }.
 * Refreshed when a payment changes. "error" (e.g. no backend yet) means the
 * balance is unknown — the UI then simply does not show it.
 */
export function useBalance() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [state, setState] = useState({ status: "loading", balance: null });

  const load = useCallback(async () => {
    try {
      setState({ status: "ready", balance: await getBalance() });
    } catch {
      setState({ status: "error", balance: null });
    }
  }, []);

  useEffect(() => {
    if (!userId) return undefined;
    load();
    return onPaymentChange(load);
  }, [userId, load]);

  return { ...state, reload: load };
}
