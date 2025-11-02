import { amountBN, amountUi, getNetwork } from "@orbs-network/twap-sdk";
import { useMemo } from "react";
import { useTwapContext } from "../context/twap-context";
import BN from "bignumber.js";
import { formatDecimals, shouldUnwrapOnly, shouldWrapOnly } from "../utils";
import moment from "moment";
import { useNumericFormat } from "react-number-format";

export const useAmountBN = (decimals?: number, value?: string) => {
  return useMemo(() => amountBN(decimals, value), [decimals, value]);
};

export const useAmountUi = (decimals?: number, value?: string) => {
  return useMemo(() => amountUi(decimals, value), [decimals, value]);
};

export const useNetwork = () => {
  const { chainId } = useTwapContext();
  return useMemo(() => getNetwork(chainId), [chainId]);
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

export function useCopyToClipboard() {
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return copy;
}

export const useFormatDecimals = (value?: string | number, decimalPlaces?: number) => {
  return useMemo(() => formatDecimals(value?.toString(), decimalPlaces), [value, decimalPlaces]);
};

export const useFormatNumber = ({ value, decimalScale = 3, prefix, suffix }: { value?: string | number; decimalScale?: number; prefix?: string; suffix?: string }) => {
  const _value = useFormatDecimals(value, decimalScale);
  const { overrides } = useTwapContext();
  const numberFormat = overrides?.numberFormat;

  const result = useNumericFormat({
    allowLeadingZeros: true,
    thousandSeparator: ",",
    displayType: "text",
    value: _value || "",
    decimalScale: 18,
    prefix,
    suffix,
  });

  if (numberFormat) {
    return numberFormat(value || "");
  }

  return result.value?.toString();
};
