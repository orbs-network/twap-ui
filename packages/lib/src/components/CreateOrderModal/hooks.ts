import { useOutAmount, useFormatNumberV2, useSrcAmountUsdUi, useDstAmountUsdUi } from "../../hooks";
import { useTwapStore } from "../../store";

export const useTokenDisplay = (isSrc?: boolean) => {
  const { token, srcAmount } = useTwapStore((s) => ({
    token: isSrc ? s.srcToken : s.dstToken,
    srcAmount: s.srcAmountUi,
  }));
  const outAmount = useOutAmount().outAmountUi;
  const amount = useFormatNumberV2({ value: isSrc ? srcAmount : outAmount, decimalScale: 4 });
  const srcUsd = useSrcAmountUsdUi();
  const dstUsd = useDstAmountUsdUi();
  const usd = useFormatNumberV2({ value: isSrc ? srcUsd : dstUsd, decimalScale: 2 });
  const title = isSrc ? "From" : "To";
  return {
    token,
    amount,
    usd,
    title
  };
};
