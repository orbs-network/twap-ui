export const SUGGEST_CHUNK_VALUE = 100;

export const MIN_CHUNKS = 1;
export const MIN_FILL_DELAY_MILLIS = 5 * 60 * 1000;

export const MAX_FILL_DELAY_MILLIS = 30 * 24 * 60 * 60 * 1000;

const day = 24 * 60 * 60 * 1000;

export const MIN_FILL_DELAY_MINUTES = new Date(MIN_FILL_DELAY_MILLIS).getMinutes();
export const MAX_FILL_DELAY_FORMATTED = MAX_FILL_DELAY_MILLIS / day;

export const MAX_DURATION_MILLIS = 30 * 24 * 60 * 60 * 1000;
export const MIN_DURATION_MILLIS = 5 * 60 * 1000;
export const MIN_DURATION_MINUTES = new Date(MIN_DURATION_MILLIS).getMinutes();

const THE_GRAPH_API = "https://hub.orbs.network/api/apikey/subgraphs/id";
export const THE_GRAPH_ORDERS_API = {
  1: `${THE_GRAPH_API}/Bf7bvMYcJbDAvYWJmhMpHZ4cpFjqzkhK6GXXEpnPRq6`,
  56: `${THE_GRAPH_API}/4NfXEi8rreQsnAr4aJ45RLCKgnjcWX46Lbt9SadiCcz6`,
  137: `${THE_GRAPH_API}/3PyRPWSvDnMowGbeBy7aNsvUkD5ZuxdXQw2RdJq4NdXi`,
  42161: `${THE_GRAPH_API}/83bpQexEaqBjHaQbKoFTbtvCXuo5RudRkfLgtRUYqo2c`,
  8453: `${THE_GRAPH_API}/DFhaPQb3HATXkpsWNZw3gydYHehLBVEDiSk4iBdZJyps`,
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
