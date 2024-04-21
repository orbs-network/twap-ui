import { Components, getTokenFromTokensList, hooks, store } from "@orbs-network/twap-ui";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAdapterContext } from "./context";
import BN from "bignumber.js";
import { StyledMarketPriceContainer } from "./styles";
import { safeInteger } from "@orbs-network/twap-ui";
import { styled } from "@mui/material";

export function Price({ onClick }: { onClick?: () => void }) {
  const { TradePrice: DappTradePrice, dappTokens } = useAdapterContext();
  const { srcToken, dstToken, isLimitOrder, srcAmount } = store.useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
    updateState: s.updateState,
    isLimitOrder: s.isLimitOrder,
    srcAmount: s.getSrcAmount().toString(),
  }));

  const { outAmount, isLoading } = hooks.useDstAmount();

  const { limitPrice, inverted, isCustom } = hooks.useLimitPriceV2();
  const limitStore = store.useLimitPriceStore();

  useEffect(() => {
    if (BN(srcAmount || "0").isZero() && !inverted) {
      limitStore.setInvertedByDefault();
    }
  }, [srcAmount, inverted, limitStore]);

  const { inputCurrency, outputCurrency } = useMemo(() => {
    return {
      inputCurrency: getTokenFromTokensList(dappTokens, srcToken?.address) || getTokenFromTokensList(dappTokens, srcToken?.symbol),
      outputCurrency: getTokenFromTokensList(dappTokens, dstToken?.address) || getTokenFromTokensList(dappTokens, dstToken?.symbol),
    };
  }, [srcToken, dstToken, dappTokens]);

  const amounts = hooks.useSrcAndDstAmounts();
  console.log({ amounts });

  if (!DappTradePrice) {
    return <Components.OrderSummaryLimitPrice />;
  }

  if (!inputCurrency || !outputCurrency || BN(amounts.inputAmount || "0").isZero() || BN(amounts.outAmount || "0").isZero()) {
    return null;
  }

  return (
    <StyledMarketPriceContainer>
      <Components.Base.Label>Price</Components.Base.Label>
      <div style={{ opacity: isLoading ? 0 : 1 }}>
        <DappTradePrice
          onClick={onClick || (() => {})}
          loading={isLoading}
          inputCurrency={inputCurrency}
          outputCurrency={outputCurrency}
          inputAmount={amounts.inputAmount}
          outAmount={amounts.outAmount}
        />
      </div>
      <StyledLoader loading={isLoading ? 1 : 0} />
    </StyledMarketPriceContainer>
  );
}

const StyledLoader = styled(Components.Base.Loader)<{ loading: number }>(({ loading }) => ({
  position: "absolute",
  width: "30%!important",
  height: "15px!important",
  top: "50%",
  transform: "translateY(-50%)",
  right: 0,
  display: loading ? "block" : ("none" as const),
  posinterEvents: "none",
}));
