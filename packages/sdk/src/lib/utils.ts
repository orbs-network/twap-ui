import { nativeTokenAddresses, THE_GRAPH_ORDERS_API } from "./consts";
import { TimeDuration, TimeUnit } from "./types";

export const MAX_DECIMALS = 18;

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

export const BigintToNum = (amount?: bigint | string, decimals?: number): number => {
  if (!decimals || !amount) return 0;

  const numStr = typeof amount === "bigint" ? amount.toString() : amount;
  const precision = decimals || 0;

  if (precision > 0) {
    const integerPart = numStr.slice(0, -precision) || "0";
    const fractionalPart = numStr.slice(-precision).padStart(precision, "0");

    return Number(`${integerPart}.${fractionalPart}`);
  } else {
    return Number(numStr);
  }
};

export function BigintSum(arr: bigint[]): bigint {
  return arr.reduce((sum, current) => sum + current, BigInt(0));
}

export function BigintMax(...args: bigint[]): bigint {
  return args.reduce((max, current) => (current > max ? current : max));
}

export function BigintMin(...args: bigint[]): bigint {
  return args.reduce((min, current) => (current < min ? current : min));
}

export function BigintDiv(a: bigint, b: bigint, decimals?: number): number {
  return Number((a * BigInt(10 ** (decimals || MAX_DECIMALS))) / b) / 10 ** (decimals || MAX_DECIMALS);
}

export function eqIgnoreCase(a: string, b: string) {
  return a == b || a.toLowerCase() == b.toLowerCase();
}

export const isNativeAddress = (address: string) => !!nativeTokenAddresses.find((a) => eqIgnoreCase(a, address));

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
