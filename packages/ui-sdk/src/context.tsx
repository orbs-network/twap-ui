import { Dispatch, useContext, useEffect, useState } from "react";
import { createContext, useReducer, useCallback, useMemo } from "react";
import * as SDK from "@orbs-network/twap-sdk";
import BN from "bignumber.js";
import { safeValue, toAmountUi, toWeiAmount } from "./utils";
import { State, SwapState, SwapStep, Token, TwapProviderProps } from "./types";
import { getNetwork } from "./networks";

const initialState: State = {
  currentTime: Date.now(),
  typedFillDelay: SDK.DEFAULT_FILL_DELAY,
};

interface ContextType {
  state: State;
  actionHandlers: ReturnType<typeof useStateActionsHandlers>;
  sdk: SDK.TwapSDK;
  isLimitPanel?: boolean;
  parsedSrcToken?: Token;
  parsedDstToken?: Token;
  config: SDK.Config;
  derivedValues: ReturnType<typeof useDerivedSwapValues>;
  walletAddress?: string;
}
enum ActionType {
  UPDATED_STATE = "UPDATED_STATE",
}

type Action = { type: ActionType.UPDATED_STATE; value: Partial<State> };

const Context = createContext({} as ContextType);

const contextReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.UPDATED_STATE:
      return { ...state, ...action.value };
    default:
      return state;
  }
};

const useStateActionsHandlers = (state: State, dispatch: Dispatch<Action>, parsedDstToken?: Token) => {
  const updateState = useCallback((value: Partial<State>) => dispatch({ type: ActionType.UPDATED_STATE, value }), [dispatch]);

  const onInvertPrice = () => {
    return useCallback(() => {
      updateState({
        isInvertedLimitPrice: !state.isInvertedLimitPrice,
        typedPrice: undefined,
        limitPricePercent: undefined,
      });
    }, [updateState, state.isInvertedLimitPrice, state.typedPrice, state.limitPricePercent]);
  };

  const onPricePercentClick = useCallback(
    (percent?: string) => {
      updateState({ limitPricePercent: percent });
      if (BN(percent || 0).isZero()) {
        updateState({ typedPrice: undefined });
        return;
      }
      const p = BN(percent || 0)
        .div(100)
        .plus(1)
        .toString();
      let price = toAmountUi(parsedDstToken?.decimals, state.marketPrice);

      if (state.isInvertedLimitPrice) {
        price = BN(1)
          .div(price || "0")
          .toString();
      }

      const value = BN(price || "0")
        .times(p)
        .toString();
      updateState({ typedPrice: BN(value).decimalPlaces(6).toString() });
    },
    [parsedDstToken, state.isInvertedLimitPrice, state.marketPrice, updateState],
  );

  return {
    setSrcAmount: useCallback((typedSrcAmount: string) => updateState({ typedSrcAmount }), [updateState]),
    setChunks: useCallback((typedChunks: number) => updateState({ typedChunks }), [updateState]),
    setFillDelay: useCallback((typedFillDelay: SDK.TimeDuration) => updateState({ typedFillDelay }), [updateState]),
    setDuration: useCallback((typedDuration?: SDK.TimeDuration) => updateState({ typedDuration }), [updateState]),
    setLimitPrice: useCallback((typedPrice?: string) => updateState({ typedPrice }), [updateState]),
    setIsInvertedLimitPrice: useCallback((isInvertedLimitPrice: boolean) => updateState({ isInvertedLimitPrice }), [updateState]),
    setIsMarketOrder: useCallback((isMarketOrder: boolean) => updateState({ isMarketOrder }), [updateState]),
    setMarketPrice: useCallback((marketPrice: string) => updateState({ marketPrice }), [updateState]),
    setSrcToken: useCallback((rawSrcToken: any) => updateState({ rawSrcToken }), [updateState]),
    setDstToken: useCallback((rawDstToken: any) => updateState({ rawDstToken }), [updateState]),
    setOneSrcTokenUsd: useCallback((oneSrcTokenUsd: number) => updateState({ oneSrcTokenUsd }), [updateState]),
    setCurrentTime: useCallback((currentTime: number) => updateState({ currentTime }), [updateState]),
    setLimitPricePercent: useCallback((limitPricePercent?: string) => updateState({ limitPricePercent }), [updateState]),
    setSwapStep: useCallback((swapStep?: SwapStep) => updateState({ swapStep }), [updateState]),
    setSwapSteps: useCallback((swapSteps?: SwapStep[]) => updateState({ swapSteps }), [updateState]),
    setShowConfirmation: useCallback((showConfirmation: boolean) => updateState({ showConfirmation }), [updateState]),
    setWrapSuccess: useCallback((wrapSuccess: boolean) => updateState({ wrapSuccess }), [updateState]),
    setApproveSuccess: useCallback((approveSuccess: boolean) => updateState({ approveSuccess }), [updateState]),
    setCreatedOrderSuccess: useCallback((createOrderSuccess: boolean) => updateState({ createOrderSuccess }), [updateState]),
    setSwapStatus: useCallback((swapStatus?: SwapState) => updateState({ swapStatus }), [updateState]),
    setCrteateOrderTxHash: useCallback((createOrderTxHash?: string) => updateState({ createOrderTxHash }), [updateState]),
    onInvertPrice,
    onPricePercentClick,
  };
};

