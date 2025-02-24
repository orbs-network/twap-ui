import { useMemo } from "react";
import { useWidgetContext } from "..";
import { useMaxSrcInputAmount } from "./useMaxSrcInputAmount";
import BN from "bignumber.js";

export const useBalanceWaning = () => {
  const maxSrcInputAmount = useMaxSrcInputAmount();
  const { translations: t, twap, srcBalance } = useWidgetContext();
  const srcAmount = twap.values.srcAmount;

  return useMemo(() => {
    const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && BN(srcAmount)?.gt(maxSrcInputAmount);

    if ((srcBalance && BN(srcAmount).gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return t.insufficientFunds;
    }
  }, [srcBalance?.toString(), srcAmount, maxSrcInputAmount?.toString(), t]);
};

export const useFeeOnTransferError = () => {
  // const { data: srcFee, isLoading: srcLoading } = useFeeOnTransfer(srcToken?.address);
  // const { data: dstFee, isLoading: dstLoading } = useFeeOnTransfer(dstToken?.address);
  // const hasError = srcFee?.hasFeeOnTranfer || dstFee?.hasFeeOnTranfer;

  return {
    isLoading: false,
    feeError: false,
  };
};
