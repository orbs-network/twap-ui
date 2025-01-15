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
