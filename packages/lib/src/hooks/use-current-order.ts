import { useTwapContext } from "../context/twap-context";
import { useDeadline } from "./use-deadline";
import { useDstMinAmountPerTrade, useDstTokenAmount } from "./use-dst-amount";
import { useFillDelay } from "./use-fill-delay";
import { useLimitPrice } from "./use-limit-price";
import { useBaseOrder } from "./use-base-order";
import { useSrcAmount } from "./use-src-amount";
import { useTrades } from "./use-trades";
import { useTriggerPrice } from "./use-trigger-price";
import { useMemo } from "react";
import BN from "bignumber.js";
import { useAmountsUsd } from "./use-amounts-usd";
import { useTranslations } from "./use-translations";
import { useFormatNumber, useUsdAmount } from "./helper-hooks";

const useFees = () => {
  const { fees, dstUsd1Token } = useTwapContext();
  const { amountUI: dstAmount } = useDstTokenAmount();

  const amount = useMemo(() => {
    if (!fees || !dstAmount) return "";
    return BN(dstAmount).multipliedBy(fees).dividedBy(100).toFixed();
  }, [dstAmount]);

  return {
    amount: useFormatNumber({ value: amount }),
    percent: useFormatNumber({ value: fees }),
    usd: useUsdAmount(amount, dstUsd1Token),
  };
};

const usePrice = () => {
  const srcAmount = useSrcAmount().amountUI;
  const dstAmount = useDstTokenAmount().amountUI;

  const price = useMemo(
    () =>
      BN(dstAmount || 0)
        .dividedBy(srcAmount || 0)
        .toString(),
    [dstAmount, srcAmount]
  );

  return useFormatNumber({ value: price, decimalScale: 4 });
};

export const useCurrentOrderDetails = () => {
  const { srcToken, dstToken, account } = useTwapContext();
  const t = useTranslations();
  const { amountWei: srcAmountWei } = useSrcAmount();
  const {amountWei: dstMinAmountPerTrade, usd: dstMinAmountPerTradeUsd} = useDstMinAmountPerTrade();
  const { totalTrades, amountPerTradeWei } = useTrades();
  const { amountWei: triggerPricePerChunk, usd: triggerPricePerChunkUsd } = useTriggerPrice();
  const { fillDelay } = useFillDelay();
  const deadline = useDeadline();
  const { amountWei: limitAmountPerChunk } = useLimitPrice();
  const { amount: feesAmount, percent: feesPercent, usd: feesUsd } = useFees();
  const tradePrice = useFormatNumber({ value: usePrice(), decimalScale: 4 });
  const { srcAmountUsd, dstAmountUsd } = useAmountsUsd();
  const order = useBaseOrder({
    srcToken,
    dstToken,
    srcAmount: srcAmountWei,
    minDestAmountPerTrade: dstMinAmountPerTrade,
    totalTrades: totalTrades,
    triggerPricePerTrade: triggerPricePerChunk,
    deadline: deadline,
    srcAmountPerTrade: amountPerTradeWei,
    maker: account,
    tradeInterval: fillDelay.unit * fillDelay.value,
    limitPrice: limitAmountPerChunk,
  });

  return useMemo(() => {
    return {
      ...order,
      srcAmountUsd,
      dstAmountUsd,
      fee: {
        label: t("fees", { value: `${feesPercent}%` }),
        value: feesAmount,
        usd: feesUsd,
      },
      display: {
        ...order.display,
        minDestAmountPerTrade: {
          ...order.display.minDestAmountPerTrade,
          usd: dstMinAmountPerTradeUsd,
        },
        triggerPricePerTrade: {
          ...order.display.triggerPricePerTrade,
          usd: triggerPricePerChunkUsd,
        },
      },
    };
  }, [order, feesPercent, feesAmount, t, tradePrice, srcToken, dstToken, srcAmountUsd, dstAmountUsd, dstMinAmountPerTradeUsd, triggerPricePerChunkUsd, feesUsd]);
};
