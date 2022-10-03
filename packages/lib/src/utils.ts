import { timeSelectOptions } from "./consts";
import { TimeFormat } from "./types";
import { BigNumber, parsebn, Token, zero } from "@defi.org/web3-candies";

export const getTimeFormat = (value: number) => {
  return (
    timeSelectOptions.find((e) => {
      return value >= e.base && value < e.limit;
    })?.format || TimeFormat.Minutes
  );
};

export const getDerivedTradeInterval = (maxDurationMillis: number, totalTrades: number) => {
  if (maxDurationMillis > 0 && totalTrades > 0) {
    const result = maxDurationMillis / totalTrades;
    const derivedMillis = result > 60_000 ? result : 60_000;

    return {
      derivedMillis,
      derivedTimeFormat: getTimeFormat(derivedMillis),
    };
  } else {
    return {
      derivedMillis: 0,
      derivedTimeFormat: TimeFormat.Minutes,
    };
  }
};

export const getBigNumberToUiAmount = async (token?: Token, amount?: BigNumber) => {
  if (amount == null) {
    return "";
  }

  return !token ? "" : (await token.mantissa(amount || zero)).toFormat();
};



export const getUiAmountToBigNumber = (token?: Token, amountUi?: string) => {
  if (!amountUi) {
    return undefined;
  }

  return !token ? undefined : token?.amount(parsebn(amountUi || "0"));
};

export const delay = (delayInms: number) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};