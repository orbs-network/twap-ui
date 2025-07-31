import { TwapAbi } from "@orbs-network/twap-sdk";
import { useMemo } from "react";
import { useTwapContext } from "../context";
import { ensureWrappedToken } from "../utils";
import { useDstMinAmount } from "./use-dst-min-amount-out";
import { useSrcChunkAmount } from "./use-src-chunk-amount";
import { useDeadline } from "./use-deadline";
import { useFillDelay } from "./use-fill-delay";
import { useSrcAmount } from "./use-src-amount";

export const useOrderSubmissionArgs = () => {
  const { twapSDK: sdk, srcToken: _srcToken, dstToken, chainId, account } = useTwapContext();
  const destTokenMinAmount = useDstMinAmount().amountWei;
  const srcChunkAmount = useSrcChunkAmount().amountWei;
  const deadline = useDeadline();
  const fillDelay = useFillDelay().fillDelay;
  const srcAmount = useSrcAmount().amountWei;

  return useMemo(() => {
    const srcToken = _srcToken && chainId ? ensureWrappedToken(_srcToken, chainId) : undefined;

    if (!srcToken || !dstToken) return;
    return {
      params: sdk.getAskParams({
        destTokenMinAmount,
        srcChunkAmount,
        deadline,
        fillDelay,
        srcAmount,
        srcTokenAddress: srcToken.address,
        destTokenAddress: dstToken.address,
      }),
      abi: TwapAbi,
      functionName: "ask",
      contractAddress: sdk.config.twapAddress,
      account,
    };
  }, [dstToken, destTokenMinAmount, srcChunkAmount, deadline, fillDelay, srcAmount, sdk, _srcToken, chainId, account]);
};
