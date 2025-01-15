import React, { createContext, useContext, useEffect, useMemo } from "react";
import { TWAPContextProps, TwapLibProps } from "../types";
import defaultTranlations from "../i18n/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TwapErrorWrapper } from "../ErrorHandling";
import Web3 from "web3";
import { query } from "../hooks/query";
import { LimitPriceMessageContent } from "../components";
import { setWeb3Instance } from "@defi.org/web3-candies";
import { TwapProvider as TwapProviderUI, useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";

export const TwapContext = createContext({} as TWAPContextProps);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const parseToken = (token: any) => {
  return {} as any;
};

const WrappedTwap = (props: TwapLibProps) => {
  return (
    <TwapErrorWrapper>
      <TwapProviderUI parseToken={parseToken} isLimitPanel={props.isLimitPanel} config={props.config}>
        <Panel {...props}>{props.children}</Panel>
      </TwapProviderUI>
    </TwapErrorWrapper>
  );
};

const Panel = (props: TwapLibProps) => {
  const { actionHandlers } = useTwapContextUI();
  const { srcToken, dstToken } = useTwapContext();
  query.useFeeOnTransfer(srcToken?.address);
  query.useFeeOnTransfer(dstToken?.address);
  query.useAllowance();

  useEffect(() => {
    actionHandlers.setMarketPrice(props.marketPrice || "");
  }, [props.marketPrice]);

  useEffect(() => {
    actionHandlers.setSrcToken(props.srcToken);
  }, [props.srcToken]);

  useEffect(() => {
    actionHandlers.setDstToken(props.dstToken);
  }, [props.srcToken]);

  return <>{props.children}</>;
};

const useIsWrongChain = (props: TwapLibProps, chainId?: number) => {
  return useMemo(() => {
    if (!props.account) {
      return false;
    }
    if (props.isWrongChain) {
      return true;
    }
    if (!chainId) {
      return false;
    }

    return chainId !== props.config?.chainId;
  }, [chainId, props.config?.chainId, props.isWrongChain]);
};

export const Content = (props: TwapLibProps) => {
  const { config } = props;
  const translations = useMemo(() => ({ ...defaultTranlations, ...props.translations }), [props.translations]);
  const isWrongChain = useIsWrongChain(props, props.chainId);
  const uiPreferences = props.uiPreferences || {};
  const web3 = useMemo(() => (!props.provider ? undefined : new Web3(props.provider)), [props.provider]);

  useEffect(() => {
    setWeb3Instance(web3);
  }, [web3]);

  return (
    <TwapContext.Provider
      value={{
        translations,
        isWrongChain,
        marketPrice: props.marketPrice,
        uiPreferences,
        srcToken: props.srcToken,
        dstToken: props.dstToken,
        srcUsd: props.srcUsd || 0,
        dstUsd: props.dstUsd || 0,
        Components: props.Components,
        web3,
        config,
        account: props.account,
        onDstTokenSelected: props.onDstTokenSelected,
        onSrcTokenSelected: props.onSrcTokenSelected,
        onSwitchTokens: props.onSwitchTokens || (() => {}),
        isLimitPanel: !!props.isLimitPanel,
        tokens: props.parsedTokens || [],
        maxFeePerGas: props.maxFeePerGas,
        priorityFeePerGas: props.priorityFeePerGas,
        askDataParams: props.askDataParams,
        onTxSubmitted: props.onTxSubmitted,
        minNativeTokenBalance: props.minNativeTokenBalance,
        enableQueryParams: props.enableQueryParams,
        isExactAppoval: props.isExactAppoval,
        fee: props.fee,
        nativeUsd: props.nativeUsd,
        useDappToken: props.useDappToken,
        useParsedToken: props.useParsedToken,
      }}
    >
      <WrappedTwap {...props} />
      <LimitPriceMessageContent />
    </TwapContext.Provider>
  );
};

export const TwapAdapter = (props: TwapLibProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Content {...props} />
    </QueryClientProvider>
  );
};

export const useTwapContext = () => {
  return useContext(TwapContext);
};
