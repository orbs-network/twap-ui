import { useMemo } from "react";
import { useAmountUi, useWidgetContext } from "..";
import BN from "bignumber.js";
import { useShouldWrapOrUnwrapOnly } from "./useShouldWrapOrUnwrap";

const getUsdAmount = (amount?: string, usd?: string | number) => {
  if (!amount || !usd || BN(amount || "0").isZero() || BN(usd || "0").isZero()) return "0";
  return BN(amount || "0")
    .times(usd)
    .toString();
};
export const useUsdAmount = () => {
  const {
    dstUsd1Token,
    dstToken,
    srcUsd1Token,
    twap,
    state: { typedSrcAmount },
  } = useWidgetContext();
  const { destTokenAmount } = twap.derivedState;
  const isWrapOrUnwrap = useShouldWrapOrUnwrapOnly();
  const destTokenAmountUI = useAmountUi(dstToken?.decimals, destTokenAmount);

  const srcUsd = useMemo(() => getUsdAmount(typedSrcAmount, srcUsd1Token), [typedSrcAmount, srcUsd1Token]);
  const dstUsd = useMemo(() => getUsdAmount(destTokenAmountUI, dstUsd1Token), [destTokenAmountUI, dstUsd1Token]);

  return {
    srcUsd,
    dstUsd: isWrapOrUnwrap ? srcUsd : dstUsd,
  };
};
