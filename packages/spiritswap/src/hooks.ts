import { TokenData } from "@orbs-network/twap";
import { store, TWAPTokenSelectProps } from "@orbs-network/twap-ui";
import { createContext, FC, useContext, useEffect, useMemo, useRef } from "react";
import { SpiritSwapTWAPProps } from ".";
import _ from "lodash";
import Web3 from "web3";
import { configureStyles } from "./styles";

export const useGetProvider = (getProvider: () => any, account?: string) => {
  return useMemo(() => getProvider(), [account]);
};

export const parseToken = (rawToken: any, getTokenImageUrl: (symbol: string) => string): TokenData => {
  return {
    address: Web3.utils.toChecksumAddress(rawToken.address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: getTokenImageUrl(rawToken.symbol),
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

export const useSetTokensFromDapp = (srcTokenSymbol?: string, dstTokenSymbol?: string, tokenList?: TokenData[]) => {
  const setSrcToken = store.useTwapStore((state) => state.setSrcToken);
  const setDstToken = store.useTwapStore((state) => state.setDstToken);

  const tokenListRef = useRef<TokenData[] | undefined>(undefined);
  tokenListRef.current = tokenList;
  const listLength = tokenList?.length || 0;

  useEffect(() => {
    if (!listLength) return;
    const srcToken = findToken(tokenListRef.current, srcTokenSymbol);
    const dstToken = findToken(tokenListRef.current, dstTokenSymbol);
    setSrcToken(srcToken);
    setDstToken(dstToken);
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

export const usePrepareAdapterContextProps = (props: SpiritSwapTWAPProps) => {
  return {
    onSrcTokenSelected: props.onSrcTokenSelected,
    onDstTokenSelected: props.onDstTokenSelected,
    dappTokens: props.dappTokens,
    getTokenImageUrl: props.getTokenImageUrl,
    TokenSelectModal: props.TokenSelectModal,
  };
};
const AdapterContext = createContext({} as AdapterContextProps);

export const AdapterContextProvider = AdapterContext.Provider;

export const useAdapterContext = () => useContext(AdapterContext);

export const useGlobalStyles = () => {
  return configureStyles();
};
