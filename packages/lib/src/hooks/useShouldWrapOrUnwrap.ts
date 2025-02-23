import { useMemo } from "react";
import { useWidgetContext } from "..";
import { useNetwork } from "./useNetwork";
import { eqIgnoreCase, isNativeAddress } from "@orbs-network/twap-sdk";

export const useShouldOnlyWrap = () => {
  const { srcToken, dstToken } = useWidgetContext();
  const network = useNetwork();

  return useMemo(() => {
    if (!srcToken || !dstToken || !network) return false;
    return isNativeAddress(srcToken?.address || "") && eqIgnoreCase(dstToken?.address || "", network?.wToken.address || "");
  }, [srcToken, dstToken, network]);
};

export const useShouldUnwrap = () => {
  const { srcToken, dstToken } = useWidgetContext();
  const network = useNetwork();

  return useMemo(() => {
    if (!srcToken || !dstToken || !network) return false;

    return eqIgnoreCase(srcToken?.address || "", network?.wToken.address || "") && isNativeAddress(dstToken?.address || "");
  }, [srcToken, dstToken, network]);
};

export const useShouldWrapOrUnwrapOnly = () => {
  const wrap = useShouldOnlyWrap();
  const unwrap = useShouldUnwrap();

  return wrap || unwrap;
};

export const useShouldWrap = () => {
  const { srcToken } = useWidgetContext();

  return useMemo(() => isNativeAddress(srcToken?.address || ""), [srcToken]);
};
