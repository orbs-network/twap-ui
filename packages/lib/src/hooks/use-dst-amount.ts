import { useMemo } from "react";
import { useTwapContext } from "../context";
import { useAmountUi } from "./helper-hooks";
import { useSrcAmount } from "./use-src-amount";
import { useTradePrice } from "./use-trade-price";
import { getDestTokenAmount } from "@orbs-network/twap-sdk";

export const useDstAmount = () => {
  const { srcToken, dstToken } = useTwapContext();
  const srcAmountWei = useSrcAmount().amountWei;
  const price = useTradePrice();

  const amountWei = useMemo(() => getDestTokenAmount(srcAmountWei || "", price, srcToken?.decimals || 0), [srcAmountWei, price, srcToken?.decimals]);

  return {
    amountWei,
    amountUI: useAmountUi(dstToken?.decimals, amountWei),
  };
};
