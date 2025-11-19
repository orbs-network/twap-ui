import Configs from "@orbs-network/twap/configs.json";
import { networks } from "./networks";
import { Config, TimeDuration, TimeUnit } from "./types";
import { getQueryParam } from "./utils";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

const DEV_API_URL = "https://order-sink-dev.orbs.network";
const PROD_API_URL = "https://order-sink.orbs.network";

const DEV_URLS = ["https://twap-v2.netlify.app"];

export const getApiEndpoint = () => {
  try {
    const env = getQueryParam(QUERY_PARAMS.ENV);
    if (env === "prod") {
      return PROD_API_URL;
    }

    if (window.location.hostname.includes("localhost") || DEV_URLS.includes(window.location.origin)) {
      return DEV_API_URL;
    }
    return PROD_API_URL;
  } catch (error) {
    return PROD_API_URL;
  }
};
export const SUGGEST_CHUNK_VALUE = 100;

export const MIN_CHUNKS = 1;
export const MIN_FILL_DELAY_MILLIS = 5 * 60 * 1000;

export const MAX_ORDER_DURATION_MILLIS = 365 * 24 * 60 * 60 * 1000; // 1 year

export const MIN_ORDER_DURATION_MILLIS = 5 * 60 * 1000;

export const MIN_FILL_DELAY_MINUTES = new Date(MIN_FILL_DELAY_MILLIS).getMinutes();

const getGfURL = (name: string) => {
  return `https://hub.orbs.network/api/private/project_cm7nb67z86nyr01z12gs0fxpf/subgraphs/orbs-twap-${name}/prod/gn`;
};

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
  [networks.katana.id]: `${THE_GRAPH_API}/CGi9sDFMQcnBwF3C3NoCFqnaE34sssbgwPLTwiskSXmW`,
  [networks.avax.id]: `${THE_GRAPH_API}/FxZ1vMwE5Xy1qvKvZENUMz4vhW8Sh4vXJf9Vp7o17pTx`,
  [networks.bera.id]: `${THE_GRAPH_API}/H7aY53mY1hgaSURwXj3ZVirwNSifExwjgEL5GNtTqmEj`,

  [networks.flare.id]: getGfURL("flare"),
  [networks.cronosZkEvm.id]: getGfURL("cronos-zkevm"),
};

export const zeroAddress = "0x0000000000000000000000000000000000000000";

export const nativeTokenAddresses = [
  zeroAddress,
  "0x0000000000000000000000000000000000001010",
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "0x000000000000000000000000000000000000dEaD",
  "0x000000000000000000000000000000000000800A",
  "0x000000000000000000000000000000000000800a",
];

export const maxUint256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export const getPartnerIdentifier = (config: Config) => `${config.name}_${config.chainId}`;

export const LEGACY_EXCHANGES_MAP: Record<string, string[]> = {
  [getPartnerIdentifier(Configs.SushiArb)]: ["0x846F2B29ef314bF3D667981b4ffdADc5B858312a", "0x08c41f5D1C844061f6D952E25827eeAA576c6536"],
  [getPartnerIdentifier(Configs.SushiBase)]: ["0x846F2B29ef314bF3D667981b4ffdADc5B858312a", "0x08c41f5D1C844061f6D952E25827eeAA576c6536"],
  [getPartnerIdentifier(Configs.SushiEth)]: ["0xc55943Fa6509004B2903ED8F8ab7347BfC47D0bA", "0x08c41f5D1C844061f6D952E25827eeAA576c6536"],
  [getPartnerIdentifier(Configs.PancakeSwap)]: ["0xb2BAFe188faD927240038cC4FfF2d771d8A58905", "0xE2a0c3b9aD19A18c4bBa7fffBe5bC1b0E58Db1CE"],
  [getPartnerIdentifier(Configs.PancakeSwapArbitrum)]: ["0xE20167871dB616DdfFD0Fd870d9bC068C350DD1F", "0x807488ADAD033e95C438F998277bE654152594dc"],
  [getPartnerIdentifier(Configs.PancakeSwapBase)]: ["0x10ed1F36e4eBE76E161c9AADDa20BE841bc0082c", "0x3A9df3eE209b802D0337383f5abCe3204d623588"],
  [getPartnerIdentifier(Configs.PancakeSwapLinea)]: ["0x3A9df3eE209b802D0337383f5abCe3204d623588"],
  [getPartnerIdentifier(Configs.QuickSwap)]: ["0x26D0ec4Be402BCE03AAa8aAf0CF67e9428ba54eF"],
  [getPartnerIdentifier(Configs.Thena)]: ["0xc2aBC02acd77Bb2407efA22348dA9afC8B375290"],
  [getPartnerIdentifier(Configs.Lynex)]: ["0x72e3e1fD5D2Ee2F1C2Eb695206D490a1D45C3835"],
  [getPartnerIdentifier(Configs.DragonSwap)]: ["0x101e1B65Bb516FB5f4547C80BAe0b51f1b8D7a22"],
  [getPartnerIdentifier(Configs.SpookySwapSonic)]: ["0xAd97B770ad64aE47fc7d64B3bD820dCDbF9ff7DA"],
  [getPartnerIdentifier(Configs.SpookySwap)]: ["0x3924d62219483015f982b160d48c0fa5Fd436Cba"],
  [getPartnerIdentifier(Configs.SwapX)]: ["0xE5012eBDe5e26EE3Ea41992154731a03023CF274"],
};
export const DEFAULT_FILL_DELAY = { unit: TimeUnit.Minutes, value: MIN_FILL_DELAY_MINUTES } as TimeDuration;
export const FEES = 0.25;
export const EXCLUSIVITY_OVERRIDE_BPS = "100";

