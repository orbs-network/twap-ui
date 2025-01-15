import React, { useCallback } from "react";
import { useTwapContext } from "../context/context";
import { useSetSwapSteps } from "./lib";
import { query } from "./query";
import { useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";

export function useSubmitOrderButton(onClick?: () => void) {
  const { translations: t } = useTwapContext();
  const { state } = useTwapContextUI();
  const { swapStatus } = state;
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
