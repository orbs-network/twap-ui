import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { polygon, mainnet, arbitrum, bsc, fantom, blast, linea, sei, base, sonic, arbitrumNova, flare } from "viem/chains";

const chains = [polygon, mainnet, arbitrum, bsc, fantom, blast, linea, sei, base, sonic, arbitrumNova, flare];

const transports = chains
  .map((chain) => {
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
