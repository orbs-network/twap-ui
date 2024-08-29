import { networks } from "@defi.org/web3-candies";
export const SUGGEST_CHUNK_VALUE = 100;
export const AMOUNT_TO_BORROW = 10000; // smallest amount that has full precision over bps

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

export const THE_GRAPH_ORDERS_API = {
  [networks.bsc.id]: "https://hub.orbs.network/api/apikey/subgraphs/id/4NfXEi8rreQsnAr4aJ45RLCKgnjcWX46Lbt9SadiCcz6",
  [networks.poly.id]: "https://hub.orbs.network/api/apikey/subgraphs/id/3PyRPWSvDnMowGbeBy7aNsvUkD5ZuxdXQw2RdJq4NdXi",
  [networks.arb.id]: "https://hub.orbs.network/api/apikey/subgraphs/id/83bpQexEaqBjHaQbKoFTbtvCXuo5RudRkfLgtRUYqo2c",
  [networks.base.id]: "https://hub.orbs.network/api/apikey/subgraphs/id/DFhaPQb3HATXkpsWNZw3gydYHehLBVEDiSk4iBdZJyps",
};
