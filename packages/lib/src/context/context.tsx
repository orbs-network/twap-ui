import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { TWAPContextProps, TwapLibProps, TwapState } from "../types";
import defaultTranlations from "../i18n/en.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TwapErrorWrapper } from "../ErrorHandling";
import Web3 from "web3";
import { query } from "../hooks/query";
import { LimitPriceMessageContent } from "../components";
import { setWeb3Instance } from "@defi.org/web3-candies";
import { constructSDK, DEFAULT_FILL_DELAY, TimeUnit } from "@orbs-network/twap-sdk";
import BN from "bignumber.js";
import { TX_GAS_COST } from "../consts";
import { useSetDuration } from "../hooks/lib";

export const TwapContext = createContext({} as TWAPContextProps);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const WrappedTwap = (props: TwapLibProps) => {
  const { srcToken, dstToken, isLimitPanel } = useTwapContext();
  query.useFeeOnTransfer(srcToken?.address);
  query.useFeeOnTransfer(dstToken?.address);
  query.useAllowance();
  useMinChunksSizeUpdater();

  return <TwapErrorWrapper>{props.children}</TwapErrorWrapper>;
};

export const getInitialState = ({ storeOverride = {}, isQueryParamsEnabled }: { storeOverride?: Partial<TwapState>; isQueryParamsEnabled?: boolean }): TwapState => {
  return {
    srcAmountUi: "",
    typedFillDelay: DEFAULT_FILL_DELAY,
    disclaimerAccepted: true,
    currentTime: Date.now(),
    ...storeOverride,
  };
};

enum ActionType {
  UPDATED_STATE = "UPDATED_STATE",
}

type Action = { type: ActionType.UPDATED_STATE; value: Partial<TwapState> };

const contextReducer = (state: TwapState, action: Action): TwapState => {
  switch (action.type) {
    case ActionType.UPDATED_STATE:
      return { ...state, ...action.value };
    default:
      return state;
  }
};

const useStore = (props: TwapLibProps) => {
  const [state, dispatch] = useReducer(contextReducer, getInitialState({ storeOverride: props.storeOverride, isQueryParamsEnabled: props.enableQueryParams }));
  const updateState = useCallback((value: Partial<TwapState>) => dispatch({ type: ActionType.UPDATED_STATE, value }), [dispatch]);
  return {
    updateState,
    state,
  };
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
  const { updateState, state } = useStore(props);
  const uiPreferences = props.uiPreferences || {};
  const web3 = useMemo(() => (!props.provider ? undefined : new Web3(props.provider)), [props.provider]);
  useEffect(() => {
    setInterval(() => {
      updateState({ currentTime: Date.now() });
    }, 60_000);
  }, [updateState]);

  useEffect(() => {
    setWeb3Instance(web3);
  }, [web3]);

  const twapSDK = useMemo(() => {
    return constructSDK({ config });
  }, [config]);

  return (
    <TwapContext.Provider
      value={{
        translations,
        isWrongChain,
        state,
        updateState,
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
        twapSDK,
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

const useMinChunksSizeUpdater = () => {
  const { maxFeePerGas } = query.useGasPrice();
  const {
    updateState,
    state: { minChunkSizeUsd },
    config,
    nativeUsd,
  } = useTwapContext();

  const calculate = useCallback(() => {
    const result = BN(TX_GAS_COST)
      .multipliedBy(maxFeePerGas)
      .multipliedBy(nativeUsd || "0")
      .dividedBy(1e18)
      .dividedBy(0.05)
      .decimalPlaces(0)
      .toNumber();
    return updateState({ minChunkSizeUsd: result });
  }, [maxFeePerGas.toString(), updateState, config.minChunkSizeUsd, nativeUsd]);
  useEffect(() => {
    updateState({ minChunkSizeUsd: undefined });
  }, [config.chainId]);

  useEffect(() => {
    if (maxFeePerGas.gt(0) && !minChunkSizeUsd && nativeUsd) {
      calculate();
    }
  }, [maxFeePerGas.toString(), calculate, minChunkSizeUsd, nativeUsd]);
};
