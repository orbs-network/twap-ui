import { useMemo } from "react";
import { useTwapContext } from "../context";
import { useAmountUi } from "./helper-hooks";
import { useSrcAmount } from "./use-src-amount";
import { useTradePrice } from "./use-trade-price";

export const useDstAmount = () => {
  const { twapSDK, srcToken, dstToken } = useTwapContext();
  const srcAmountWei = useSrcAmount().amountWei;
  const price = useTradePrice();

  const amountWei = useMemo(() => twapSDK.getDestTokenAmount(srcAmountWei || "", price, srcToken?.decimals || 0), [twapSDK, srcAmountWei, price, srcToken?.decimals]);

  return {
    amountWei,
    amountUI: useAmountUi(dstToken?.decimals, amountWei),
  };
};
