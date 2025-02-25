import { useCallback, useMemo } from "react";
import { useUsdAmount } from "../hooks/useUsdAmounts";
import { useWidgetContext } from "./widget-context";
import { useBalanceWaning } from "../hooks/useWarnings";
import { amountUi, TimeUnit } from "@orbs-network/twap-sdk";
import { useConfirmationButton } from "../hooks/useConfirmationButton";
import { useSrcChunkAmountUSD } from "../hooks/useSrcChunkAmountUSD";
import { useFormatNumber } from "../hooks/useFormatNumber";
import { useAmountUi } from "../hooks/useParseAmounts";
import BN from "bignumber.js";

export const useTokenPanel = (isSrcToken?: boolean) => {
  const { actions, twap, srcToken, dstToken, srcBalance, dstBalance, state } = useWidgetContext();
  const { srcUsd, dstUsd } = useUsdAmount();
  const balanceError = useBalanceWaning();

  const {
    derivedState: { destTokenAmount },
  } = twap;
  const onTokenSelect = useCallback(
    (token: any) => {
      isSrcToken ? actions.onSrcTokenSelect?.(token) : actions.onDstTokenSelect?.(token);
    },
    [isSrcToken, actions.onSrcTokenSelect, actions.onDstTokenSelect],
  );
  const destTokenAmountUI = amountUi(dstToken?.decimals, destTokenAmount);
  const balance = useAmountUi(isSrcToken ? srcToken?.decimals : dstToken?.decimals, isSrcToken ? srcBalance : dstBalance);

  return {
    balance: balance,
    usd: isSrcToken ? srcUsd : dstUsd,
    token: isSrcToken ? srcToken : dstToken,
    onTokenSelect,
    inputValue: isSrcToken ? state.typedSrcAmount : destTokenAmountUI,
    error: !isSrcToken ? undefined : balanceError,
  };
};

export const useSwitchTokens = () => {
  const { actions } = useWidgetContext();

  return actions.onSwitchTokens;
};

export const useTradesAmountPanel = () => {
  const { twap, translations: t } = useWidgetContext();
  const {
    derivedState: { chunks },
    actionHandlers: { setChunks },
  } = useWidgetContext().twap;

  return {
    error: twap.errors.chunks?.text,
    chunks,
    setChunks,
    label: t.totalTrades,
    tooltip: t.totalTradesTooltip,
  };
};

export const useTradeDurationPanel = () => {
  const {
    twap: {
      derivedState: { orderDuration },
      actionHandlers: { setDuration },
    },
  } = useWidgetContext();

  const onChange = useCallback(
    (unit: TimeUnit) => {
      setDuration({ unit, value: 1 });
    },
    [setDuration],
  );

  return {
    selected: orderDuration.unit * orderDuration.value,
    onChange,
  };
};

export const useShowConfirmationButton = () => {
  return useConfirmationButton();
};

export const usePriceMode = () => {
  const { twap } = useWidgetContext();
  const {
    derivedState: { isMarketOrder },
    actionHandlers: { setIsMarketPrice },
  } = twap;

  return {
    isMarketOrder,
    setIsMarketOrder: setIsMarketPrice,
  };
};

export const useMessage = () => {
  const { srcUsd1Token, twap, srcToken } = useWidgetContext();
  const srcChunksAmount = useAmountUi(srcToken?.decimals, twap.derivedState.srcTokenChunkAmount);
  const srcChunkAmountUsd = useSrcChunkAmountUSD();
  const usd = useFormatNumber({ value: srcChunkAmountUsd, decimalScale: 2 });
  const chunkSizeF = useFormatNumber({ value: srcChunksAmount });
  const usdF = usd ? `($${usd})` : "";

  if (!srcUsd1Token || !srcToken) return null;

  return `${chunkSizeF} ${srcToken?.symbol} per trade ${usdF}`;
};

export const useFillDelayPanel = () => {
  const {
    derivedState: { fillDelay },
    actionHandlers: { setFillDelay },
    errors,
  } = useWidgetContext().twap;

  const onUnitSelect = useCallback(
    (unit: TimeUnit) => {
      setFillDelay({ unit, value: fillDelay.value });
    },
    [fillDelay.value, setFillDelay],
  );

  const onInputChange = useCallback(
    (v: string) => {
      setFillDelay({ unit: fillDelay.unit, value: Number(v) });
    },
    [fillDelay.unit, setFillDelay],
  );

  return {
    error: errors.fillDelay?.text,
    onInputChange,
    onUnitSelect,
    fillDelay,
  };
};

