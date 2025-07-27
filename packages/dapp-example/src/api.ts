import { getNetwork, networks } from "@orbs-network/twap-sdk";
import { Token } from "@orbs-network/twap-ui";
import _ from "lodash";

const BASE_TOKENS = _.uniq(["USDT", "USDC", "DAI", "WBTC", "BUSD", ...Object.values(networks).map((it) => it.wToken.symbol)]);

const coingekoChainToName = {
  [networks.flare.id]: "flare-network",
  [networks.ftm.id]: "fantom",
  [networks.arb.id]: "arbitrum-one",
  [networks.poly.id]: "polygon-pos",
  [networks.base.id]: "base",
  [networks.eth.id]: "ethereum",
  [networks.bsc.id]: "binance-smart-chain",
  [networks.linea.id]: "linea",
  [networks.sonic.id]: "sonic",
  [networks.cronosZkEvm.id]: "cronos-zkevm",
  [networks.katana.id]: "katana",
  [networks.sei.id]: "sei-v2",
};

const getDefaultTokens = async (chainId: number, signal?: AbortSignal): Promise<Token[]> => {
  const name = coingekoChainToName[chainId];

  if (name) {
    const payload = await fetch(`https://tokens.coingecko.com/${name}/all.json`, { signal }).then((res) => res.json());

    return payload.tokens.map((token: any) => {
      return {
        address: token.address,
        symbol: token.symbol,
        decimals: token.decimals,
        logoUrl: token.logoURI,
      };
    });
  }

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

  const native = getNetwork(chainId)?.native as Token;

  return [native, ...result];
};

const getTokens = async (chainId: number, signal?: AbortSignal): Promise<Token[]> => {
  const tokens = await getDefaultTokens(chainId, signal);

  const result = _.sortBy(tokens, (it) => BASE_TOKENS.indexOf(it.symbol)).reverse();
  const native = getNetwork(chainId)?.native as Token;

  return [native, ...result];
};

export const api = { getTokens };
