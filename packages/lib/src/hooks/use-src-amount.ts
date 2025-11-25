import { useMemo } from "react";
import { useTwapContext } from "../context/twap-context";
import { useTwapStore } from "../useTwapStore";
import { useAmountBN } from "./helper-hooks";
import BN from "bignumber.js";
import { amountBN, isNativeAddress } from "@orbs-network/twap-sdk";
import { getMinNativeBalance } from "../utils";
import { useTranslations } from "./use-translations";

export const useSrcAmount = () => {
  const { srcToken } = useTwapContext();
  const t = useTranslations();

  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const acceptedSrcAmount = useTwapStore((s) => s.state.acceptedSrcAmount);

  const value = acceptedSrcAmount || typedSrcAmount;

  return {
    amountWei: useAmountBN(srcToken?.decimals, value),
    amountUI: value,
    error: BN(value || 0).isZero() ? t("enterAmount") : undefined,
  };
};