export const getPriceDiffFromMarket = (limitPrice?: string, marketPrice?: string, isLimitPriceInverted?: boolean) => {
  if (!limitPrice || !marketPrice || BN(limitPrice).isZero() || BN(limitPrice).isZero()) return "0";
  const from = isLimitPriceInverted ? marketPrice : limitPrice;
  const to = isLimitPriceInverted ? limitPrice : marketPrice;
  return BN(from).div(to).minus(1).multipliedBy(100).decimalPlaces(2, BN.ROUND_HALF_UP).toFixed();
};

export const useDerivedSwapValues = (sdk: SDK.TwapSDK, state: State, parsedSrcToken?: Token, parsedDstToken?: Token, isLimitPanel?: boolean) => {
  const price = useMemo(() => {
    if (!state.typedPrice || state.isMarketOrder || !state.marketPrice) return state.marketPrice;
    const result = state.isInvertedLimitPrice ? BN(1).div(state.typedPrice).toString() : state.typedPrice;
    return safeValue(toWeiAmount(parsedDstToken?.decimals, result));
  }, [state.typedPrice, state.isMarketOrder, state.marketPrice, state.isInvertedLimitPrice, parsedDstToken?.decimals]);

  return useMemo(() => {
    const srcAmount = safeValue(toWeiAmount(parsedSrcToken?.decimals, state.typedSrcAmount));
    const data = sdk.derivedSwapValues({
      oneSrcTokenUsd: state.oneSrcTokenUsd,
      srcAmount,
      srcDecimals: parsedSrcToken?.decimals,
      destDecimals: parsedDstToken?.decimals,
      customChunks: state.typedChunks,
      isLimitPanel,
      customFillDelay: state.typedFillDelay,
      customDuration: state.typedDuration,
      price,
      isMarketOrder: state.isMarketOrder,
    });
    const deadline = sdk.orderDeadline(state.currentTime, data.duration);
    const wToken = getNetwork(sdk.config.chainId)?.wToken;
    const createOrderArgs = sdk.prepareOrderArgs({
      destTokenMinAmount: data.destTokenMinAmount,
      srcChunkAmount: data.srcChunkAmount,
      deadline: deadline,
      fillDelay: data.fillDelay,
      srcAmount,
      srcTokenAddress: SDK.isNativeAddress(parsedSrcToken?.address) ? wToken?.address || "" : parsedSrcToken?.address || "",
      destTokenAddress: parsedDstToken?.address || "",
    });

    const priceDiffFromMarket = getPriceDiffFromMarket(price, state.marketPrice, state.isInvertedLimitPrice);
    return {
      ...data,
      price,
      priceUI: toAmountUi(parsedDstToken?.decimals, price),
      srcAmount,
      priceDiffFromMarket,
      srcChunksAmountUI: toAmountUi(parsedSrcToken?.decimals, data.srcChunkAmount),
      destTokenMinAmountOutUI: toAmountUi(parsedDstToken?.decimals, data.destTokenMinAmount),
      destTokenAmountUI: toAmountUi(parsedDstToken?.decimals, data.destTokenAmount),
      deadline: sdk.orderDeadline(state.currentTime, data.duration),
      createOrderArgs,
    };
  }, [state, parsedSrcToken, parsedDstToken, sdk, isLimitPanel, state.oneSrcTokenUsd]);
};

