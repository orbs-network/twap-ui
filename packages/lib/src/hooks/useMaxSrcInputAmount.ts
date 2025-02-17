import { isNativeAddress } from "@defi.org/web3-candies";
import { useMemo } from "react";
import { useWidgetContext } from "..";
import { getMinNativeBalance } from "../utils";
import BN from "bignumber.js";
import { amountBN } from "@orbs-network/twap-sdk";

export const useMaxSrcInputAmount = () => {
  const { srcToken, config, srcBalance } = useWidgetContext();

  return useMemo(() => {
    if (srcBalance && isNativeAddress(srcToken?.address || "")) {
      const srcTokenMinimum = amountBN(srcToken?.decimals, getMinNativeBalance(config.chainId).toString());
      return BN.max(0, BN.min(BN(srcBalance).minus(srcTokenMinimum))).toString();
    }
  }, [srcToken, srcBalance, config.chainId]);
};
