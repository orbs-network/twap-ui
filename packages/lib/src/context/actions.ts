import { useCallback } from "react";
import { defaultCustomFillDelay, Duration, MIN_TRADE_INTERVAL_FORMATTED, QUERY_PARAMS, resetQueryParams, setQueryParam, SwapState, SwapStep, TimeResolution } from "..";
import { useTwapContext } from "./context";
import BN from "bignumber.js";
import { waitForOrder } from "../helper";
import { useDstAmountUsdUi, useGetTokenFromParsedTokensList, useOutAmount, useSrcAmount, useSrcAmountUsdUi } from "../hooks";

const useHandleLimitPriceQueryParam = () => {
  const setQueryParam = useSetQueryParams();
  return useCallback(
    (value?: string, inverted?: boolean) => {
      let newValue = value;

      if (BN(newValue || 0).isZero()) {
        setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
      }
      if (inverted) {
        newValue = BN(1)
          .div(value || "0")
          .toString();
      }
      setQueryParam(QUERY_PARAMS.LIMIT_PRICE, newValue);
    },
    [setQueryParam]
  );
};

export const useSetQueryParams = () => {
  const enableQueryParams = useTwapContext().dappProps.enableQueryParams;
  return useCallback(
    (name: string, value?: string) => {
      if (!enableQueryParams) return;
      setQueryParam(name, value);
    },
    [enableQueryParams]
  );
};

export const useSwitchNativeToWrapped = () => {
  const { dappProps, lib } = useTwapContext();
  const { onSrcTokenSelected } = dappProps;
  const getTokenFromList = useGetTokenFromParsedTokensList();
  return useCallback(() => {
    const token = getTokenFromList(lib!.config.wToken.address);
    if (token) {
      onSrcTokenSelected?.(token);
    }
  }, [lib, onSrcTokenSelected, getTokenFromList]);
};

// Hook for handling modal close
const useSwapModalActions = () => {
  const { updateState, state } = useTwapContext();
  const { swapState, wrapSuccess } = state;
  const onClose = useCallback(
    (closeDalay?: number) => {
      updateState({ showConfirmation: false });
      if (swapState === "loading") return;
      setTimeout(() => {
        updateState({
          swapSteps: undefined,
          swapState: undefined,
          swapStep: undefined,
          approveSuccess: undefined,
          wrapSuccess: undefined,
          wrapTxHash: undefined,
          unwrapTxHash: undefined,
          approveTxHash: undefined,
          createOrderSuccess: undefined,
          swapData: undefined,
        });
      }, closeDalay || 300);
    },
    [updateState, swapState, wrapSuccess]
  );

  const onOpen = useCallback(() => {
    updateState({ showConfirmation: true });
  }, [updateState]);

  return {
    onClose,
    onOpen,
  };
};

// Hook for handling swap reset
const useSwapReset = () => {
  const { updateState } = useTwapContext();

  return useCallback(() => {
    updateState({
      srcAmountUi: "",
      limitPricePercent: undefined,
      customLimitPrice: undefined,
      isCustomLimitPrice: false,
      isInvertedLimitPrice: false,
      customChunks: undefined,
      customFillDelay: defaultCustomFillDelay,
    });
  }, [updateState]);
};

const useOnSubmitSwap = () => {
  const { updateState, state, srcToken, dstToken } = useTwapContext();
  const outAmount = useOutAmount().outAmountUi;
  const srcAmountUsd = useSrcAmountUsdUi();
  const dstAmountUsd = useDstAmountUsdUi();

  return useCallback(() => {
    if (!srcToken || !dstToken) return;
    updateState({ swapState: "loading", swapData: { srcAmount: state.srcAmountUi, outAmount, srcToken: srcToken, dstToken: dstToken, srcAmountUsd, dstAmountUsd } });
  }, [updateState, outAmount, srcToken, dstToken, state.srcAmountUi, srcAmountUsd, dstAmountUsd]);
};

// Hook for setting custom fill delay
const useSetCustomFillDelay = () => {
  const { updateState } = useTwapContext();
  const setQueryParam = useSetQueryParams();
  return useCallback(
    (customFillDelay: Duration) => {
      setQueryParam(QUERY_PARAMS.TRADE_INTERVAL, !customFillDelay.amount ? undefined : customFillDelay.amount?.toString());
      updateState({ customFillDelay });
    },
    [updateState, setQueryParam]
  );
};

const useSetCustomDuration = () => {
  const { updateState } = useTwapContext();
  const setQueryParam = useSetQueryParams();
  return useCallback(
    (customDuration?: Duration) => {
      setQueryParam(QUERY_PARAMS.MAX_DURATION, !customDuration ? undefined : customDuration.amount?.toString());
      updateState({ customDuration });
    },
    [updateState, setQueryParam]
  );
};

const useHandleDisclaimer = () => {
  const { updateState, state } = useTwapContext();
  return useCallback(() => {
    updateState({ disclaimerAccepted: !state.disclaimerAccepted });
  }, [updateState, state.disclaimerAccepted]);
};

// Hook for inverting limit price
const useInvertLimit = () => {
  const { state, updateState } = useTwapContext();
  const handleLimitPriceQueryParam = useHandleLimitPriceQueryParam();

  return useCallback(() => {
    handleLimitPriceQueryParam();
    updateState({
      isInvertedLimitPrice: !state.isInvertedLimitPrice,
      customLimitPrice: undefined,
      isCustomLimitPrice: false,
      limitPricePercent: undefined,
    });
  }, [state.isInvertedLimitPrice, updateState, handleLimitPriceQueryParam]);
};

