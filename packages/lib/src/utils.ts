import { TokenData, parsebn, eqIgnoreCase } from "@defi.org/web3-candies";
import moment from "moment";
import { Translations } from ".";
import BN from "bignumber.js";
import _ from "lodash";
import { useTwapStore } from "./store";
export const logger = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
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

  if (_.isArray(tokensList)) return _.find(tokensList, (token) => eqIgnoreCase(addressOrSymbol, token.address) || addressOrSymbol === token?.symbol);
  if (_.isObject(tokensList)) return tokensList[addressOrSymbol as keyof typeof tokensList];
};

export const getQueryParam = (name: string) => {
  const search = window.location.search;

  const params = new URLSearchParams(search);

  return params.get(name);
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
