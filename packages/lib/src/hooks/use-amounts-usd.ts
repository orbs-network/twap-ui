import { useTwapContext } from "../context/twap-context";
import { useUsdAmount } from "./helper-hooks";
import { useDstTokenAmount } from "./use-dst-amount";
import { useSrcAmount } from "./use-src-amount";

export const useAmountsUsd = () => {
  const { srcUsd1Token, dstUsd1Token } = useTwapContext();
  const srcAmount = useSrcAmount().amountUI;
  const dstAmount = useDstTokenAmount().amountUI;
  const srcAmountUsd = useUsdAmount(srcAmount, srcUsd1Token);
  const dstAmountUsd = useUsdAmount(dstAmount, dstUsd1Token);
  return { srcAmountUsd, dstAmountUsd };
};
