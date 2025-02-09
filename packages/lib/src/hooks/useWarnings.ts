import { useMemo } from "react";
import { amountBNV2, AMOUNT_TO_BORROW, feeOnTransferDetectorAddresses, Token, useWidgetContext } from "..";
import { useSrcBalance } from "./useBalances";
import { useMaxSrcInputAmount } from "./useMaxSrcInputAmount";
import BN from "bignumber.js";
import FEE_ON_TRANSFER_ABI from "../abi/FEE_ON_TRANSFER.json";
import { useQuery } from "@tanstack/react-query";
import { useNetwork } from "./useNetwork";
import { decodeEventLog } from "viem";
import { erc20abi } from "@defi.org/web3-candies";

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

// export const useFeeOnTransfer = (tokenAddress?: string) => {
//   const { config, publicClient } = useWidgetContext();

//   const address = useMemo(() => {
//     if (!config.chainId) return undefined;
//     return feeOnTransferDetectorAddresses[config.chainId as keyof typeof feeOnTransferDetectorAddresses];
//   }, [config.chainId]);

//   const network = useNetwork();
//   return useQuery({
//     queryFn: async () => {
//       try {
//         if (!address) return null;

//         // const res1 = await readContract(publicClient, {
//         //   address: tokenAddress,
//         //   abi: FEE_ON_TRANSFER_ABI,
//         //   functionName: "validate",
//         //   args: [tokenAddress, network?.wToken.address, AMOUNT_TO_BORROW],
//         // });

//         // console.log({ res1 });

//         return {
//           buyFee: undefined,
//           sellFee: undefined,
//           hasFeeOnTranfer: false,
//         };
//       } catch (error) {
//         console.log({ error });

//         return null;
//       }
//     },
//     queryKey: ["useFeeOnTransfer", tokenAddress, config.chainId, address],
//     enabled: !!tokenAddress && !!config && !!network,
//     staleTime: Infinity,
//   });
// };

export const useFeeOnTransferError = () => {
  const { srcToken, dstToken, translations: t } = useWidgetContext();
  // const { data: srcFee, isLoading: srcLoading } = useFeeOnTransfer(srcToken?.address);
  // const { data: dstFee, isLoading: dstLoading } = useFeeOnTransfer(dstToken?.address);
  // const hasError = srcFee?.hasFeeOnTranfer || dstFee?.hasFeeOnTranfer;

  return {
    isLoading: false,
    feeError: false,
  };
};
