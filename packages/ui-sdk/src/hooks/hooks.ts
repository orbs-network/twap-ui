import { useMemo } from "react";
import { isNativeAddress, eqIgnoreCase } from "@defi.org/web3-candies";
import { useTwapContext } from "../context";
import { useNetwork } from "./useNetwork";

export const useShouldOnlyWrap = () => {
  const {
    state: { srcToken, destToken },
  } = useTwapContext();
  const network = useNetwork();

  return useMemo(() => {
    return isNativeAddress(srcToken?.address || "") && eqIgnoreCase(destToken?.address || "", network?.wToken.address || "");
  }, [srcToken, destToken, network]);
};

export const useShouldUnwrap = () => {
  const {
    state: { srcToken, destToken },
  } = useTwapContext();
  const network = useNetwork();

  return useMemo(() => {
    return eqIgnoreCase(srcToken?.address || "", network?.wToken.address || "") && isNativeAddress(destToken?.address || "");
  }, [srcToken, destToken, network]);
};

export const useShouldWrapOrUnwrapOnly = () => {
  const wrap = useShouldOnlyWrap();
  const unwrap = useShouldUnwrap();

  return wrap || unwrap;
};