export const TwapProvider = ({ children, config, isLimitPanel = false, parseToken, walletAddress }: TwapProviderProps) => {
  const [state, dispatch] = useReducer(contextReducer, initialState);

  const sdk = useMemo(() => new SDK.TwapSDK({ config }), [config]);

  const parsedSrcToken = useMemo(() => parseToken?.(state.rawSrcToken), [state.rawSrcToken, parseToken]);
  const parsedDstToken = useMemo(() => parseToken?.(state.rawDstToken), [state.rawDstToken, parseToken]);

  const derivedValues = useDerivedSwapValues(sdk, state, parsedSrcToken, parsedDstToken, isLimitPanel);
  const actionHandlers = useStateActionsHandlers(state, dispatch, parsedDstToken);

  return (
    <Context.Provider
      value={{
        sdk,
        actionHandlers,
        state,
        isLimitPanel,
        parsedSrcToken,
        parsedDstToken,
        config,
        derivedValues,
        walletAddress,
      }}
    >
      <ContextListeners />
      {children}
    </Context.Provider>
  );
};

const ContextListeners = () => {
  const { actionHandlers, isLimitPanel } = useTwapContext();
  useEffect(() => {
    if (isLimitPanel) {
      actionHandlers.setIsMarketOrder(false);
      actionHandlers.setDuration({ unit: SDK.TimeUnit.Weeks, value: 1 });
    } else {
      actionHandlers.setIsMarketOrder(true);
      actionHandlers.setDuration({ unit: SDK.TimeUnit.Minutes, value: 5 });
    }
  }, [isLimitPanel]);

  useEffect(() => {
    setInterval(() => {
      actionHandlers.setCurrentTime(Date.now());
    }, 60_000);
  }, [actionHandlers]);

  return null;
};

export const useTwapContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useTwapContext must be used within a TwapProvider");
  }
  return context;
};

export const useSwapPriceDisplay = () => {
  const [inverted, setInvert] = useState(Boolean);
  const {
    derivedValues: { destTokenAmountUI },
    state: { typedSrcAmount },
    parsedSrcToken,
    parsedDstToken,
  } = useTwapContext();
  const price = useMemo(() => {
    if (!destTokenAmountUI || !typedSrcAmount) return "0";
    const value = BN(destTokenAmountUI).dividedBy(typedSrcAmount).toString();
    return inverted ? BN(1).div(value).toString() : value;
  }, [destTokenAmountUI, typedSrcAmount, inverted]);

  const toggleInvert = useCallback(() => {
    setInvert((prev) => !prev);
  }, []);

  return {
    toggleInvert,
    price,
    leftToken: inverted ? parsedDstToken : parsedSrcToken,
    rightToken: inverted ? parsedSrcToken : parsedDstToken,
  };
};

export const useLimitInput = () => {
  const {
    actionHandlers,
    derivedValues: { priceUI },
    state,
  } = useTwapContext();
  const { isInvertedLimitPrice, typedPrice } = state;

  const value = useMemo(() => {
    if (typedPrice) return typedPrice;

    if (isInvertedLimitPrice && priceUI) {
      return BN(1).div(priceUI).toString();
    }

    return priceUI;
  }, [typedPrice, priceUI, isInvertedLimitPrice]);

  return {
    value: value || "",
    onChange: actionHandlers.setLimitPrice,
  };
};
