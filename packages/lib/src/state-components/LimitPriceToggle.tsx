import React from "react";
import { Switch, Tooltip } from "../components";
import { useTwapContext } from "../context";
import { useLoadingState } from "../hooks";
import { useTwapStore } from "../store";

function LimitPriceToggle() {
  const loadingState = useLoadingState();
  const isLoading = loadingState.srcUsdLoading && loadingState.dstUsdLoading;
  const translations = useTwapContext().translations;
  const { leftToken, rightToken } = useTwapStore((state) => state.getLimitPrice(false));
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const toggleLimit = useTwapStore((store) => store.toggleLimitOrder);
  const selectTokensWarning = !leftToken || !rightToken;

  return (
    <Tooltip text={isLoading ? `${translations.loading}...` : selectTokensWarning ? translations.selectTokens : ""}>
      <Switch disabled={!!selectTokensWarning || isLoading} value={isLimitOrder} onChange={toggleLimit} />
    </Tooltip>
  );
}

export default LimitPriceToggle;
