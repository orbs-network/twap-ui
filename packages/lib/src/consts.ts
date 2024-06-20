export const REFETCH_ORDER_HISTORY = 20_000;
export const REFETCH_USD = 10_000;
export const REFETCH_BALANCE = 10_000;
export const REFETCH_GAS_PRICE = 10_000;
export const STALE_ALLOWANCE = 10_000;

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

export const MIN_CHUNKS = 2;

enum TimeResolution {
  Minutes = 60 * 1000,
  Hours = Minutes * 60,
  Days = Hours * 24,
}
