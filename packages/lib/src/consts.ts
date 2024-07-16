import { TimeResolution } from "./types";

export const REFETCH_ORDER_HISTORY = 25_000;
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

const millisInADay = 24 * 60 * 60 * 1000;

export const MIN_TRADE_INTERVAL_FORMATTED = new Date(MIN_TRADE_INTERVAL).getMinutes();
export const MAX_TRADE_INTERVAL_FORMATTED = MAX_TRADE_INTERVAL / millisInADay;

export const MAX_DURATION_MILLIS = 30 * 24 * 60 * 60 * 1000;
export const MIN_DURATION_MILLIS = 5 * 60 * 1000;
export const MIN_DURATION_MILLIS_FORMATTED = new Date(MIN_DURATION_MILLIS).getMinutes();

export const EXPLORER_URLS = {
  1: "https://etherscan.io",
  56: "https://bscscan.com",
  137: "https://polygonscan.com",
  43114: "https://snowtrace.io",
  250: "https://ftmscan.com",
  8453: "https://basescan.org",
  42161: "https://arbiscan.io",
};

export const STABLE_TOKENS = ["usdc", "dai", "usdt", "busd", "tusd", "susd"];

export const defaultCustomFillDelay = { resolution: TimeResolution.Minutes, amount: MIN_TRADE_INTERVAL_FORMATTED };

export const WAIT_FOR_ORDER_LOCAL_STORAGE = "WAIT_FOR_ORDER";
