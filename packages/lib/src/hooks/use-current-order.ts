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
import { useFormatNumber } from "./helper-hooks";

const useFees = () => {
  const { fees } = useTwapContext();
  const { amountUI: dstAmount } = useDstTokenAmount();

  const amount = useMemo(() => {
    if (!fees || !dstAmount) return "";
    return BN(dstAmount).multipliedBy(fees).dividedBy(100).toFixed();
  }, [dstAmount]);

  return {
    amount: useFormatNumber({ value: amount }),
    percent: useFormatNumber({ value: fees }),
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
    [dstAmount, srcAmount],
  );

  return useFormatNumber({ value: price, decimalScale: 4 });
};

export const useCurrentOrderDetails = () => {
  const { srcToken, dstToken, account } = useTwapContext();
  const t = useTranslations();
  const { amountWei: srcAmountWei } = useSrcAmount();
  const dstMinAmountPerTrade = useDstMinAmountPerTrade().amountWei;
  const { totalTrades, amountPerTradeWei } = useTrades();
  const triggerPricePerChunk = useTriggerPrice().pricePerChunkWei;
  const { fillDelay } = useFillDelay();
  const deadline = useDeadline();
  const limitAmountPerChunk = useLimitPrice().amountWei;
  const { amount: feesAmount, percent: feesPercent } = useFees();
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
      },
      tradePrice: {
        label: t("tradePrice") || "",
        value: tradePrice,
        sellToken: srcToken,
        buyToken: dstToken,
      },
    };
  }, [order, feesPercent, feesAmount, t, tradePrice, srcToken, dstToken, srcAmountUsd, dstAmountUsd]);
};
