import { Configs, isNativeAddress, TokenData } from "@orbs-network/twap";
import { store } from "@orbs-network/twap-ui";
import { createContext, useContext, useEffect, useMemo } from "react";
import { SpiritSwapTWAPProps } from ".";
import Web3 from "web3";
import { configureStyles } from "./styles";

export const useGetProvider = (getProvider: () => any, account?: string) => {
  return useMemo(() => getProvider(), [account]);
};

export const parseToken = (rawToken: any, getTokenImageUrl: (symbol: string) => string): TokenData | undefined => {
  if (!rawToken.address || !rawToken.symbol || !rawToken.decimals) {
    console.error("Invalid token");
    return;
  }
  if (isNativeAddress(rawToken.address)) {
    return Configs.SpiritSwap.nativeToken;
  }

  return {
    address: Web3.utils.toChecksumAddress(rawToken.address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: getTokenImageUrl(rawToken.symbol),
  };
};

const findToken = (symbol: string, tokenList?: TokenData[]) => {
  const token = tokenList?.find((t: TokenData) => t.symbol.toUpperCase() === symbol?.toUpperCase());
  return !token ? undefined : token;
};

export const useTokensFromDapp = (srcTokenSymbol?: string, dstTokenSymbol?: string, dappTokens?: any[]) => {
  const setSrcToken = store.useTwapStore((state) => state.setSrcToken);
  const setDstToken = store.useTwapStore((state) => state.setDstToken);
  const wrongNetwork = store.useTwapStore((store) => store.wrongNetwork);
  const tokensReady = dappTokens && dappTokens.length > 0;

  useEffect(() => {
    if (!tokensReady || wrongNetwork || wrongNetwork == null) return;

    if (srcTokenSymbol) {
      const srcToken = findToken(srcTokenSymbol, dappTokens);
      setSrcToken(srcToken);
    }
    if (dstTokenSymbol) {
      const dstToken = findToken(dstTokenSymbol, dappTokens);
      setDstToken(dstToken);
    }
  }, [srcTokenSymbol, dstTokenSymbol, tokensReady, wrongNetwork]);
};

const AdapterContext = createContext({} as SpiritSwapTWAPProps);

export const AdapterContextProvider = AdapterContext.Provider;

export const useAdapterContext = () => useContext(AdapterContext);

export const useGlobalStyles = () => {
  return configureStyles();
};
