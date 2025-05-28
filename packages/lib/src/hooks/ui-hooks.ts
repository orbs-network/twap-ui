import { amountUi, Config, TimeUnit } from "@orbs-network/twap-sdk";
import { useCallback, useMemo, useState } from "react";
import { useTwapContext } from "../context";
import {
  useAmountUi,
  useDestTokenAmount,
  useFillDelay,
  useLimitPrice,
  usePriceDiffFromMarketPercent,
  useShouldWrapOrUnwrapOnly,
  useSrcChunkAmountUSD,
  useSrcTokenChunkAmount,
  useUsdAmount,
} from "./logic-hooks";
import BN from "bignumber.js";
import { useFormatNumber } from "./useFormatNumber";
import { useSubmitOrderCallback } from "./send-transactions-hooks";
import { SwapStatus } from "@orbs-network/swap-ui";
import { useOrders } from "./order-hooks";
import { useTwapStore } from "../useTwapStore";
import { formatDecimals } from "../utils";

const defaultPercent = [1, 5, 10];

const useDerivedLimitPrice = () => {
  const { amountUI: limitPriceUI } = useLimitPrice();
  const typedPrice = useTwapStore((s) => s.state.typedPrice);
  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);

  const result = useMemo(() => {
    if (typedPrice !== undefined) return typedPrice;
    if (isInvertedPrice && limitPriceUI) {
      return BN(formatDecimals(BN(1).div(limitPriceUI).toFixed())).toFixed();
    }

    return !limitPriceUI ? "" : BN(formatDecimals(limitPriceUI)).toFixed();
  }, [typedPrice, limitPriceUI, isInvertedPrice]);
  return result;
};
const useLimitPriceLoading = () => {
  const { srcToken, dstToken, marketPrice } = useTwapContext();
  return Boolean(srcToken && dstToken && BN(marketPrice || 0).isZero());
};

export const useLimitPriceTokenSelect = () => {
  const { callbacks } = useTwapContext();

  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);

  const bottomTokenSelect = useCallback(
    (token: any) => {
      if (isInvertedPrice) {
        callbacks?.onSrcTokenSelect?.(token);
      } else {
        callbacks?.onDstTokenSelect?.(token);
      }
    },
    [isInvertedPrice, callbacks?.onDstTokenSelect, callbacks?.onSrcTokenSelect],
  );

  const topTokenSelect = useCallback(
    (token: any) => {
      if (isInvertedPrice) {
        callbacks?.onDstTokenSelect?.(token);
      } else {
        callbacks?.onSrcTokenSelect?.(token);
      }
    },
    [isInvertedPrice, callbacks?.onDstTokenSelect, callbacks?.onSrcTokenSelect],
  );

  return {
    bottomTokenSelect,
    topTokenSelect,
  };
};

export const useLimitPriceInput = () => {
  const { onChange: onLimitPriceChange } = useLimitPrice();
  const updateState = useTwapStore((s) => s.updateState);

  const onChange = useCallback(
    (value: string) => {
      onLimitPriceChange(value);
      updateState({ selectedPricePercent: undefined });
    },
    [onLimitPriceChange, updateState],
  );

  return {
    value: useDerivedLimitPrice(),
    onChange,
    isLoading: useLimitPriceLoading(),
  };
};

