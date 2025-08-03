import { TimeUnit, Configs } from "@orbs-network/twap-sdk";
export const REFETCH_ORDER_HISTORY = 40_000;

export const MIN_NATIVE_BALANCE = 0.01;
export const DEFAULT_STOP_LOSS_LIMIT_PERCENTAGE = -7;
export const DEFAULT_STOP_LOSS_TRIGGER_PERCENTAGE = -5;

export const DEFAULT_TAKE_PROFIT_PERCENTAGE = 7;
export const DEFAULT_TAKE_PROFIT_TRIGGER_PERCENTAGE = 5;

export const QUERY_PARAMS = {
  INTERVAL: "twap-interval",
  DURATION: "twap-duration",
  LIMIT_PRICE: "twap-price",
  INPUT_AMOUNT: "twap-input",
  CHUNKS: "twap-trades",
};
export const DEFAULT_DURATION = { unit: TimeUnit.Days, value: 7 };

export const ORBS_LOGO = "https://raw.githubusercontent.com/orbs-network/twap-ui/master/logo/orbslogo.svg";
export const ORBS_LOGO_FALLBACK = "https://www.orbs.com/assets/img/common/logo.svg";
export const ORBS_WEBSITE_URL = "https://www.orbs.com/";
export const DISCLAIMER_URL = "https://www.orbs.com/dtwap-dlimit-disclaimer";

export const TX_GAS_COST = 500_000;

export { Configs };
