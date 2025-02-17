import { useCallback } from "react";
import { useUsdAmount } from "../hooks/useUsdAmounts";
import { useWidgetContext } from "./widget-context";
import { useBalanceWaning, useFeeOnTransferError } from "../hooks/useWarnings";
import { TimeUnit } from "@orbs-network/twap-sdk";
import { useConfirmationButton } from "../hooks/useConfirmationButton";
import { useSrcChunkAmountUSD } from "../hooks/useSrcChunkAmountUSD";
import { useFormatNumber } from "../hooks/useFormatNumber";
import { useAmountUi } from "../hooks/useParseAmounts";

export const useTokenPanel = (isSrcToken?: boolean) => {
  const { actions, twap, srcToken, dstToken, srcBalance, dstBalance } = useWidgetContext();
  const { srcUsd, dstUsd } = useUsdAmount();
  const balanceError = useBalanceWaning();

  const {
    values: { srcAmountUI, destTokenAmountUI },
  } = twap;
  const onTokenSelect = useCallback(
    (token: any) => {
      isSrcToken ? actions.onSrcTokenSelect?.(token) : actions.onDstTokenSelect?.(token);
    },
    [isSrcToken, actions.onSrcTokenSelect, actions.onDstTokenSelect],
  );

  const balance = useAmountUi(isSrcToken ? srcToken?.decimals : dstToken?.decimals, isSrcToken ? srcBalance : dstBalance);

  return {
    balance: balance,
    usd: isSrcToken ? srcUsd : dstUsd,
    token: isSrcToken ? srcToken : dstToken,
    onTokenSelect,
    inputValue: isSrcToken ? srcAmountUI : destTokenAmountUI,
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
    values: { chunks },
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
      values: { durationMilliseconds },
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
    selected: durationMilliseconds,
    onChange,
  };
};

export const useShowConfirmationButton = () => {
  return useConfirmationButton();
};

export const usePriceMode = () => {
  const { twap } = useWidgetContext();
  const {
    values: { isMarketOrder },
    actionHandlers: { setIsMarketPrice },
  } = twap;

  return {
    isMarketOrder,
    setIsMarketOrder: setIsMarketPrice,
  };
};

export const useMessage = () => {
  const { srcUsd1Token, twap, srcToken } = useWidgetContext();
  const srcChunksAmount = twap.values.srcChunksAmountUI;
  const srcChunkAmountUsd = useSrcChunkAmountUSD();
  const usd = useFormatNumber({ value: srcChunkAmountUsd, decimalScale: 2 });
  const chunkSizeF = useFormatNumber({ value: srcChunksAmount });
  const usdF = usd ? `($${usd})` : "";

  if (!srcUsd1Token || !srcToken) return null;

  return `${chunkSizeF} ${srcToken?.symbol} per trade ${usdF}`;
};

export const useLimitPricePanel = () => {
  const {
    twap: {
      limitPricePanel,
      values: { isMarketOrder },
    },
    translations: t,
    isLimitPanel,
  } = useWidgetContext();

  return {
    ...limitPricePanel,
    label: !isLimitPanel ? t.price : t.limitPrice,
    tooltip: isMarketOrder ? t.marketPriceTooltip : isLimitPanel ? t.limitPriceTooltipLimitPanel : t.limitPriceTooltip,
  };
};

export const useFillDelayPanel = () => {
  const {
    values: { fillDelay },
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
    state: { srcAmount },
  } = useWidgetContext();

  const { feeError } = useFeeOnTransferError();

  const balanceWarning = useBalanceWaning();

  const error = !srcAmount
    ? ""
    : errors.chunks?.text || errors.fillDelay?.text || errors.duration?.text || errors.tradeSize?.text || errors.limitPrice?.text || balanceWarning || feeError;

  return error;
};
