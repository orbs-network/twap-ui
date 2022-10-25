import { networks, zeroAddress } from "@defi.org/web3-candies";
export const TwapConfig = {
  [networks.ftm.id]: {
    twapAddress: "0x9C07B31b664686a3481030465fa21A98b35B98dA",
    lensContract: "",
    wrappedTokenInfo: {
      symbol: "WFTM",
      address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
      decimals: 18,
      logoUrl: "https://tokens.1inch.io/0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83.png",
    },

    spiritswap: {
      exchangeAddress: "0xAd19179201be5A51D1cBd3bB2fC651BB05822404",
    },
  },
};

export enum IntegrationDapp {
  Spiritswap = "spiritswap",
  Quickswap = "quickswap",
}

export const nativeAddresses = [zeroAddress, "0x0000000000000000000000000000000000001010", "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"];
