import React, { useCallback } from "react";
import { useTwapContext } from "../context/context";
import { useSetSwapSteps } from "./lib";
import { query } from "./query";
import { SwapStatus } from "@orbs-network/swap-ui";

export function useSubmitOrderButton(onClick?: () => void) {
  const {
    translations: t,
    state: { swapStatus, disclaimerAccepted },
  } = useTwapContext();
  const isLoading = swapStatus === SwapStatus.LOADING;

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
    disabled: loading || !disclaimerAccepted,
  };
}
