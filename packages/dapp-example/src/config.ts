import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { Chain, defineChain, http } from "viem";
import { polygon, mainnet, arbitrum, bsc, fantom, blast, linea, sei, base, sonic, arbitrumNova, flare, cronoszkEVM } from "viem/chains";

const katana: Chain = defineChain({
  id: 747474,
  name: "Katana",
  network: "katana",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.katana.network"],
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 7654707,
    },
  },
});
const chains = [polygon, mainnet, arbitrum, bsc, fantom, blast, linea, sei, base, sonic, arbitrumNova, flare, cronoszkEVM, katana];

const transports = chains
  .map((chain) => {
    if(chain.id === katana.id){
      return {
        chainId: chain.id,
        transport: http(`https://rpc.katana.network`),
      }
    }
    return {
      chainId: chain.id,
      transport: http(`https://rpcman.orbs.network/rpc?chainId=${chain.id}&appId=twap-ui`),
    };
  })
  .reduce((acc: any, { chainId, transport }) => {
    acc[chainId] = transport;
    return acc;
  }, {});

export const wagmiConfig = getDefaultConfig({
  pollingInterval: 60_0000,
  appName: "TWAP",
  projectId: process.env.REACT_APP_CONNECT_PROJECT_ID as string,
  chains: chains as any,
  transports,
});
