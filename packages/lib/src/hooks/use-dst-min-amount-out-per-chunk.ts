import { useMemo } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useTradePrice } from "./use-trade-price";
import { useAmountUi } from "./helper-hooks";
import { useSrcChunkAmount } from "./use-src-chunk-amount";

export const useDstMinAmountPerChunk = () => {
  const { twapSDK, srcToken, dstToken } = useTwapContext();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const srcTokenChunkAmount = useSrcChunkAmount().amountWei;
  const price = useTradePrice();
  const amountWei = useMemo(
    () => twapSDK.getDestTokenMinAmountPerChunk(srcTokenChunkAmount, price, Boolean(isMarketOrder), srcToken?.decimals || 0),
    [twapSDK, srcTokenChunkAmount, price, isMarketOrder, srcToken?.decimals],
  );

  return {
    amountWei,
    amountUI: useAmountUi(dstToken?.decimals, amountWei),
  };
};
