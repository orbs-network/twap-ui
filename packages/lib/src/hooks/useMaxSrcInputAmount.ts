import { isNativeAddress } from "@defi.org/web3-candies";
import { useMemo } from "react";
import { useWidgetContext } from "..";
import { amountBNV2, getMinNativeBalance } from "../utils";
import { useSrcBalance } from "./useBalances";
import BN from "bignumber.js";

export const useMaxSrcInputAmount = () => {
  const { srcToken, config } = useWidgetContext();
  const srcBalance = useSrcBalance().data?.toString();

  return useMemo(() => {
    if (srcBalance && isNativeAddress(srcToken?.address || "")) {
      const srcTokenMinimum = amountBNV2(srcToken?.decimals, getMinNativeBalance(config.chainId).toString());
      return BN.max(0, BN.min(BN(srcBalance).minus(srcTokenMinimum))).toString();
    }
  }, [srcToken, srcBalance, config.chainId]);
};