export const useLimitPricePercentSelect = () => {
  const { dstToken, marketPrice } = useTwapContext();
  const isLoading = useLimitPriceLoading();
  const { onChange: onPriceChange, amountUI: limitPrice } = useLimitPrice();
  const priceDiffFromMarket = usePriceDiffFromMarketPercent();

  const updateState = useTwapStore((s) => s.updateState);
  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);
  const selectedPricePercent = useTwapStore((s) => s.state.selectedPricePercent);

  const onPercent = useCallback(
    (percent?: string) => {
      if (isLoading) return;
      updateState({ selectedPricePercent: percent });

      if (!percent || BN(percent).isZero()) {
        onPriceChange(undefined);
        return;
      }

      const multiplier = BN(percent).div(100).plus(1);
      let basePrice = amountUi(dstToken?.decimals, marketPrice);

      if (isInvertedPrice && basePrice) {
        basePrice = formatDecimals(BN(1).div(basePrice).toFixed());
      }

      const computedPrice = formatDecimals(
        BN(basePrice || 0)
          .times(multiplier)
          .toFixed(),
      );
      onPriceChange(computedPrice);
    },
    [updateState, dstToken, marketPrice, isInvertedPrice, onPriceChange, isLoading],
  );

  const options = useMemo(() => {
    if (isInvertedPrice) {
      return defaultPercent.map((it) => -it).map((it) => it.toString());
    } else {
      return defaultPercent.map((it) => it.toString());
    }
  }, [isInvertedPrice]);

  const { buttons, isReset } = useMemo(() => {
    const isSelected = (percent: number) => (BN(limitPrice || 0).isZero() ? false : BN(selectedPricePercent || 0).eq(percent));
    const isReset = !BN(priceDiffFromMarket).isZero() && !options.includes(priceDiffFromMarket) && !selectedPricePercent;
    const prefix = BN(priceDiffFromMarket).gt(0) ? "+" : "";

    const resetButton = {
      text: isReset ? `${prefix}${priceDiffFromMarket}%` : "0%",
      selected: isReset || !selectedPricePercent ? true : false,
      onClick: () => onPercent("0"),
      isReset,
    };
    const buttons = options.map((option) => {
      return {
        text: `${BN(option || 0).isZero() ? "" : isInvertedPrice ? "-" : !isInvertedPrice && "+"} ${Math.abs(Number(option))} %`,
        selected: isSelected(Number(option)),
        onClick: () => onPercent(option),
        isReset: false,
      };
    });

    return {
      buttons: [resetButton, ...buttons],
      isReset,
    };
  }, [options, onPercent, limitPrice, selectedPricePercent, isInvertedPrice, priceDiffFromMarket]);

  return {
    onPercent,
    buttons,
    selected: selectedPricePercent,
    isReset,
  };
};

export const useLimitPriceOnInvert = () => {
  const updateState = useTwapStore((s) => s.updateState);
  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);
  return useCallback(() => {
    updateState({
      isInvertedPrice: !isInvertedPrice,
      typedPrice: undefined,
      selectedPricePercent: undefined,
    });
  }, [updateState, isInvertedPrice]);
};

export const useLimitPriceTokens = () => {
  const { srcToken, dstToken } = useTwapContext();
  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);
  return {
    topToken: isInvertedPrice ? dstToken : srcToken,
    bottomToken: isInvertedPrice ? srcToken : dstToken,
  };
};

export const useLimitPriceError = () => {
  const { error } = useLimitPrice();
  return error;
};

export const useLimitPanelUsd = () => {
  const { srcUsd1Token, dstUsd1Token } = useTwapContext();
  const { value: limitPrice } = useLimitPriceInput();
  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);

  return useUsdAmount(limitPrice, isInvertedPrice ? srcUsd1Token : dstUsd1Token);
};

export const useLimitPricePanel = () => {
  const tokens = useLimitPriceTokens();
  const error = useLimitPriceError();
  const input = useLimitPriceInput();
  const percent = useLimitPricePercentSelect();
  const onInvert = useLimitPriceOnInvert();
  const tokenSelect = useLimitPriceTokenSelect();
  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const usd = useLimitPanelUsd();

  return {
    tokens,
    error,
    input,
    percent,
    onInvert,
    isInverted: isInvertedPrice,
    tokenSelect,
    usd,
    isLimitOrder: !isMarketOrder,
    hide: isMarketOrder,
  };
};

export const useTokenSelect = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const { callbacks } = useTwapContext();
  return useCallback(
    (token: any) => {
      isSrcToken ? callbacks?.onSrcTokenSelect?.(token) : callbacks?.onDstTokenSelect?.(token);
    },
    [isSrcToken, callbacks?.onSrcTokenSelect, callbacks?.onDstTokenSelect],
  );
};

export const useSwitchTokensCallback = () => {
  return useTwapContext().callbacks?.onSwitchTokens;
};

