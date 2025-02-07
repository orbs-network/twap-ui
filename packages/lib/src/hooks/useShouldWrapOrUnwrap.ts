import { isNativeAddress, eqIgnoreCase } from "@defi.org/web3-candies";
import { useMemo } from "react";
import { useWidgetContext } from "..";
import { useNetwork } from "./useNetwork";

export const useShouldOnlyWrap = () => {
  const { srcToken, dstToken } = useWidgetContext();
  const network = useNetwork();

  return useMemo(() => {
    return isNativeAddress(srcToken?.address || "") && eqIgnoreCase(dstToken?.address || "", network?.wToken.address || "");
  }, [srcToken, dstToken, network]);
};

export const useShouldUnwrap = () => {
  const { srcToken, dstToken } = useWidgetContext();
  const network = useNetwork();

  return useMemo(() => {
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
