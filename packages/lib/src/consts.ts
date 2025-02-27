import { TimeUnit } from "@orbs-network/twap-sdk";

export const REFETCH_ORDER_HISTORY = 40_000;
export const REFETCH_USD = 15_000;
export const REFETCH_BALANCE = 15_000;
export const REFETCH_GAS_PRICE = 15_000;
export const STALE_ALLOWANCE = 15_000;

export const MIN_NATIVE_BALANCE = 0.01;
export const ORDERS_CONTAINER_ID = "twap-orders-container";

export const QUERY_PARAMS = {
  TRADE_INTERVAL: "twap-interval",
  MAX_DURATION: "twap-duration",
  LIMIT_PRICE: "twap-limit",
  INPUT_AMOUNT: "twap-input",
  TRADES_AMOUNT: "twap-trades",
  LIMIT_PRICE_INVERTED: "twap-inverted-limit",
};
export const DEFAULT_LIMIT_PANEL_DURATION = { unit: TimeUnit.Weeks, value: 1 };

export const SUGGEST_CHUNK_VALUE = 100;
export const AMOUNT_TO_BORROW = 10000; // smallest amount that has full precision over bps

export const feeOnTransferDetectorAddresses = {
  1: "0xe9200516a475b9e6FD4D1c452858097F345A6760",
  56: "0x003BD52f589F23346E03fA431209C29cD599d693",
  42161: "0xD8b14F915b1b4b1c4EE4bF8321Bea018E72E5cf3",
  1101: "0xe9200516a475b9e6FD4D1c452858097F345A6760",
  8453: "0xD8b14F915b1b4b1c4EE4bF8321Bea018E72E5cf3",
  324: "0xED87D01674199355CEfC05648d17E037306d7962",
  59144: "0xD8b14F915b1b4b1c4EE4bF8321Bea018E72E5cf3",
};

export const MIN_CHUNKS = 1;
export const MIN_TRADE_INTERVAL = 5 * 60 * 1000;

export const MAX_TRADE_INTERVAL = 30 * 24 * 60 * 60 * 1000;

export const MAX_DURATION_MILLIS = 30 * 24 * 60 * 60 * 1000;
export const MIN_DURATION_MILLIS = 5 * 60 * 1000;

export const WAIT_FOR_ORDER_LOCAL_STORAGE = "WAIT_FOR_ORDER";

export const ORBS_LOGO = "https://raw.githubusercontent.com/orbs-network/twap-ui/master/logo/orbslogo.svg";
export const ORBS_LOGO_FALLBACK = "https://www.orbs.com/assets/img/common/logo.svg";
export const TX_GAS_COST = 500_000;
