import { AddressPadding, OrderType, Token } from "./types";
import { eqIgnoreCase, getNetwork, isNativeAddress, networks, TimeDuration, TimeUnit, TWAP_ABI } from "@orbs-network/twap-sdk";
import { decodeEventLog, TransactionReceipt } from "viem";
export { getOrderLimitPriceRate } from "@orbs-network/twap-sdk";

export const removeCommas = (numStr: string): string => {
  return numStr.replace(/,/g, "");
};

type CopyFn = (text: string) => Promise<boolean>; // Return success

export const copy: CopyFn = async (text) => {
  if (!navigator?.clipboard) {
    console.warn("Clipboard not supported");
    return false;
  }

  // Try to save to clipboard then save it in the state if worked
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn("Copy failed", error);

    return false;
  }
};

export const fillDelayText = (value?: number) => {
  if (!value) {
    return "";
  }

  const secondsTotal = Math.floor(value / 1000);
  const days = Math.floor(secondsTotal / (24 * 60 * 60));
  const hours = Math.floor((secondsTotal % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((secondsTotal % (60 * 60)) / 60);
  const seconds = secondsTotal % 60;

  const arr: string[] = [];

  if (days) {
    arr.push(`${days} days `);
  }
  if (hours) {
    arr.push(`${hours} hours `);
  }
  if (minutes) {
    arr.push(`${minutes} minutes`);
  }
  if (seconds) {
    arr.push(`${seconds} seconds`);
  }

  return arr.join(" ");
};

export const makeElipsisAddress = (address?: string, padding?: AddressPadding): string => {
  if (!address) return "";
  return `${address.substring(0, padding?.start || 6)}...${address.substring(address.length - (padding?.end || 5))}`;
};

export const parseError = (error?: any) => {
  const defaultText = "An error occurred.";
  if (!error || !error.message) return defaultText;
  try {
    if (error.message.toLowerCase().indexOf("rejected")) {
      return "Transaction Rejected";
    }
    return defaultText;
  } catch (error) {
    return defaultText;
  }
};

export function formatDecimals(value?: string, scale = 6, maxDecimals = 8): string {
  if (!value) return "";

  // ─── keep the sign, work with the absolute value ────────────────
  const sign = value.startsWith("-") ? "-" : "";
  const abs = sign ? value.slice(1) : value;

  const [intPart, rawDec = ""] = abs.split(".");

  // Fast-path: decimal part is all zeros (or absent) ───────────────
  if (!rawDec || Number(rawDec) === 0) return sign + intPart;

  /** Case 1 – |value| ≥ 1 *****************************************/
  if (intPart !== "0") {
    const sliced = rawDec.slice(0, scale);
    const cleaned = sliced.replace(/0+$/, ""); // drop trailing zeros
    const trimmed = cleaned ? "." + cleaned : "";
    return sign + intPart + trimmed;
  }

  /** Case 2 – |value| < 1 *****************************************/
  const firstSigIdx = rawDec.search(/[^0]/); // first non-zero position
  if (firstSigIdx === -1) return "0"; // decimal part is all zeros
  if (firstSigIdx + 1 > maxDecimals) return "0"; // too many leading zeros → 0

  const leadingZeros = rawDec.slice(0, firstSigIdx); // keep them
  const significantRaw = rawDec.slice(firstSigIdx).slice(0, scale);
  const significant = significantRaw.replace(/0+$/, ""); // trim trailing zeros

  return significant ? sign + "0." + leadingZeros + significant : "0";
}

export const isTxRejected = (error: any) => {
  if (error?.message) {
    return error.message?.toLowerCase()?.includes("rejected") || error.message?.toLowerCase()?.includes("denied");
  }
};

export const isNativeBalanceError = (error: any) => {
  try {
    if (error) {
      const message = error?.message?.toLowerCase() || error?.toLowerCase();
      return message?.includes("insufficient") || message?.includes("gas required exceeds allowance");
    }
  } catch (error) {
    return false;
  }
};

export const getMinNativeBalance = (chainId: number) => {
  switch (chainId) {
    case networks.base.id:
      return 0.0001;

    default:
      return 0.01;
  }
};

export function getOrderIdFromCreateOrderEvent(receipt: TransactionReceipt) {
  try {
    const decodedLog = (decodeEventLog as any)({
      abi: TWAP_ABI,
      data: receipt.logs[0].data,
      topics: receipt.logs[0].topics,
      eventName: "OrderCreated",
    });

    return Number(decodedLog.args.id);
  } catch (error) {
    return undefined;
  }
}

export const ensureWrappedToken = (token: Token, chainId: number) => {
  const network = getNetwork(chainId);
  if (!network) return token;
  if (isNativeAddress(token.address)) {
    return network.wToken;
  }
  return token;
};

export const ensureWrappedTokenAddress = (address: string, chainId: number) => {
  const network = getNetwork(chainId);
  if (!network) return address;
  if (isNativeAddress(address)) {
    return network.wToken.address;
  }
  return address;
};

export function millisToDays(milliseconds?: number): number {
  if (!milliseconds) return 0;
  const millisecondsInADay = 86400000; // 24 * 60 * 60 * 1000
  return milliseconds / millisecondsInADay;
}

export function millisToMinutes(milliseconds?: number): number {
  if (!milliseconds) return 0;
  const millisecondsInAMinute = 60000; // 60 * 1000
  return milliseconds / millisecondsInAMinute;
}

export const getOrderType = (isMarketOrder: boolean, chunks: number) => {
  if (isMarketOrder) {
    return OrderType.TWAP_MARKET;
  }
  if (chunks === 1) {
    return OrderType.LIMIT;
  }
  return OrderType.TWAP_LIMIT;
};

export const shouldWrapOnly = (srcToken?: Token, dstToken?: Token, chainId?: number) => {
  const network = getNetwork(chainId);
  return isNativeAddress(srcToken?.address || "") && eqIgnoreCase(dstToken?.address || "", network?.wToken.address || "");
};

export const shouldUnwrapOnly = (srcToken?: Token, dstToken?: Token, chainId?: number) => {
  const network = getNetwork(chainId);
  return eqIgnoreCase(srcToken?.address || "", network?.wToken.address || "") && isNativeAddress(dstToken?.address || "");
};

export { eqIgnoreCase, isNativeAddress };

export const formatDuration = (ms?: number): TimeDuration | undefined => {
  const units = Object.values(TimeUnit) as number[];
  if (!ms) return;

  for (const unit of units) {
    if (ms >= unit) {
      const value = Math.round(ms / unit);
      return { value, unit };
    }
  }

  return { value: ms, unit: TimeUnit.Minutes };
};
