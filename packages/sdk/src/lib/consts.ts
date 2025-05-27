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

export const LEGACY_EXCHANGES_MAP: Record<string, string[]> = {
  [Configs.SushiArb.name]: ["0x846F2B29ef314bF3D667981b4ffdADc5B858312a", "0x08c41f5D1C844061f6D952E25827eeAA576c6536"],
  [Configs.SushiBase.name]: ["0x846F2B29ef314bF3D667981b4ffdADc5B858312a", "0x08c41f5D1C844061f6D952E25827eeAA576c6536"],
  [Configs.SushiEth.name]: ["0xc55943Fa6509004B2903ED8F8ab7347BfC47D0bA", "0x08c41f5D1C844061f6D952E25827eeAA576c6536"],
  [Configs.PancakeSwap.name]: ["0xb2BAFe188faD927240038cC4FfF2d771d8A58905"],
  [Configs.QuickSwap.name]: ["0x26D0ec4Be402BCE03AAa8aAf0CF67e9428ba54eF"],
  [Configs.Thena.name]: ["0xc2aBC02acd77Bb2407efA22348dA9afC8B375290"],
  [Configs.Lynex.name]: ["0x72e3e1fD5D2Ee2F1C2Eb695206D490a1D45C3835"],
  [Configs.DragonSwap.name]: ["0x101e1B65Bb516FB5f4547C80BAe0b51f1b8D7a22"],
  [Configs.SpookySwapSonic.name]: ["0xAd97B770ad64aE47fc7d64B3bD820dCDbF9ff7DA"],
  [Configs.SpookySwap.name]: ["0x3924d62219483015f982b160d48c0fa5Fd436Cba"],
};
