import { Components, getTokenFromTokensList, hooks, store } from "@orbs-network/twap-ui";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAdapterContext } from "./context";
import BN from "bignumber.js";
import { StyledMarketPriceContainer } from "./styles";

export function Price({ onClick }: { onClick?: () => void }) {
  const { TradePrice: DappTradePrice, dappTokens } = useAdapterContext();
  const [currentSrcAmount, setCurrentSrcAmount] = useState("");
  const waitForOutAmount = useRef(true);
  const [currentOutAmount, setCurrentOutAmount] = useState("");
  const srcAmountRef = useRef("");
  const { srcToken, dstToken, srcAmount } = store.useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
    srcAmount: s.getSrcAmount()?.toString(),
    updateState: s.updateState,
  }));

  const { outAmount, isLoading } = hooks.useDstAmount();
  const { limitPrice } = hooks.useLimitPriceV2();

  console.log("render", currentSrcAmount);

  useEffect(() => {
    if (srcAmount) {
      waitForOutAmount.current = true;
      srcAmountRef.current = srcAmount;
    }
  }, [srcAmount, limitPrice]);

  useEffect(() => {
    if (waitForOutAmount.current && outAmount.raw && BN(outAmount.raw).isGreaterThan(0)) {
      waitForOutAmount.current = false;
      setCurrentSrcAmount(srcAmountRef.current);
      setCurrentOutAmount(outAmount.raw);
    }
  }, [outAmount.raw]);

  const { inputCurrency, outputCurrency } = useMemo(() => {
    return {
      inputCurrency: getTokenFromTokensList(dappTokens, srcToken?.address) || getTokenFromTokensList(dappTokens, srcToken?.symbol),
      outputCurrency: getTokenFromTokensList(dappTokens, dstToken?.address) || getTokenFromTokensList(dappTokens, dstToken?.symbol),
    };
  }, [srcToken, dstToken, dappTokens]);

  if (!DappTradePrice) {
    return <Components.OrderSummaryLimitPrice />;
  }

  if (!inputCurrency || !outputCurrency || !currentSrcAmount || BN(srcAmount).isZero() || BN(currentSrcAmount).isZero()) {
    return null;
  }

  return (
    <StyledMarketPriceContainer>
      <Components.Base.Label>Price</Components.Base.Label>
      <DappTradePrice
        onClick={onClick || (() => {})}
        loading={isLoading}
        inputCurrency={inputCurrency}
        outputCurrency={outputCurrency}
        inputAmount={currentSrcAmount.toString()}
        outAmount={currentOutAmount}
      />
    </StyledMarketPriceContainer>
  );
}
