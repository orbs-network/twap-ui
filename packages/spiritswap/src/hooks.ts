import { eqIgnoreCase } from "@defi.org/web3-candies";
import { Configs, TokenData } from "@orbs-network/twap";
import { hooks } from "@orbs-network/twap-ui";
import _ from "lodash";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SpiritSwapTWAPProps } from ".";
import Web3 from "web3";
export const useGetProvider = (getProvider: () => any, account?: string) => {
  const [provider, setProvider] = useState<any | undefined>(undefined);
  const [connectedChain, setConnectedChain] = useState<any | undefined>(undefined);

  const onAccountChanged = async (_account?: any) => {
    if (!_account) {
      setConnectedChain(undefined);
      setProvider(undefined);
      return 
    }
    const _provider = getProvider();
    const web3 = new Web3(_provider);
    const _connectedChain = await web3.eth.getChainId();
    if (_connectedChain !== Configs.SpiritSwap.chainId) {
      setProvider(undefined);
    } else {
      setProvider(_provider);
    }

    setConnectedChain(_connectedChain);
  };

  useEffect(() => {
    onAccountChanged(account);
  }, [account]);
  return { connectedChain, provider };
};

export const parseToken = (rawToken: any, getTokenImage: (rawToken: any) => string): TokenData => {
  return {
    address: rawToken.address,
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: getTokenImage(rawToken),
  };
};

export const useUnparsedToken = () => {
  const { dappTokens } = useAdapterContext();

  return (token: TokenData) => {
    return dappTokens.filter((t) => eqIgnoreCase(t.address, token.address));
  };
};

export const useParseTokenList = (getTokenImage: (rawToken: any) => string, dappTokens?: any): TokenData[] => {
  return useMemo(() => {
    if (!dappTokens) return [];
    const result = _.map(dappTokens, (t) => parseToken(t, getTokenImage));

    return result;
  }, [dappTokens]);
};

const findToken = (tokenList?: TokenData[], symbol?: string) => {
  const token = tokenList?.find((t: TokenData) => t.symbol.toUpperCase() === symbol?.toUpperCase());
  return !token ? undefined : token;
};

export const useTokensFromDapp = (srcTokenSymbol?: string, dstTokenSymbol?: string, tokenList?: TokenData[]) => {
  const setTokens = hooks.useSetTokens();
  const tokenListRef = useRef<TokenData[] | undefined>(undefined);

  tokenListRef.current = tokenList;
  const tokensLoaded = tokenList && tokenList.length > 0;
  const listLength = tokenList ? tokenList.length : 0;

  useEffect(() => {
    const srcToken = findToken(tokenListRef.current, srcTokenSymbol);
    const dstToken = findToken(tokenListRef.current, dstTokenSymbol);
    setTokens(srcToken, dstToken);
  }, [srcTokenSymbol, dstTokenSymbol, tokensLoaded, listLength]);
};

export interface AdapterContextProps {
  getTokenImage: (token: any) => string;
  dappTokens: any[];
  onSrcTokenSelected: (value: any) => void;
  onDstTokenSelected: (value: any) => void;
  TokenSelectModal: any;
}

export const usePreparetAdapterContextProps = (props: SpiritSwapTWAPProps) => {
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
    getTokenImage: props.getTokenImage,
    TokenSelectModal: props.TokenSelectModal,
  };
};

const LocalAdapter = createContext({} as AdapterContextProps);
export const LocalContext = LocalAdapter.Provider;
export const useAdapterContext = () => useContext(LocalAdapter);
