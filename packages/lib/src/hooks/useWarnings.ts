import { useMemo } from "react";
import { AMOUNT_TO_BORROW, feeOnTransferDetectorAddresses, useWidgetContext } from "..";
import { useSrcBalance } from "./useBalances";
import { useMaxSrcInputAmount } from "./useMaxSrcInputAmount";
import BN from "bignumber.js";
import FEE_ON_TRANSFER_ABI from "../abi/FEE_ON_TRANSFER.json";
import { useQuery } from "@tanstack/react-query";
import { useGetContract } from "./useGetContract";
import { useNetwork } from "./useNetwork";

export const useBalanceWaning = () => {
  const { data: srcBalance } = useSrcBalance();
  const maxSrcInputAmount = useMaxSrcInputAmount();
  const { translations: t, twap } = useWidgetContext();
  const srcAmount = twap.values.srcAmount;

  return useMemo(() => {
    const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && BN(srcAmount)?.gt(maxSrcInputAmount);

    if ((srcBalance && BN(srcAmount).gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return t.insufficientFunds;
    }
  }, [srcBalance?.toString(), srcAmount, maxSrcInputAmount?.toString(), t]);
};

export const useFeeOnTransfer = (tokenAddress?: string) => {
  const { config } = useWidgetContext();

  const address = useMemo(() => {
    if (!config.chainId) return undefined;
    return feeOnTransferDetectorAddresses[config.chainId as keyof typeof feeOnTransferDetectorAddresses];
  }, [config.chainId]);

  const network = useNetwork();

  const getContract = useGetContract();

  return useQuery({
    queryFn: async () => {
      try {
        if (!address) return null;
        const contract = getContract(FEE_ON_TRANSFER_ABI as any, address!);

        if (!contract) {
          return null;
        }
        const res = await contract?.methods.validate(tokenAddress, network?.wToken.address, AMOUNT_TO_BORROW).call();
        return {
          buyFee: res.buyFeeBps,
          sellFee: res.sellFeeBps,
          hasFeeOnTranfer: BN(res.buyFeeBps).gt(0) || BN(res.sellFeeBps).gt(0),
        };
      } catch (error) {
        return null;
      }
    },
    queryKey: ["useFeeOnTransfer", tokenAddress, config.chainId, address],
    enabled: !!tokenAddress && !!config && !!network,
    staleTime: Infinity,
  });
};

export const useFeeOnTransferError = () => {
  const { srcToken, dstToken, translations: t } = useWidgetContext();
  const { data: srcFee, isLoading: srcLoading } = useFeeOnTransfer(srcToken?.address);
  const { data: dstFee, isLoading: dstLoading } = useFeeOnTransfer(dstToken?.address);
  const hasError = srcFee?.hasFeeOnTranfer || dstFee?.hasFeeOnTranfer;

  return {
    isLoading: srcLoading || dstLoading,
    feeError: hasError ? t.feeOnTranferWarning : undefined,
  };
};
