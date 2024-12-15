import React, { useContext, useEffect } from "react";
import { createContext, useReducer, useCallback, useMemo } from "react";
import { SwapStatus } from "@orbs-network/swap-ui";
import {
  Config,
  DEFAULT_FILL_DELAY,
  getMaxFillDelayWarning,
  getMaxTradeDurationWarning,
  getMinFillDelayWarning,
  getMinTradeDurationWarning,
  getPartialFillWarning,
  getTradeSizeWarning,
  TimeDuration,
  TwapSDK,
} from "@orbs-network/twap-sdk";
import BN from "bignumber.js";
import { toWeiAmount } from "./utils";
import { getChunks, getDeadline, getDestTokenMinAmount, getDuration, getFillDelay, getSrcChunkAmount, prepareOrderArgs } from "@orbs-network/twap-sdk/dist/lib/lib";
export type Token = {
  address: string;
  symbol: string;
  decimals: number;
  logoUrl: string;
};

interface State {
  swapStep?: number;
  swapSteps?: number[];
  swapStatus?: SwapStatus;
  srcAmount?: string;

  srcToken?: Token;
  dstToken?: Token;

  chunks?: number;
  fillDelay: TimeDuration;
  duration?: TimeDuration;

  limitPrice?: string;
  isInvertedLimitPrice?: boolean;
  limitPricePercent?: string;
  isMarketOrder?: boolean;
  isLimitPanel?: boolean;

  marketPrice?: string;
  oneSrcTokenUsd?: number;
  currentTime: number;
}

const initialState: State = {
  currentTime: Date.now(),
  fillDelay: DEFAULT_FILL_DELAY,
};

interface ContextType {
  state: State;
  setSrcAmount: (srcAmount: string) => void;
  setChunks: (chunks: number) => void;
  setFillDelay: (fillDelay: TimeDuration) => void;
  setDuration: (duration: TimeDuration) => void;
  setLimitPrice: (limitPrice: string) => void;
  setIsInvertedLimitPrice: (isInvertedLimitPrice: boolean) => void;
  setLimitPricePercent: (limitPricePercent: string) => void;
  setIsMarketOrder: (isMarketOrder: boolean) => void;
  setCurrentTime: (currentTime: number) => void;
  derivedValues: ReturnType<typeof useDerivedValues>;
  warnings: ReturnType<typeof useWarnings>;
  sdk?: TwapSDK;
}

const Context = createContext({} as ContextType);

enum ActionType {
  UPDATED_STATE = "UPDATED_STATE",
}

type Action = { type: ActionType.UPDATED_STATE; value: Partial<State> };

const contextReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.UPDATED_STATE:
      return { ...state, ...action.value };
    default:
      return state;
  }
};

const useTwapState = () => {
  const [state, dispatch] = useReducer(contextReducer, initialState);
  const updateState = useCallback((value: Partial<State>) => dispatch({ type: ActionType.UPDATED_STATE, value }), [dispatch]);

  const setSrcAmount = useCallback((srcAmount: string) => updateState({ srcAmount }), [updateState]);
  const setChunks = useCallback((chunks: number) => updateState({ chunks }), [updateState]);
  const setFillDelay = useCallback((fillDelay: TimeDuration) => updateState({ fillDelay }), [updateState]);
  const setDuration = useCallback((duration: TimeDuration) => updateState({ duration }), [updateState]);
  const setLimitPrice = useCallback((limitPrice: string) => updateState({ limitPrice }), [updateState]);
  const setIsInvertedLimitPrice = useCallback((isInvertedLimitPrice: boolean) => updateState({ isInvertedLimitPrice }), [updateState]);
  const setLimitPricePercent = useCallback((limitPricePercent: string) => updateState({ limitPricePercent }), [updateState]);
  const setIsMarketOrder = useCallback((isMarketOrder: boolean) => updateState({ isMarketOrder }), [updateState]);
  const setCurrentTime = useCallback((currentTime: number) => updateState({ currentTime }), [updateState]);

  return {
    state,
    setSrcAmount,
    setChunks,
    setFillDelay,
    setDuration,
    setLimitPrice,
    setIsInvertedLimitPrice,
    setLimitPricePercent,
    setIsMarketOrder,
    setCurrentTime,
  };
};

export const usePrice = (state: State) => {
  const { isMarketOrder, marketPrice, dstToken, limitPrice, isInvertedLimitPrice } = state;

  const price = useMemo(() => {
    if (!dstToken) return undefined;

    if (!limitPrice || isMarketOrder || !marketPrice) return marketPrice;

    const result = isInvertedLimitPrice ? BN(1).div(limitPrice).toString() : limitPrice;

    return toWeiAmount(dstToken.decimals, result);
  }, [dstToken, isInvertedLimitPrice, isMarketOrder, marketPrice, limitPrice]);

  return price;
};

const useMaxPossibleChunks = (state: State, config: Config) => {
  const { srcAmount, oneSrcTokenUsd } = state;
  return useMemo(() => {
    if (!oneSrcTokenUsd || !srcAmount) return 1;
    const amount = BN(oneSrcTokenUsd).times(srcAmount);
    const res = BN.max(1, amount.div(config.minChunkSizeUsd)).integerValue(BN.ROUND_FLOOR).toNumber();
    return res > 1 ? res : 1;
  }, [srcAmount, oneSrcTokenUsd]);
};

const useFillDelay = (state: State) => {
  const { isLimitPanel, fillDelay } = state;
  return useMemo(() => {
    return getFillDelay(isLimitPanel, fillDelay);
  }, [isLimitPanel, fillDelay]);
};