export const REPERMIT_PRIMARY_TYPE = "RePermitWitnessTransferFrom" as const;

export const EIP712_TYPES = {
  RePermitWitnessTransferFrom: [
    {
      name: "permitted",
      type: "TokenPermissions",
    },
    {
      name: "spender",
      type: "address",
    },
    {
      name: "nonce",
      type: "uint256",
    },
    {
      name: "deadline",
      type: "uint256",
    },
    {
      name: "witness",
      type: "Order",
    },
  ],
  Exchange: [
    {
      name: "adapter",
      type: "address",
    },
    {
      name: "ref",
      type: "address",
    },
    {
      name: "share",
      type: "uint32",
    },
    {
      name: "data",
      type: "bytes",
    },
  ],
  Input: [
    {
      name: "token",
      type: "address",
    },
    {
      name: "amount",
      type: "uint256",
    },
    {
      name: "maxAmount",
      type: "uint256",
    },
  ],
  Order: [
    {
      name: "reactor",
      type: "address",
    },
    {
      name: "executor",
      type: "address",
    },
    {
      name: "exchange",
      type: "Exchange",
    },
    {
      name: "swapper",
      type: "address",
    },
    {
      name: "nonce",
      type: "uint256",
    },
    {
      name: "deadline",
      type: "uint256",
    },
    {
      name: "chainid",
      type: "uint256",
    },
    {
      name: "exclusivity",
      type: "uint32",
    },
    {
      name: "epoch",
      type: "uint32",
    },
    {
      name: "slippage",
      type: "uint32",
    },
    {
      name: "freshness",
      type: "uint32",
    },
    {
      name: "input",
      type: "Input",
    },
    {
      name: "output",
      type: "Output",
    },
  ],
  Output: [
    { name: "token", type: "address" },
    { name: "limit", type: "uint256" },
    { name: "stop", type: "uint256" },
    { name: "recipient", type: "address" },
  ],
  TokenPermissions: [
    {
      name: "token",
      type: "address",
    },
    {
      name: "amount",
      type: "uint256",
    },
  ],
};

export const ORBS_TWAP_FAQ_URL = "https://www.orbs.com/dtwap-and-dlimit-faq/";
export const ORBS_SLTP_FAQ_URL = "https://www.orbs.com/dtwap-and-dlimit-faq/#dSLTP";

export const ORBS_LOGO = "https://raw.githubusercontent.com/orbs-network/twap-ui/master/logo/orbslogo.svg";
export const ORBS_LOGO_FALLBACK = "https://www.orbs.com/assets/img/common/logo.svg";
export const ORBS_WEBSITE_URL = "https://www.orbs.com/";
export const DISCLAIMER_URL = "https://www.orbs.com/dtwap-dlimit-disclaimer";

export enum QUERY_PARAMS {
  FRESHNESS = "freshness",
  MIN_CHUNK_SIZE_USD = "minChunkSizeUsd",
  ENV = "env",
}

export const DEFAULT_STOP_LOSS_PERCENTAGE = "-5";
export const DEFAULT_TAKE_PROFIT_PERCENTAGE = "10";

export const DEFAULT_STOP_LOSS_LIMIT_PERCENTAGE = "-10";
export const DEFAULT_TAKE_PROFIT_LIMIT_PERCENTAGE = "5";
