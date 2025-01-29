import { maxUint256, nativeTokenAddresses, THE_GRAPH_ORDERS_API } from "./consts";
import BN from "bignumber.js";
import { TimeDuration, TimeUnit } from "./types";

export const getTheGraphUrl = (chainId?: number) => {
  if (!chainId) return;
  return THE_GRAPH_ORDERS_API[chainId as keyof typeof THE_GRAPH_ORDERS_API];
};

export const groupBy = (array: any = [], key: string) => {
  return array.reduce((result: any, currentItem: any) => {
    const groupKey = currentItem[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(currentItem);
    return result;
  }, {});
};

type KeyByArray<T> = {
  [key: string]: T;
};

export const keyBy = <T>(array: T[], key: keyof T): KeyByArray<T> => {
  return array.reduce((result, currentItem) => {
    const groupKey = currentItem[key] as unknown as string;
    result[groupKey] = currentItem;
    return result;
  }, {} as KeyByArray<T>);
};

export const compact = <T>(array: (T | null | undefined | false | "")[]): T[] => {
  return array.filter((value): value is T => Boolean(value));
};

export const orderBy = <T>(array: T[], key: (item: T) => any, order: "asc" | "desc" = "asc"): T[] => {
  return array.slice().sort((a, b) => {
    const valueA = key(a);
    const valueB = key(b);

    if (valueA < valueB) return order === "asc" ? -1 : 1;
    if (valueA > valueB) return order === "asc" ? 1 : -1;
    return 0;
  });
};

export const amountUi = (decimals?: number, amount?: string) => {
  if (!decimals || !amount) return "";
  const percision = BN(10).pow(decimals || 0);
  return BN(amount).times(percision).idiv(percision).div(percision).toFixed();
};

export const amountBN = (decimals?: number, amount?: string) => {
  if (!decimals || !amount) return "";
  return parsebn(amount).times(BN(10).pow(decimals)).decimalPlaces(0).toFixed();
};
export const zero = BN(0);
export const one = BN(1);
export const ten = BN(10);
export const ether = BN(1e18);

export function bn(n: BN.Value, base?: number): BN {
  if (n instanceof BN) return n;
  if (!n) return zero;
  return BN(n, base);
}

export function convertDecimals(n: BN.Value, sourceDecimals: number, targetDecimals: number): BN {
  if (sourceDecimals === targetDecimals) return bn(n);
  else if (sourceDecimals > targetDecimals) return bn(n).idiv(ten.pow(sourceDecimals - targetDecimals));
  else return bn(n).times(ten.pow(targetDecimals - sourceDecimals));
}

export function eqIgnoreCase(a: string, b: string) {
  return a == b || a.toLowerCase() == b.toLowerCase();
}

export function parsebn(n: BN.Value, defaultValue?: BN, fmt?: BN.Format): BN {
  if (typeof n !== "string") return bn(n);

  const decimalSeparator = fmt?.decimalSeparator || ".";
  const str = n.replace(new RegExp(`[^${decimalSeparator}\\d-]+`, "g"), "");
  const result = bn(decimalSeparator === "." ? str : str.replace(decimalSeparator, "."));
  if (defaultValue && (!result.isFinite() || result.lte(zero))) return defaultValue;
  else return result;
}

export const isNativeAddress = (address?: string) => !!nativeTokenAddresses.find((a) => eqIgnoreCase(a, address || ""));

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function findTimeUnit(_millis: number): TimeUnit {
  const units = [TimeUnit.Years, TimeUnit.Months, TimeUnit.Weeks, TimeUnit.Days, TimeUnit.Hours, TimeUnit.Minutes];
  return units.find((unit) => unit <= _millis) || TimeUnit.Minutes;
}

export const getTimeDurationMillis = (duration?: TimeDuration) => {
  if (!duration) return 0;
  return duration.value * duration.unit;
};

export const safeInteger = (value?: string) => {
  if (!value || value === "NaN") return "0";
  return BN.min(BN(value || "0").toString(), maxUint256)
    .decimalPlaces(0)
    .toFixed();
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
