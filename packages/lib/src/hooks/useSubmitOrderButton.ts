import React, { useCallback } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../store";
import { useSetSwapSteps } from "./hooks";
import { query } from "./query";

export function useSubmitOrderButton(onClick?: () => void) {
  const t = useTwapContext().translations;
  const { isLoading, disclaimerAccepted } = useTwapStore((s) => ({
    isLoading: s.swapState === "loading",
    disclaimerAccepted: s.disclaimerAccepted,
  }));
  const setSwapSteps = useSetSwapSteps();
  const { isLoading: allowanceLoading } = query.useAllowance();

  const loading = isLoading || allowanceLoading;

  const _onClick = useCallback(() => {
    setSwapSteps();
    onClick?.();
  }, [setSwapSteps, onClick]);

  return {
    text: loading ? "Loading..." : t.placeOrder,
    onClick: _onClick,
    loading,
    disabled: loading || !disclaimerAccepted,
  };
}