export const useError = () => {
  const {
    twap: { errors },
    state: { typedSrcAmount },
    marketPrice,
  } = useWidgetContext();

  const balanceWarning = useBalanceWaning();

  const error =
    BN(typedSrcAmount || 0).isZero() || BN(marketPrice || 0).isZero()
      ? ""
      : errors.chunks?.text || errors.fillDelay?.text || errors.orderDuration?.text || errors.tradeSize?.text || errors.limitPrice?.text || balanceWarning;

  return error;
};

const defaultPercent = [1, 5, 10];

export const useLimitPricePanel = () => {
  const { twap, translations: t, srcToken, dstToken, isLimitPanel, marketPrice } = useWidgetContext();
  const { derivedState, actionHandlers } = twap;
  const { isInvertedLimitPrice, typedLimitPrice, limitSelectedPercent, priceDiffFromMarket } = derivedState;
  const { onLimitPriceReset, onLimitPricePercent } = actionHandlers;
  const limitPriceUI = useAmountUi(dstToken?.decimals, derivedState.limitPrice);

  const limitPrice = useMemo(() => {
    if (typedLimitPrice !== undefined) return typedLimitPrice;
    if (isInvertedLimitPrice && limitPriceUI) {
      return BN(1).div(limitPriceUI).decimalPlaces(6).toString();
    }

    return BN(limitPriceUI).decimalPlaces(6).toString();
  }, [typedLimitPrice, limitPriceUI, isInvertedLimitPrice]);

  const isSelectedPercentCallback = useCallback(
    (percent: number) => {
      const p = limitSelectedPercent || limitSelectedPercent;
      if (BN(limitPrice || 0).isZero()) return false;
      return BN(p || 0).eq(percent);
    },
    [limitSelectedPercent, limitPrice, priceDiffFromMarket],
  );

  const percentList = useMemo(() => {
    if (isInvertedLimitPrice) {
      return defaultPercent.map((it) => -it).map((it) => it.toString());
    } else {
      return defaultPercent.map((it) => it.toString());
    }
  }, [isInvertedLimitPrice]);

  const resetButton = useMemo(() => {
    let text = "";
    let selected = false;
    let isReset = false;
    if (BN(priceDiffFromMarket).isZero() || percentList.includes(priceDiffFromMarket) || limitSelectedPercent) {
      text = "0%";
    } else {
      text = `${priceDiffFromMarket}%`;
      selected = true;
      isReset = true;
    }

    return {
      text,
      selected,
      onClick: onLimitPriceReset,
      isReset,
    };
  }, [limitSelectedPercent, priceDiffFromMarket, onLimitPriceReset, percentList]);

  const percentButtons = useMemo(() => {
    const buttons = percentList.map((percent) => {
      return {
        text: `${BN(percent || 0).isZero() ? "" : isInvertedLimitPrice ? "-" : !isInvertedLimitPrice && "+"} ${Math.abs(Number(percent))} %`,
        selected: isSelectedPercentCallback(Number(percent)),
        onClick: () => onLimitPricePercent(percent),
        isReset: false,
      };
    });

    return [resetButton, ...buttons];
  }, [percentList, isSelectedPercentCallback, onLimitPricePercent, isInvertedLimitPrice, resetButton]);
  const isMarketOrder = derivedState.isMarketOrder;
  return {
    setLimitPrice: actionHandlers.onLimitPriceChange,
    onLimitPricePercent: actionHandlers.onLimitPricePercent,
    onLimitPriceReset: actionHandlers.onLimitPriceReset,
    onInvertLimitPrice: actionHandlers.onInvertLimitPrice,
    isSelectedPercentCallback,
    limitPrice,
    isLoading: Boolean(srcToken && dstToken && BN(marketPrice || 0).isZero()),
    isInvertedLimitPrice: derivedState.isInvertedLimitPrice,
    limitPricePercent: derivedState.limitSelectedPercent,
    srcToken: derivedState.isInvertedLimitPrice ? dstToken : srcToken,
    destToken: derivedState.isInvertedLimitPrice ? srcToken : dstToken,
    priceDiffFromMarket: derivedState.priceDiffFromMarket,
    percentButtons,
    isMarketOrder,
    isCustom: derivedState.typedLimitPrice !== undefined,
    label: !isLimitPanel ? t.price : t.limitPrice,
    tooltip: isMarketOrder ? t.marketPriceTooltip : isLimitPanel ? t.limitPriceTooltipLimitPanel : t.limitPriceTooltip,
    error: twap.errors.limitPrice?.text,
  };
};
