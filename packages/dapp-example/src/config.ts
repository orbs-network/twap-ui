import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygon, mainnet, arbitrum, bsc, fantom, blast, linea, sei, base, sonic, arbitrumNova } from "viem/chains";

export const wagmiConfig = getDefaultConfig({
  pollingInterval: 60_0000,
  appName: "TWAP",
  projectId: process.env.REACT_APP_CONNECT_PROJECT_ID as string,
  chains: [polygon, mainnet, arbitrum, bsc, fantom, blast, linea, sei, base, sonic, arbitrumNova],
});
