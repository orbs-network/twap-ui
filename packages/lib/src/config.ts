import { networks as _networks } from "@defi.org/web3-candies";
import { zeroAddress } from "@orbs-network/twap-sdk";

export const SQUIGLE = "≈";

export const networks = {
  ..._networks,
  sei: {
    id: 1329,
    name: "Sei",
    shortname: "sei",
    native: {
      address: zeroAddress,
      symbol: "SEI",
      decimals: 18,
      logoUrl: "https://raw.githubusercontent.com/dragonswap-app/assets/main/logos/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE/logo.png",
    },
    wToken: {
      symbol: "WSEI",
      address: "0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7",
      decimals: 18,
      weth: false,
      logoUrl: "https://raw.githubusercontent.com/dragonswap-app/assets/main/logos/0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7/logo.png",
    },
    publicRpcUrl: "https://evm-rpc.sei-apis.com",
    logoUrl: "https://example.com/path-to-sei-logo.svg",
    explorer: "https://www.seiscan.app",
    eip1559: false,
  },
};

export const THE_GRAPH_ORDERS_API = {
  [networks.bsc.id]: "https://hub.orbs.network/api/apikey/subgraphs/id/4NfXEi8rreQsnAr4aJ45RLCKgnjcWX46Lbt9SadiCcz6",
  [networks.poly.id]: "https://hub.orbs.network/api/apikey/subgraphs/id/3PyRPWSvDnMowGbeBy7aNsvUkD5ZuxdXQw2RdJq4NdXi",
  [networks.arb.id]: "https://hub.orbs.network/api/apikey/subgraphs/id/83bpQexEaqBjHaQbKoFTbtvCXuo5RudRkfLgtRUYqo2c",
  [networks.base.id]: "https://hub.orbs.network/api/apikey/subgraphs/id/DFhaPQb3HATXkpsWNZw3gydYHehLBVEDiSk4iBdZJyps",
  [networks.eth.id]: "https://hub.orbs.network/api/apikey/subgraphs/id/Bf7bvMYcJbDAvYWJmhMpHZ4cpFjqzkhK6GXXEpnPRq6",
};
