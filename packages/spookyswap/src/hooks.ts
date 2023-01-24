import { TokenData } from "@orbs-network/twap";
import { store, TWAPTokenSelectProps } from "@orbs-network/twap-ui";
import _ from "lodash";
import { createContext, FC, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { SpookySwapTWAPProps } from ".";

import Web3 from "web3";
import { configureStyles } from "./styles";

export const useGetProvider = (getProvider: () => any, account?: string) => {
  return useMemo(() => {
    return getProvider();
  }, [account]);
};

export const parseToken = (rawToken: any, getTokenImage: (symbol: string) => string): TokenData => {
  return {
    address: Web3.utils.toChecksumAddress(rawToken.address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: getTokenImage(rawToken.symbol),
  };
};

export const useParseTokenList = (getTokenImageUrl: (symbol: string) => string, dappTokens?: any[]): TokenData[] => {
  const dappTokensRef = useRef<any[] | undefined>(undefined);
  dappTokensRef.current = dappTokens;
  const dappTokensLength = dappTokens?.length || 0;

  return useMemo(() => {
    if (!dappTokensRef.current) return [];
    return _.map(dappTokensRef.current, (t) => parseToken(t, getTokenImageUrl));
  }, [dappTokensLength]);
};

const findToken = (tokenList?: TokenData[], symbol?: string) => {
  const token = tokenList?.find((t: TokenData) => t.symbol.toUpperCase() === symbol?.toUpperCase());
  return !token ? undefined : token;
};

export const useTokensFromDapp = (srcTokenSymbol?: string, dstTokenSymbol?: string, tokenList?: TokenData[]) => {
  const setTokens = store.useTwapStore((state) => state.setTokens);

  const tokenListRef = useRef<TokenData[] | undefined>(undefined);

  tokenListRef.current = tokenList;
  const listLength = tokenList?.length || 0;

  useEffect(() => {
    if (!listLength) return;
    const srcToken = findToken(tokenListRef.current, srcTokenSymbol);
    const dstToken = findToken(tokenListRef.current, dstTokenSymbol);
    setTokens(srcToken, dstToken);
  }, [srcTokenSymbol, dstTokenSymbol, listLength]);
};

export interface AdapterContextProps {
  getTokenImageUrl: (symbol: string) => string;
  dappTokens: any[];
  onSrcTokenSelected: (value: any) => void;
  onDstTokenSelected: (value: any) => void;
  TokenSelectModal: any;
  ModifiedTokenSelectModal: FC<TWAPTokenSelectProps>;
}

export const usePrepareAdapterContextProps = (props: SpookySwapTWAPProps) => {
  const memoizedOnSrcTokenSelected = useCallback((token: any) => {
    props.onSrcTokenSelected?.(token);
  }, []);

  const memoizedOnDstTokenSelected = useCallback((token: any) => {
    props.onDstTokenSelected?.(token);
  }, []);

  return {
    onSrcTokenSelected: memoizedOnSrcTokenSelected,
    onDstTokenSelected: memoizedOnDstTokenSelected,
    dappTokens: props.dappTokens,
    getTokenImageUrl: props.getTokenImageUrl,
    TokenSelectModal: props.TokenSelectModal,
  };
};

const AdapterContext = createContext({} as AdapterContextProps);

export const AdapterContextProvider = AdapterContext.Provider;

export const useAdapterContext = () => useContext(AdapterContext);
export const useGlobalStyles = (darkMode?: boolean) => {
  return configureStyles(darkMode);
};
