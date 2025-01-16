import React, { useCallback } from "react";
import { useTwapContext } from "../context/context";
import { useSetSwapSteps } from "./lib";
import { query } from "./query";

export function useSubmitOrderButton(onClick?: () => void) {
  const {
    translations: t,
    state: { swapStatus },
  } = useTwapContext();
  const isLoading = swapStatus === "loading";

  const setSwapSteps = useSetSwapSteps();
  const { isLoading: allowanceLoading } = query.useAllowance();

  const loading = isLoading || allowanceLoading;

  const _onClick = useCallback(() => {
    setSwapSteps();
    onClick?.();
  }, [setSwapSteps, onClick]);

  return {
    text: t.placeOrder,
    onClick: _onClick,
    loading,
    disabled: loading,
  };
}
