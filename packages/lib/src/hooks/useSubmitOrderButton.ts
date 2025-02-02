import React, { useCallback } from "react";
import { query } from "./query";
import { SwapStatus } from "@orbs-network/swap-ui";
import { useWidgetContext } from "..";

export function useSubmitOrderButton(onClick?: () => void) {
  const {
    translations: t,
    state: { swapStatus, disclaimerAccepted },
  } = useWidgetContext();
  const isLoading = swapStatus === SwapStatus.LOADING;

  const { isLoading: allowanceLoading } = query.useAllowance();

  const loading = isLoading || allowanceLoading;

  return {
    text: t.placeOrder,
    onClick: onClick,
    loading,
    disabled: loading || !disclaimerAccepted,
  };
}
