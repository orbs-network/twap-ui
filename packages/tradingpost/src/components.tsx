import { Components, hooks, store } from "@orbs-network/twap-ui";
import { useAdapterContext } from "./context";
import BN from "bignumber.js";
import { StyledMarketPriceContainer } from "./styles";
import { styled } from "@mui/material";
import { useMemo } from "react";

export function Price() {
  const { TradePrice: DappTradePrice } = useAdapterContext();
  const { srcToken, dstToken, srcAmount, isLimitOrder } = store.useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
    srcAmount: s.getSrcAmount().toString(),
    isLimitOrder: s.isLimitOrder,
  }));

  const { limitPrice, isLoading, inverted } = hooks.useLimitPriceV2();
  const { marketPrice } = hooks.useMarketPriceV2(inverted);

  const price = hooks.useFormatNumber({ value: isLimitOrder ? limitPrice?.toggled : marketPrice?.toggled, decimalScale: 3, disableDynamicDecimals: false });

  if (!DappTradePrice) {
    return <Components.OrderSummaryLimitPrice />;
  }

  if (!srcToken || !dstToken || BN(srcAmount || "0").isZero()) {
    return null;
  }

  const leftSymbol = inverted ? dstToken?.symbol : srcToken?.symbol;
  const rightSymbol = inverted ? srcToken?.symbol : dstToken?.symbol;

  return (
    <StyledMarketPriceContainer>
      <div style={{ opacity: isLoading ? 0 : 1 }}>
        <DappTradePrice leftSymbol={leftSymbol} rightSymbol={rightSymbol} price={price} />
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
