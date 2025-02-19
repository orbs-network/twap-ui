import { useMemo } from "react";
import { useWidgetContext } from "..";
import BN from "bignumber.js";
import { useShouldWrapOrUnwrapOnly } from "./useShouldWrapOrUnwrap";

const getUsdAmount = (amount?: string, usd?: string | number) => {
  if (!amount || !usd || BN(amount || "0").isZero() || BN(usd || "0").isZero()) return "0";
  return BN(amount || "0")
    .times(usd)
    .toString();
};
export const useUsdAmount = () => {
  const { dstUsd1Token, srcUsd1Token, twap } = useWidgetContext();
  const { srcAmountUI, destTokenAmountUI } = twap.values;
  const isWrapOrUnwrap = useShouldWrapOrUnwrapOnly();

  const srcUsd = useMemo(() => getUsdAmount(srcAmountUI, srcUsd1Token), [srcAmountUI, srcUsd1Token]);
  const dstUsd = useMemo(() => getUsdAmount(destTokenAmountUI, dstUsd1Token), [destTokenAmountUI, dstUsd1Token]);

  return {
    srcUsd,
    dstUsd: isWrapOrUnwrap ? srcUsd : dstUsd,
  };
};
