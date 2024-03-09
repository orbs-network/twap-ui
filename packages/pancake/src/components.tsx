import { Components, getTokenFromTokensList, hooks, store } from "@orbs-network/twap-ui";
import React, { useMemo } from "react";
import { useAdapterContext } from "./context";
import BN from "bignumber.js";
import { StyledMarketPriceContainer } from "./styles";

export function Price() {
  const outAmountLoading = hooks.useOutAmountLoading();
  const { TradePrice: DappTradePrice, dappTokens } = useAdapterContext();

  const { srcToken, dstToken, srcAmount, dstAmount } = store.useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
    srcAmount: s.getSrcAmount()?.toString(),
    dstAmount: s.dstAmount,
  }));

  const { inputCurrency, outputCurrency } = useMemo(() => {
    return {
      inputCurrency: getTokenFromTokensList(dappTokens, srcToken?.address) || getTokenFromTokensList(dappTokens, srcToken?.symbol),
      outputCurrency: getTokenFromTokensList(dappTokens, dstToken?.address) || getTokenFromTokensList(dappTokens, dstToken?.symbol),
    };
  }, [srcToken, dstToken, dappTokens]);

  if (!DappTradePrice) {
    return <Components.OrderSummaryLimitPrice />;
  }

  if (!inputCurrency || !outputCurrency || BN(srcAmount || "0").isZero() || BN(dstAmount || "0").isZero()) {
    return null;
  }

  return (
    <StyledMarketPriceContainer>
      <Components.Base.Label>Price</Components.Base.Label>
      <DappTradePrice loading={outAmountLoading} inputCurrency={inputCurrency} outputCurrency={outputCurrency} inputAmount={srcAmount} outAmount={dstAmount} />
    </StyledMarketPriceContainer>
  );
}