export const usePriceDisplay = (type: "limit" | "market") => {
  const [inverted, setInverted] = useState(false);
  const { marketPrice, dstToken, srcToken } = useTwapContext();
  const limitPriceUI = useLimitPrice().amountUI;
  const marketPriceUI = useAmountUi(dstToken?.decimals, marketPrice);

  const onInvert = useCallback(() => {
    setInverted(!inverted);
  }, [inverted]);

  const price = useMemo(() => {
    const price = type === "limit" ? limitPriceUI : marketPriceUI;

    if (inverted) return BN(1).div(price).toString();
    return price;
  }, [inverted, limitPriceUI, marketPriceUI]);

  return {
    onInvert,
    price,
    leftToken: !inverted ? srcToken : dstToken,
    rightToken: !inverted ? dstToken : srcToken,
  };
};

export const useChunkSizeMessage = () => {
  const { srcUsd1Token, srcToken } = useTwapContext();
  const srcTokenChunkAmountUI = useSrcTokenChunkAmount().amountUI;
  const srcChunkAmountUsd = useSrcChunkAmountUSD();
  const usd = useFormatNumber({ value: srcChunkAmountUsd, decimalScale: 2 });
  const chunkSizeF = useFormatNumber({ value: srcTokenChunkAmountUI });
  const usdF = usd ? `($${usd})` : "";

  if (!srcUsd1Token || !srcToken) return null;

  return `${chunkSizeF} ${srcToken?.symbol} per trade ${usdF}`;
};

export const usePriceToggle = () => {
  const updateState = useTwapStore((s) => s.updateState);
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);

  const setIsMarketOrder = useCallback(
    (value: boolean) => {
      updateState({ isMarketOrder: value });
    },
    [updateState],
  );

  return {
    isMarketOrder,
    setIsMarketOrder,
  };
};

export const useFillDelayPanel = () => {
  const { setFillDelay, fillDelay, milliseconds, error } = useFillDelay();
  const { translations: t } = useTwapContext();

  const onInputChange = useCallback(
    (value: string) => {
      setFillDelay({ unit: fillDelay.unit, value: Number(value) });
    },
    [setFillDelay, fillDelay],
  );

  const onUnitSelect = useCallback(
    (unit: TimeUnit) => {
      setFillDelay({ unit, value: fillDelay.value });
    },
    [setFillDelay, fillDelay],
  );

  return {
    onInputChange,
    onUnitSelect,
    setFillDelay,
    milliseconds,
    fillDelay,
    error,
    title: t.tradeIntervalTitle,
    tooltip: t.tradeIntervalTootlip,
  };
};

export const useConfirmationModalButton = () => {
  const { mutate: onSubmit, isLoading: mutationLoading } = useSubmitOrderCallback();
  const { translations: t } = useTwapContext();
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const disclaimerAccepted = useTwapStore((s) => s.state.disclaimerAccepted);

  return useMemo(() => {
    const isLoading = mutationLoading || swapStatus === SwapStatus.LOADING;
    return {
      text: t.confirmOrder,
      onSubmit,
      isLoading,
      disabled: !disclaimerAccepted || isLoading,
    };
  }, [t, onSubmit, disclaimerAccepted, mutationLoading, swapStatus]);
};

export const useFee = () => {
  const { fee } = useTwapContext();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const destTokenAmount = useDestTokenAmount().amountUI;

  const amountUI = useMemo(() => {
    if (!fee || !destTokenAmount) return "";
    return BN(destTokenAmount).multipliedBy(fee).dividedBy(100).toFixed();
  }, [fee, destTokenAmount, isMarketOrder]);

  return {
    amountUI,
    percent: fee,
  };
};

export const useLimitPriceMessage = () => {
  const { translations: t } = useTwapContext();
  const hide = useShouldWrapOrUnwrapOnly();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  return useMemo(() => {
    if (isMarketOrder || hide) return null;

    return {
      text: t.limitPriceMessage,
      url: "https://www.orbs.com/dtwap-and-dlimit-faq/",
    };
  }, [t, isMarketOrder, hide]);
};

export const useUserOrders = (config: Config) => {
  return useOrders(config);
};