const useChunks = (state: State, config: Config) => {
  const { isLimitPanel, chunks } = state;
  const maxPossibleChunks = useMaxPossibleChunks(state, config);
  return useMemo(() => getChunks(maxPossibleChunks, isLimitPanel, chunks), [chunks, isLimitPanel, maxPossibleChunks, config]);
};

export const useSrcChunkAmount = (state: State, config: Config) => {
  const { srcAmount, srcToken, oneSrcTokenUsd } = state;
  const chunks = useChunks(state, config);
  return useMemo(() => {
    const amount = toWeiAmount(srcToken?.decimals, srcAmount);
    const srcChunkAmount = getSrcChunkAmount(amount, chunks);
    return {
      amount: srcChunkAmount,
      usd: BN(srcChunkAmount)
        .times(oneSrcTokenUsd || 0)
        .toFixed(0),
    };
  }, [srcAmount, srcToken, chunks, oneSrcTokenUsd, config]);
};

const useDuration = (state: State, config: Config) => {
  const chunks = useChunks(state, config);
  const fillDelay = useFillDelay(state);
  const { duration } = state;
  return useMemo(() => {
    return getDuration(chunks, fillDelay, duration);
  }, [getChunks, fillDelay, duration, chunks]);
};

const useDstMinAmountOut = (state: State, config: Config) => {
  const srcChunkAmount = useSrcChunkAmount(state, config).amount;
  const { isMarketOrder, srcToken, dstToken } = state;
  const price = usePrice(state);

  return useMemo(() => {
    return getDestTokenMinAmount(srcChunkAmount, price, isMarketOrder, srcToken?.decimals, dstToken?.decimals);
  }, [srcChunkAmount, isMarketOrder, price, srcToken, dstToken, config]);
};

const useDeadline = (state: State) => {
  const { currentTime, duration } = state;
  return useMemo(() => {
    if (!duration) return undefined;
    return getDeadline(currentTime, duration);
  }, [currentTime, duration]);
};

const useDerivedValues = (state: State, config: Config) => {
  const { srcAmount, dstToken, srcToken } = state;
  const srcChunkAmount = useSrcChunkAmount(state, config);
  const chunks = useChunks(state, config);
  const fillDelay = useFillDelay(state);
  const duration = useDuration(state, config);
  const minAmountOut = useDstMinAmountOut(state, config);
  const deadline = useDeadline(state);

  const askParams = useMemo(() => {
    prepareOrderArgs(config, {
      destTokenMinAmount: minAmountOut,
      srcChunkAmount: srcChunkAmount.amount,
      deadline: deadline || 0,
      fillDelay: fillDelay,
      srcAmount: srcAmount || "",
      srcTokenAddress: srcToken?.address || "",
      destTokenAddress: dstToken?.address || "",
    });
  }, [config, minAmountOut, srcAmount, srcChunkAmount, fillDelay, deadline, srcToken, dstToken]);

  return {
    srcChunkAmount: srcChunkAmount.amount,
    srcChunkAmountUsd: srcChunkAmount.usd,
    chunks,
    fillDelay,
    duration,
    minAmountOut,
    deadline,
    askParams,
  };
};

export const amountUi = (decimals?: number, amount?: string) => {
  if (!decimals || !amount) return "";
  const percision = BN(10).pow(decimals || 0);
  return BN(amount).times(percision).idiv(percision).div(percision).toString();
};

const useWarnings = (state: State, derivedValues: ReturnType<typeof useDerivedValues>, config: Config) => {
  const { chunks, duration, fillDelay, srcChunkAmountUsd } = derivedValues;
  const { isLimitPanel, srcToken } = state;
  return useMemo(() => {
    return {
      partialFill: getPartialFillWarning(chunks, duration, fillDelay),
      minFillDelay: isLimitPanel ? false : getMinFillDelayWarning(fillDelay),
      maxFillDelay: getMaxFillDelayWarning(fillDelay),
      minDuration: isLimitPanel ? false : getMinTradeDurationWarning(duration),
      maxDuration: getMaxTradeDurationWarning(duration),
      tradeSize: isLimitPanel ? false : !!getTradeSizeWarning(config.minChunkSizeUsd, amountUi(srcToken?.decimals, srcChunkAmountUsd), chunks),
    };
  }, [chunks, duration, fillDelay, srcChunkAmountUsd, isLimitPanel, srcToken, config]);
};

export const TwapProvider = ({ children, config }: { children: React.ReactNode; config: Config }) => {
  const { state, setSrcAmount, setChunks, setFillDelay, setDuration, setLimitPrice, setIsInvertedLimitPrice, setLimitPricePercent, setIsMarketOrder, setCurrentTime } =
    useTwapState();

  const sdk = useMemo(() => new TwapSDK({ config }), [config]);

  useEffect(() => {
    setInterval(() => {
      setCurrentTime(Date.now());
    }, 60_000);
  }, [setCurrentTime]);

  return (
    <Context.Provider
      value={{
        sdk,
        state,
        derivedValues: useDerivedValues(state, config),
        warnings: useWarnings(state, useDerivedValues(state, config), config),
        setSrcAmount,
        setChunks,
        setFillDelay,
        setDuration,
        setLimitPrice,
        setIsInvertedLimitPrice,
        setLimitPricePercent,
        setIsMarketOrder,
        setCurrentTime,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useTwapContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useTwapContext must be used within a TwapProvider");
  }
  return context;
};
