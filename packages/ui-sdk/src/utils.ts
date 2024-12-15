import BN from "bignumber.js";

export const toWeiAmount = (decimals?: number, amount?: string) => {
  if (!decimals || !amount) return "";
  return BN(amount).times(BN(10).pow(decimals)).decimalPlaces(0).toString();
};
