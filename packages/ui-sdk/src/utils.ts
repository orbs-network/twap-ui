import { maxUint256 } from "@orbs-network/twap-sdk";
import BN from "bignumber.js";

export const toWeiAmount = (decimals?: number, amount?: string) => {
  if (!decimals || !amount) return "";
  return BN(amount).times(BN(10).pow(decimals)).decimalPlaces(0).toString();
};

export const toAmountUi = (decimals?: number, amount?: string) => {
  if (!decimals || !amount) return "";
  const percision = BN(10).pow(decimals || 0);
  return BN(amount).times(percision).idiv(percision).div(percision).toString();
};

export const safeValue = (value?: string) => {
  if (!value) return "0";
  return BN.min(value, maxUint256).decimalPlaces(0).toString();
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
