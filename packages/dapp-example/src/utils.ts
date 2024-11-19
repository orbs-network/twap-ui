import { isNativeAddress } from "@defi.org/web3-candies";
export const showTokenInList = (symbol: string, filter: string) => {
  if (!filter) return true;

  return symbol.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
};
const chainIdToName: { [key: number]: string } = {
  56: "bsc",
  137: "polygon",
  8453: "base", // Assuming this ID is another identifier for Polygon as per the user's mapping
  250: "fantom",
  1: "ethereum",
  1101: "zkevm",
  81457: "blast",
  59144: "linea",
  42161: "arbitrum",
};

export async function fetchLLMAPrice(token: string, chainId: number | string) {
  const nullPrice = {
    priceUsd: 0,
    priceNative: 0,
    timestamp: Date.now(),
  };
  try {
    //@ts-ignore
    const chainName = chainIdToName[chainId] || "Unknown Chain";

    if (isNativeAddress(token)) {
      //@ts-ignore
      token = network(parseInt(chainId)).wToken.address;
    }
    const tokenAddressWithChainId = `${chainName}:${token}`;
    const url = `https://coins.llama.fi/prices/current/${tokenAddressWithChainId}`;
    const response = await fetch(url);
    if (!response.ok) {
      return nullPrice;
    }
    const data = await response.json();
    const coin = data.coins[tokenAddressWithChainId];
    return {
      priceUsd: coin.price,
      priceNative: coin.price,
      timestamp: Date.now(),
    };
  } catch (error) {
    return nullPrice;
  }
}
