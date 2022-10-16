import { networks } from "@defi.org/web3-candies";
import Web3 from "web3";
export const twapConfig = {
  [networks.ftm.id]: {
    twapAddress: "0x25a0A78f5ad07b2474D3D42F1c1432178465936d",
  },
};

export const supportedNetwork = networks.ftm.id;
export const networkName = "FTM";

export enum IntegrationDapp {
  Spiritswap = "spiritswap",
  Quickswap = "quickswap",
}
