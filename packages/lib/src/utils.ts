import { TokenData, parsebn, eqIgnoreCase, maxUint256, Token, isNativeAddress, bn } from "@defi.org/web3-candies";
import moment from "moment";
import { Translations } from "./types";
import { EXPLORER_URLS, QUERY_PARAMS, STABLE_TOKENS } from "./consts";
import BN from "bignumber.js";
import _ from "lodash";
import { useTwapStore } from "./store";
import { THE_GRAPH_ORDERS_API } from "./config";
import { Config, Configs } from "@orbs-network/twap";
export const logger = (...args: any[]) => {
  const query = new URLSearchParams(window.location.search);
  const debug = query.get("debug");
  if (process.env.NODE_ENV === "development" || debug) {
    console.log(...args);
  }
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

export const makeElipsisAddress = (address?: string, padding = 6): string => {
  if (!address) return "";
  return `${address.substring(0, padding)}...${address.substring(address.length - padding)}`;
};

export const amountBN = (token: TokenData | undefined, amount: string) => parsebn(amount).times(BN(10).pow(token?.decimals || 0));
export const amountUi = (token: TokenData | undefined, amount: BN) => {
  if (!token) return "";
  const percision = BN(10).pow(token?.decimals || 0);
  return amount.times(percision).idiv(percision).div(percision).toFormat();
};

export const amountUiV2 = (decimals?: number, amount?: string) => {
  if (!decimals || !amount) return "";
  const percision = BN(10).pow(decimals || 0);
  return BN(amount).times(percision).idiv(percision).div(percision).toString();
};
export const amountBNV2 = (decimals?: number, amount?: string) => {
  if (!decimals || !amount) return "";
  return parsebn(amount).times(BN(10).pow(decimals)).decimalPlaces(0).toString();
};

export const fillDelayText = (value: number, translations: Translations) => {
  if (!value) {
    return "0";
  }
  const time = moment.duration(value);
  const days = time.days();
  const hours = time.hours();
  const minutes = time.minutes();
  const seconds = time.seconds();

  const arr: string[] = [];

  if (days) {
    arr.push(`${days} ${translations.days} `);
  }
  if (hours) {
    arr.push(`${hours} ${translations.hours} `);
  }
  if (minutes) {
    arr.push(`${minutes} ${translations.minutes}`);
  }
  if (seconds) {
    arr.push(`${seconds} ${translations.seconds}`);
  }
  return arr.join(" ");
};

export const handleFillDelayText = (text: string, minutes: number) => {
  return text.replace("{{minutes}}", minutes.toString());
};

export const getTokenFromTokensList = (tokensList?: any, addressOrSymbol?: any) => {
  if (!tokensList || !addressOrSymbol) return;

  if (_.isArray(tokensList)) return _.find(tokensList, (token) => eqIgnoreCase(addressOrSymbol, token.address) || addressOrSymbol.toLowerCase() === token?.symbol.toLowerCase());
  if (_.isObject(tokensList)) return tokensList[addressOrSymbol as keyof typeof tokensList];
};

export const getQueryParam = (name: string) => {
  const search = window.location.search;

  const params = new URLSearchParams(search);
  const result = params.get(name);
  if (name === QUERY_PARAMS.LIMIT_PRICE && result === ".") {
    return "0.1";
  }

  return result;
};

export const setQueryParam = (name: string, value?: string) => {
  if (!useTwapStore.getState().enableQueryParams) return;
  const search = window.location.search;
  const params = new URLSearchParams(search);
  if (!value) {
    params.delete(name);
  } else {
    params.set(name, value);
  }

  window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
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

export const safeInteger = (value?: string) => {
  if (_.isNaN(value) || value === "NaN") return "0";
  return BN.min(BN(value || "0").toString(), maxUint256)
    .decimalPlaces(0)
    .toString();
};

export const devideCurrencyAmounts = ({ srcAmount, dstAmount, srcToken, dstToken }: { srcToken?: TokenData; dstToken?: TokenData; srcAmount?: string; dstAmount?: string }) => {
  if (!srcToken || !dstToken || !srcAmount || !dstAmount) return;
  const _srcAmount = BN(srcAmount).dividedBy(BN(10).pow(srcToken.decimals));
  const _dstAmount = BN(dstAmount).dividedBy(BN(10).pow(dstToken.decimals));
  if (!_dstAmount || !_srcAmount || _srcAmount?.isZero() || _dstAmount?.isZero()) return;

  return BN(_dstAmount).div(_srcAmount).toString();
};

export const supportsTheGraphHistory = (chainId?: number) => {
  return chainId ? !!getTheGraphUrl(chainId) : false;
};

export const getTheGraphUrl = (chainId?: number) => {
  if (!chainId) return;
  return THE_GRAPH_ORDERS_API[chainId];
};

function indexWhereZerosEnd(numberStr?: string) {
  if (!numberStr) return 0;

  // Split the number into the integer and decimal parts
  let parts = numberStr.split(".");
  if (parts.length < 2) {
    return -1; // No decimal part
  }

  let decimalPart = parts[1];

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

  const res = BN(value).gt(1) && index > 1 ? 0 : index > 8 ? 0 : index + decimals;

  return BN(value).decimalPlaces(res, BN.ROUND_DOWN).toString();
};

export const addMissingTokens = (config: Config, tokens: TokenData[]) => {
  if (!tokens.find((it: TokenData) => isNativeAddress(it.address))) {
    tokens.push(config.nativeToken);
  }
  if (!tokens.find((it: TokenData) => eqIgnoreCase(it.address, config.wToken.address))) {
    tokens.push(config.wToken);
  }
  return tokens;
};

export const getExplorerUrl = (chainId?: number) => {
  if (!chainId) return;
  return EXPLORER_URLS[chainId as keyof typeof EXPLORER_URLS];
};

export const isTxRejected = (error: any) => {
  if (error?.message) {
    return error.message?.toLowerCase()?.includes("rejected") || error.message?.toLowerCase()?.includes("denied");
  }
};

export const isNativeBalanceError = (error: any) => {
  if (error?.message) {
    return error.message?.toLowerCase()?.includes("insufficient") || error.message?.toLowerCase()?.includes("gas required exceeds allowance");
  }
};

export const isStableCoin = (token?: TokenData) => STABLE_TOKENS.includes(token?.symbol.toLowerCase() || "");

export const getConfig = (configs: Config[], chainId?: number): Config => {
  return _.find(configs, { chainId }) || configs[0];
};

export const invertBN = (value?: string) => {
  if (!value) return "";

  return bn(1).multipliedBy(1e18).dividedBy(value).multipliedBy(1e18).decimalPlaces(0).toString();
};

export const invert = (value?: string) => {
  if (!value) return "";
  return BN(1).div(value).toString();
};
