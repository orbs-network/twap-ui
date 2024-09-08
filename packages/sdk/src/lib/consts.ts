export const SUGGEST_CHUNK_VALUE = 100;
export const AMOUNT_TO_BORROW = 10000; // smallest amount that has full precision over bps

export const MIN_CHUNKS = 1;
export const MIN_FILL_DELAY_MILLIS = 5 * 60 * 1000;

export const MAX_FILL_DELAY_MILLIS = 30 * 24 * 60 * 60 * 1000;

const day = 24 * 60 * 60 * 1000;

export const MIN_FILL_DELAY_MINUTES = new Date(MIN_FILL_DELAY_MILLIS).getMinutes();
export const MAX_FILL_DELAY_FORMATTED = MAX_FILL_DELAY_MILLIS / day;

export const MAX_DURATION_MILLIS = 30 * 24 * 60 * 60 * 1000;
export const MIN_DURATION_MILLIS = 5 * 60 * 1000;
export const MIN_DURATION_MINUTES = new Date(MIN_DURATION_MILLIS).getMinutes();

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
  56: "https://hub.orbs.network/api/apikey/subgraphs/id/4NfXEi8rreQsnAr4aJ45RLCKgnjcWX46Lbt9SadiCcz6",
  137: "https://hub.orbs.network/api/apikey/subgraphs/id/3PyRPWSvDnMowGbeBy7aNsvUkD5ZuxdXQw2RdJq4NdXi",
  42161: "https://hub.orbs.network/api/apikey/subgraphs/id/83bpQexEaqBjHaQbKoFTbtvCXuo5RudRkfLgtRUYqo2c",
  8453: "https://hub.orbs.network/api/apikey/subgraphs/id/DFhaPQb3HATXkpsWNZw3gydYHehLBVEDiSk4iBdZJyps",
};

export const zeroAddress = "0x0000000000000000000000000000000000000000";

export const nativeTokenAddresses = [
  zeroAddress,
  "0x0000000000000000000000000000000000001010",
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "0x000000000000000000000000000000000000dEaD",
  "0x000000000000000000000000000000000000800A",
];

export const maxUint256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
