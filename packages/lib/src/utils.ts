import { AddressPadding, OrderType, Token } from "./types";
import BN from "bignumber.js";
import { getNetwork, isNativeAddress, networks, TwapAbi } from "@orbs-network/twap-sdk";
import { decodeEventLog, TransactionReceipt } from "viem";

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

function indexWhereZerosEnd(numberStr?: string) {
  if (!numberStr) return 0;

  // Split the number into the integer and decimal parts
  const parts = numberStr.split(".");
  if (parts.length < 2) {
    return -1; // No decimal part
  }

  const decimalPart = parts[1];

  // Match leading zeros in the decimal part
  const match = decimalPart.match(/^(0+)/);

  if (match) {
    // Return the length of the leading zeros (index where zeros end in decimal part)
    return match[1].length;
  } else {
    // If there are no leading zeros, return 0
    return 0;
  }
}

export const formatDecimals = (value?: string | BN | number, decimalPlaces?: number) => {
  if (!value) return "";
  const index = indexWhereZerosEnd(BN(value).toString());
  const decimals = decimalPlaces || 6;

  const res = BN(value).gt(1) && index >= 1 ? 0 : index > 8 ? 0 : index + decimals;

  return BN(value).decimalPlaces(res, BN.ROUND_DOWN).toString();
};

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
  const decodedLog = (decodeEventLog as any)({
    abi: TwapAbi,
    data: receipt.logs[0].data,
    topics: receipt.logs[0].topics,
    eventName: "OrderCreated",
  });

  return Number(decodedLog.args.id);
}

export const ensureWrappedToken = (token: Token, chainId: number) => {
  const network = getNetwork(chainId);
  if (!network) throw new Error("Invalid chainId");
  if (isNativeAddress(token.address)) {
    return network.wToken;
  }
  return token;
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