// Hook for handling limit change
const useOnLimitChange = () => {
  const { state, updateState } = useTwapContext();
  const handleLimitPriceQueryParam = useHandleLimitPriceQueryParam();
  return useCallback(
    (customLimitPrice: string, limitPricePercent?: string) => {
      handleLimitPriceQueryParam(customLimitPrice, state.isInvertedLimitPrice);
      updateState({
        customLimitPrice,
        isCustomLimitPrice: true,
        isMarketOrder: false,
        limitPricePercent,
      });
    },
    [state.isInvertedLimitPrice, updateState, handleLimitPriceQueryParam]
  );
};

// Hook for resetting custom limit
const useResetCustomLimit = () => {
  const { updateState } = useTwapContext();
  const handleLimitPriceQueryParam = useHandleLimitPriceQueryParam();
  return useCallback(() => {
    handleLimitPriceQueryParam();
    updateState({
      isCustomLimitPrice: false,
      customLimitPrice: undefined,
      limitPricePercent: undefined,
    });
  }, [updateState, handleLimitPriceQueryParam]);
};

// Hook for resetting limit price
const useResetLimitPrice = () => {
  const { updateState } = useTwapContext();

  return useCallback(() => {
    updateState({
      isCustomLimitPrice: false,
      customLimitPrice: undefined,
      limitPricePercent: undefined,
      isInvertedLimitPrice: false,
    });
  }, [updateState]);
};

// Hook for handling token switch
const useResetLimitAfterTokenSwitch = () => {
  const { updateState } = useTwapContext();
  const handleLimitPriceQueryParam = useHandleLimitPriceQueryParam();
  return useCallback(() => {
    handleLimitPriceQueryParam();
    updateState({
      isInvertedLimitPrice: false,
      limitPricePercent: undefined,
    });
  }, [updateState, handleLimitPriceQueryParam]);
};

// Hook for selecting orders tab
const useSelectOrdersTab = () => {
  const { updateState } = useTwapContext();

  return useCallback((value: number) => updateState({ selectedOrdersTab: value }), [updateState]);
};

// Hook for showing/hiding orders

const useOnTxHash = () => {
  const { updateState } = useTwapContext();

  const onCreateOrderTxHash = useCallback(
    (createOrdertxHash: string) => {
      updateState({ createOrdertxHash });
    },
    [updateState]
  );

  const onWrapTxHash = useCallback(
    (wrapTxHash: string) => {
      updateState({ wrapTxHash });
    },
    [updateState]
  );

  const onUnwrapTxHash = useCallback(
    (unwrapTxHash: string) => {
      updateState({ unwrapTxHash });
    },
    [updateState]
  );

  const onApproveTxHash = useCallback(
    (approveTxHash: string) => {
      updateState({ approveTxHash });
    },
    [updateState]
  );

  return {
    onCreateOrderTxHash,
    onWrapTxHash,
    onUnwrapTxHash,
    onApproveTxHash,
  };
};

const useUpdateSwapStep = () => {
  const { updateState } = useTwapContext();

  return useCallback(
    (swapStep: SwapStep) => {
      updateState({ swapStep });
    },
    [updateState]
  );
};

const useUpdateSwapState = () => {
  const { updateState } = useTwapContext();

  return useCallback(
    (swapState: SwapState) => {
      updateState({ swapState });
    },
    [updateState]
  );
};

export const useSetSrcAmount = () => {
  const { updateState, lib } = useTwapContext();
  const setQueryParam = useSetQueryParams();
  return useCallback(
    (srcAmountUi: string) => {
      setQueryParam(QUERY_PARAMS.INPUT_AMOUNT, !srcAmountUi ? undefined : srcAmountUi);
      if (!srcAmountUi) {
        resetQueryParams();
      } else {
        setQueryParam(QUERY_PARAMS.INPUT_AMOUNT, srcAmountUi);
      }
      updateState({
        srcAmountUi,
        customFillDelay: { resolution: TimeResolution.Minutes, amount: MIN_TRADE_INTERVAL_FORMATTED },
        customChunks: undefined,
      });
    },
    [updateState, lib, setQueryParam]
  );
};

const useOnLimitMarketSwitch = () => {
  const { updateState } = useTwapContext();
  return useCallback(
    (isMarketOrder: boolean) => {
      updateState({
        isMarketOrder,
      });
    },
    [updateState]
  );
};

const useOnOrderCreated = () => {
  const { updateState } = useTwapContext();

  return useCallback(() => {
    updateState({ swapState: "success", createOrderSuccess: true, selectedOrdersTab: 0 });
  }, [updateState]);
};

export const stateActions = {
  useSwapModalActions,
  useSwapReset,
  useSetCustomFillDelay,
  useInvertLimit,
  useOnLimitChange,
  useResetCustomLimit,
  useResetLimitPrice,
  useResetLimitAfterTokenSwitch,
  useSelectOrdersTab,
  useOnTxHash,
  useUpdateSwapStep,
  useUpdateSwapState,
  useSetSrcAmount,
  useHandleDisclaimer,
  useOnLimitMarketSwitch,
  useOnOrderCreated,
  useSetCustomDuration,
  useOnSubmitSwap,
};
