import { getNetwork, networks } from "@orbs-network/twap-sdk";
import dragonswapTokens from "./tokens/dragonswap.json";
import { Token } from "@orbs-network/twap-ui";
import _ from "lodash";

const BASE_TOKENS = _.uniq(["USDT", "USDC", "DAI", "WBTC", "BUSD", ...Object.values(networks).map((it) => it.wToken.symbol)]);

const getDragonswapTokens = (): Token[] => {
  return dragonswapTokens.tokens.map((it) => {
    return {
      address: it.address,
      symbol: it.symbol,
      decimals: it.decimals,
      logoUrl: `https://dzyb4dm7r8k8w.cloudfront.net/prod/logos/${it.address}/logo.png`,
    };
  });
};

const getLineaTokens = async (signal?: AbortSignal): Promise<Token[]> => {
  const tokens = await fetch(`https://prod-api.lynex.fi/tracking/assets`, { signal }).then((res) => res.json());

  const result = Object.values(tokens).map((token: any) => {
    return {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      logoUrl: token.logoURI,
    };
  });
  return [networks.eth.native, ...result];
};

const getZircuitTokens = async (signal?: AbortSignal): Promise<Token[]> => {
  const tokens = await fetch(`https://api.ocelex.fi/tracking/assets`, { signal }).then((res) => res.json());
  const result = Object.values(tokens).map((token: any) => {
    return {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      logoUrl: token.logoURI,
    };
  });

  return [networks.eth.native, ...result];
};

const getPolygonTokens = async (signal?: AbortSignal): Promise<Token[]> => {
  const tokens = await fetch(`https://tokens.coingecko.com/polygon-pos/all.json`, { signal }).then((res) => res.json());
  const result = tokens.tokens.map((token: any) => {
    return {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      logoUrl: token.logoURI,
    };
  });

  return [networks.poly.native, networks.poly.wToken, ...result];
};

const getBaseTokens = async (signal?: AbortSignal): Promise<Token[]> => {
  const payload = await fetch(`https://tokens.coingecko.com/base/all.json`, { signal }).then((res) => res.json());
  const result = payload.tokens.map((token: any) => {
    return {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      logoUrl: token.logoURI,
    };
  });

  return [networks.base.native, ...result];
};

const getArbitrumTokens = async (signal?: AbortSignal): Promise<Token[]> => {
  const payload = await fetch(`https://tokens.coingecko.com/arbitrum-one/all.json`, { signal }).then((res) => res.json());
  const result = payload.tokens.map((token: any) => {
    return {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      logoUrl: token.logoURI,
    };
  });

  return [networks.arb.native, ...result];
};

const getDefaultTokens = async (chainId: number, signal?: AbortSignal): Promise<Token[]> => {
  const response = await fetch("https://wispy-bird-88a7.uniswap.workers.dev/?url=http://tokens.1inch.eth.link", { signal }).then((res) => res.json());

  const result = response.tokens
    .filter((t: any) => t.chainId === chainId)
    .map((token: any) => {
      return {
        address: token.address,
        symbol: token.symbol,
        decimals: token.decimals,
        logoUrl: token.logoURI,
      };
    });

  console.log({ result: result.find((t: any) => t.symbol === "USDT") });

  const native = getNetwork(chainId)?.native as Token;

  return [native, ...result];
};

const tokensLists = {
  [networks.linea.id]: getLineaTokens,
  [networks.base.id]: getBaseTokens,
  [networks.zircuit.id]: getZircuitTokens,
  [networks.poly.id]: getPolygonTokens,
  [networks.sei.id]: getDragonswapTokens,
  [networks.arb.id]: getArbitrumTokens,
};

const getTokens = async (chainId: number, signal?: AbortSignal): Promise<Token[]> => {
  let tokens: Token[] = [];
  if (tokensLists[chainId]) {
    tokens = await tokensLists[chainId](signal);
  } else {
    tokens = await getDefaultTokens(chainId, signal);
  }

  const result = _.sortBy(tokens, (it) => BASE_TOKENS.indexOf(it.symbol));

  return result;
};

export const api = { getTokens };
