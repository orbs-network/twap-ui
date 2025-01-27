import React, { useCallback } from "react";
import { useWidgetContext } from "../context/context";
import { query } from "./query";
import { SwapStatus } from "@orbs-network/swap-ui";

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
