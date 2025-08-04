import { Configs } from "@orbs-network/twap-sdk";
export const REFETCH_ORDER_HISTORY = 40_000;

export const MIN_NATIVE_BALANCE = 0.01;

export const SLIPPAGE_MULTIPLIER = 10;
export const LIMIT_TRIGGER_PRICE_DELTA_PERCENTAGE = 5;

export const QUERY_PARAMS = {
  INTERVAL: "twap-interval",
  DURATION: "twap-duration",
  LIMIT_PRICE: "twap-price",
  INPUT_AMOUNT: "twap-input",
  CHUNKS: "twap-trades",
};

export const ORBS_LOGO = "https://raw.githubusercontent.com/orbs-network/twap-ui/master/logo/orbslogo.svg";
export const ORBS_LOGO_FALLBACK = "https://www.orbs.com/assets/img/common/logo.svg";
export const ORBS_WEBSITE_URL = "https://www.orbs.com/";
export const DISCLAIMER_URL = "https://www.orbs.com/dtwap-dlimit-disclaimer";

export const TX_GAS_COST = 500_000;

export { Configs };
