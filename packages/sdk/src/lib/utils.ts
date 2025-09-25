import { LEGACY_EXCHANGES_MAP, getPartnerIdentifier, maxUint256, nativeTokenAddresses, THE_GRAPH_ORDERS_API } from "./consts";
import BN from "bignumber.js";
import { Config, TimeDuration, TimeUnit } from "./types";
import { networks } from "./networks";
import { Configs } from "..";

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
  return parsebn(amount).times(BN(10).pow(decimals)).decimalPlaces(0).toFixed(0);
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

export const safeBNString = (value?: string | number) => {
  if (!value || value === "NaN") return "0";
  return BN(value).decimalPlaces(0).toFixed();
};

export const getNetwork = (chainId?: number) => {
  return Object.values(networks).find((it) => it.id === chainId);
};

export const getExchanges = (config?: Config[]) => {
  if (!config) return undefined;
  const keys = config.map((c) => getPartnerIdentifier(c));

  const legacyAddresses = Object.entries(LEGACY_EXCHANGES_MAP)
    .filter(([key]) => {
      return keys.includes(key);
    })
    .flatMap(([, addresses]) => addresses);
  const exchangeAddresses = config.map((c) => c.exchangeAddress);

  const allAddresses = new Set([...exchangeAddresses, ...legacyAddresses].map((a) => a.toLowerCase()));

  return Array.from(allAddresses);
};

export const normalizeSubgraphList = <T>(list?: T[], transform?: (val: T) => string) => (list && list.length ? list.map(transform || ((v) => `${v}`)) : undefined);

export const getConfigByExchange = (exchange: string, chainId: number): Config | undefined => {
  const normalized = exchange.toLowerCase();

  // 1. Try matching the main exchangeAddress in configs
  const primaryMatch = Object.values(Configs).find((cfg) => cfg.exchangeAddress.toLowerCase() === normalized && cfg.chainId === chainId);
  if (primaryMatch) return primaryMatch as Config;

  // 2. Try matching legacy exchange addresses
  for (const [key, legacyAddresses] of Object.entries(LEGACY_EXCHANGES_MAP)) {
    if (legacyAddresses.some((addr) => addr.toLowerCase() === normalized)) {
      const config = Object.values(Configs).find((cfg) => {
        const name = key.split("_")[0];

        return cfg.name === name && cfg.chainId === Number(chainId);
      });
      if (config) return config as Config;
    }
  }

  // 3. Not found
  return undefined;
};

export const HexToNumber = (hexStr: string) => {
  // Remove 0x prefix if present
  const trimmed = hexStr.replace("0x", "");
  // Parse as base 16
  const val = parseInt(trimmed, 16);
  if (isNaN(val)) {
    return 0;
  }
  return val;
};

export const numberToHex = (value: number | bigint, padding = 0): string => {
  if (typeof value !== "bigint" && !Number.isSafeInteger(value)) {
    throw new Error("Value must be a safe integer or bigint");
  }

  // Convert to BigInt for consistency
  const bigVal = BigInt(value);

  // Convert to hex without 0x prefix
  let hex = bigVal.toString(16);

  // Apply zero-padding if requested (e.g., 32 bytes = 64 chars)
  if (padding > 0) {
    hex = hex.padStart(padding, "0");
  }

  return "0x" + hex;
};
