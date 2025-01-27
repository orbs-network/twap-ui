import { useMemo, useCallback } from "react";
import BN from "bignumber.js";
import { State, Token } from "../types";
import { DerivedSwapValues } from "./useDerivedValues";
import { TimeDuration } from "@orbs-network/twap-sdk";
import { toAmountUi } from "../utils";

type UpdateState = (value: Partial<State>) => void;

export const usePanels = (state: State, derivedValues: DerivedSwapValues, updateState: UpdateState) => {
  return {
    srcTokenInput: useSrcTokenInputPanel(state, updateState),
    desTokenInput: useDestTokenInputPanel(state, derivedValues, updateState),
    duration: useTradeDurationPanel(derivedValues, updateState),
    chunks: useChunksPanel(derivedValues, updateState),
    fillDelay: useFillDelayPanel(derivedValues, updateState),
    tradePrice: useTradePricePanel(state, derivedValues, updateState),
    priceToggle: usePriceTogglePanel(derivedValues, updateState),
  };
};

const useFillDelayPanel = (derivedValues: DerivedSwapValues, updateState: UpdateState) => {
  const { fillDelay } = derivedValues;

  const onChange = useCallback(
    (typedFillDelay: TimeDuration) => {
      updateState({ typedFillDelay });
    },
    [updateState],
  );

  return {
    fillDelay,
    onChange,
  };
};

const useTradeDurationPanel = (derivedValues: DerivedSwapValues, updateState: UpdateState) => {
  const onChange = useCallback(
    (typedDuration: TimeDuration) => {
      updateState({ typedDuration });
    },
    [updateState],
  );
  const { duration } = derivedValues;
  return {
    duration,
    milliseconds: duration.unit * duration.value,
    onChange,
  };
};

export const useChunksPanel = (derivedValues: DerivedSwapValues, updateState: UpdateState) => {
  const { chunks, maxPossibleChunks } = derivedValues;

  const onChange = useCallback(
    (typedChunks: number) => {
      updateState({ typedChunks });
    },
    [updateState],
  );

  return {
    chunks,
    onChange,
    maxPossibleChunks,
  };
};

export const useSrcTokenInputPanel = (state: State, updateState: UpdateState) => {
  const onChange = useCallback(
    (typedSrcAmount: string) => {
      updateState({ typedSrcAmount });
    },
    [updateState],
  );

  const onTokenSelect = useCallback(
    (srcToken: Token) => {
      updateState({ srcToken });
    },
    [updateState],
  );

  return {
    token: state.srcToken,
    inputValue: state.typedSrcAmount,
    onChange,
    onTokenSelect,
  };
};

export const useDestTokenInputPanel = (state: State, derivedValues: DerivedSwapValues, updateState: UpdateState) => {
  const onTokenSelect = useCallback(
    (srcToken: Token) => {
      updateState({ srcToken });
    },
    [updateState],
  );

  return {
    token: state.destToken,
    inputValue: derivedValues.destTokenAmountUI,
    onTokenSelect,
  };
};

export const useTradePricePanel = (state: State, derivedValues: DerivedSwapValues, updateState: UpdateState) => {
  const { priceUI, priceDiffFromMarket } = derivedValues;
  const { isInvertedLimitPrice, typedPrice, limitPricePercent, srcToken, destToken, marketPrice } = state;

  const onPercentClick = useCallback(
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
      let price = toAmountUi(state.destToken?.decimals, state.marketPrice);

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
    [state.destToken, state.isInvertedLimitPrice, state.marketPrice, updateState],
  );

  const value = useMemo(() => {
    if (typedPrice !== undefined) return typedPrice;

    if (isInvertedLimitPrice && priceUI) {
      return BN(1).div(priceUI).decimalPlaces(6).toString();
    }

    return BN(priceUI).decimalPlaces(6).toString();
  }, [typedPrice, priceUI, isInvertedLimitPrice]);

  const showReset = useMemo(() => {
    if (BN(priceDiffFromMarket).isZero()) return false;
    if (BN(limitPricePercent || 0).gt(0)) return false;
    return true;
  }, [priceDiffFromMarket, limitPricePercent]);

  const onReset = useCallback(() => onPercentClick("0"), [onPercentClick]);

  const onInputChange = useCallback(
    (typedPrice: string) => {
      updateState({ typedPrice });
    },
    [updateState],
  );

  const onInvertPrice = () => {
    return useCallback(() => {
      updateState({
        isInvertedLimitPrice: !state.isInvertedLimitPrice,
        typedPrice: undefined,
        limitPricePercent: undefined,
      });
    }, [updateState, state.isInvertedLimitPrice, state.typedPrice, state.limitPricePercent]);
  };

  return {
    onInputChange,
    onPercentClick,
    onReset,
    inputValue: value,
    isLoading: Boolean(srcToken && destToken && !marketPrice),
    inverted: isInvertedLimitPrice,
    onInvertPrice,
    showReset,
    selectedPercent: limitPricePercent,
    srcToken: isInvertedLimitPrice ? destToken : srcToken,
    destToken: isInvertedLimitPrice ? srcToken : destToken,
  };
};

const usePriceTogglePanel = (derivedSwapValues: DerivedSwapValues, updateState: UpdateState) => {
  const { isMarketOrder } = derivedSwapValues;

  const onChange = useCallback(
    (isMarketOrder: boolean) => {
      updateState({ isMarketOrder });
    },
    [updateState],
  );

  return {
    isMarketOrder,
    onChange,
  };
};
