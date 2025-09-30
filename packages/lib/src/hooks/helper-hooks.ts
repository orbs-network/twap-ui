import { amountBN, amountUi, getNetwork } from "@orbs-network/twap-sdk";
import { useMemo } from "react";
import { useTwapContext } from "../context/twap-context";
import BN from "bignumber.js";
import { shouldUnwrapOnly, shouldWrapOnly } from "../utils";
import moment from "moment";

export const useAmountBN = (decimals?: number, value?: string) => {
  return useMemo(() => amountBN(decimals, value), [decimals, value]);
};

export const useAmountUi = (decimals?: number, value?: string) => {
  return useMemo(() => amountUi(decimals, value), [decimals, value]);
};

export const useNetwork = () => {
  const { config } = useTwapContext();
  return useMemo(() => getNetwork(config.chainId), [config]);
};

export const useExplorerLink = (txHash?: string) => {
  const network = useNetwork();
  return useMemo(() => {
    if (!txHash || !network) return undefined;
    return `${network.explorer}/tx/${txHash}`;
  }, [txHash, network]);
};

export const useUsdAmount = (amount?: string, usd?: string | number) => {
  return useMemo(() => {
    if (!amount || !usd || BN(amount || "0").isZero() || BN(usd || "0").isZero()) return "";
    return BN(amount || "0")
      .times(usd)
      .toFixed();
  }, [amount, usd]);
};

export const useShouldOnlyWrap = () => {
  const { srcToken, dstToken, chainId } = useTwapContext();

  return useMemo(() => {
    return shouldWrapOnly(srcToken, dstToken, chainId);
  }, [srcToken, dstToken, chainId]);
};

export const useShouldUnwrap = () => {
  const { srcToken, dstToken, chainId } = useTwapContext();

  return useMemo(() => {
    return shouldUnwrapOnly(srcToken, dstToken, chainId);
  }, [srcToken, dstToken, chainId]);
};

export const useShouldWrapOrUnwrapOnly = () => {
  const wrap = useShouldOnlyWrap();
  const unwrap = useShouldUnwrap();

  return wrap || unwrap;
};

export const useDateFormat = (date?: number) => {
  const { overrides } = useTwapContext();
  return useMemo(() => {
    if (overrides?.dateFormat) {
      return overrides.dateFormat(date || 0);
    }
    return moment(date).format("DD/MM/YYYY HH:mm");
  }, [date, overrides?.dateFormat]);
};
