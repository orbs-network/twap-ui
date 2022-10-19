import { networks, zeroAddress } from "@defi.org/web3-candies";
export const twapConfig = {
  [networks.ftm.id]: {
    twapAddress: "0x25a0A78f5ad07b2474D3D42F1c1432178465936d",
    wrappedTokenInfo: {
      symbol: "WFTM",
      address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
      decimals: 18,
      logoUrl: "https://tokens.1inch.io/0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83.png",
    },
  },
};

export enum IntegrationDapp {
  Spiritswap = "spiritswap",
  Quickswap = "quickswap",
}

export const nativeAddresses = [zeroAddress, "0x0000000000000000000000000000000000001010", "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"];
