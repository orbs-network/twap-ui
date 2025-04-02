import Configs from "@orbs-network/twap/configs.json";
import { networks } from "./networks";

export const SUGGEST_CHUNK_VALUE = 100;

export const MIN_CHUNKS = 1;
export const MIN_FILL_DELAY_MILLIS = 5 * 60 * 1000;

export const MAX_ORDER_DURATION_MILLIS = 365 * 24 * 60 * 60 * 1000;

export const MIN_FILL_DELAY_MINUTES = new Date(MIN_FILL_DELAY_MILLIS).getMinutes();

const THE_GRAPH_API = "https://hub.orbs.network/api/apikey/subgraphs/id";
export const THE_GRAPH_ORDERS_API = {
  [networks.eth.id]: `${THE_GRAPH_API}/Bf7bvMYcJbDAvYWJmhMpHZ4cpFjqzkhK6GXXEpnPRq6`,
  [networks.bsc.id]: `${THE_GRAPH_API}/4NfXEi8rreQsnAr4aJ45RLCKgnjcWX46Lbt9SadiCcz6`,
  [networks.poly.id]: `${THE_GRAPH_API}/3PyRPWSvDnMowGbeBy7aNsvUkD5ZuxdXQw2RdJq4NdXi`,
  [networks.arb.id]: `${THE_GRAPH_API}/83bpQexEaqBjHaQbKoFTbtvCXuo5RudRkfLgtRUYqo2c`,
  [networks.base.id]: `${THE_GRAPH_API}/DFhaPQb3HATXkpsWNZw3gydYHehLBVEDiSk4iBdZJyps`,
  [networks.sei.id]: `${THE_GRAPH_API}/5zjzRnURzoddyFSZBw5E5NAM3oBgPq3NasTYbtMk6EL6`,
  [networks.linea.id]: `${THE_GRAPH_API}/6VsNPEYfFLPZCqdMMDadoXQjLHWJdjEwiD768GAtb7j6`,
  [networks.sonic.id]: `${THE_GRAPH_API}/DtBr6a5vsoDd2oAXdPszcn4gLgrr1XC68Q3AJQKXnNLV`,
  [networks.ftm.id]: `${THE_GRAPH_API}/DdRo1pmJkrJC9fjsjEBWnNE1uqrbh7Diz4tVKd7rfupp`,
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

export const LEGACY_ORDERS_MAP = {
  [Configs.SushiArb.name]: ["0x846F2B29ef314bF3D667981b4ffdADc5B858312a"],
  [Configs.SushiBase.name]: ["0x846F2B29ef314bF3D667981b4ffdADc5B858312a"],
  [Configs.SushiEth.name]: ["0xc55943Fa6509004B2903ED8F8ab7347BfC47D0bA"],
};
