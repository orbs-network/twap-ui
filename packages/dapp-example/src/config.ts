import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { polygon, mainnet, arbitrum, bsc, fantom, blast, linea, sei, base, sonic, arbitrumNova, flare } from "viem/chains";

export const wagmiConfig = getDefaultConfig({
  pollingInterval: 60_0000,
  appName: "TWAP",
  projectId: process.env.REACT_APP_CONNECT_PROJECT_ID as string,
  chains: [polygon, mainnet, arbitrum, bsc, fantom, blast, linea, sei, base, sonic, arbitrumNova, flare],
  transports: {
    [fantom.id]: http(`https://rpcman.orbs.network/rpc?chainId=${fantom.id}&appId=twap-ui`),
  },
});
