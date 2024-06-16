import { networks } from "./web3-candies/networks";

export const SQUIGLE = "≈";

export const THE_GRAPH_ORDERS_API = {
  [networks.bsc.id]: "https://hub.orbs.network/api/apikey/subgraphs/id/4NfXEi8rreQsnAr4aJ45RLCKgnjcWX46Lbt9SadiCcz6",
  [networks.poly.id]: "https://hub.orbs.network/api/apikey/subgraphs/id/3PyRPWSvDnMowGbeBy7aNsvUkD5ZuxdXQw2RdJq4NdXi",
};


export const MIN_NATIVE_TOKEN_BALANCE = {
  [networks.bsc.id]: '0.0035'
}