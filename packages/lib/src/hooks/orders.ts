import moment from "moment";
import { useMemo } from "react";
import { useTwapContext } from "../context/context";
import { HistoryOrder } from "../types";
import { amountUiV2, flatMap, flatMapObject } from "../utils";
import BN from "bignumber.js";
import { query } from "./query";
import { useEstimatedDelayBetweenChunksMillis } from "./hooks";

export const useParseOrderUi = (order?: HistoryOrder) => {
  const config = useTwapContext()?.config;
  const estimatedDelayBetweenChunksMillis = useEstimatedDelayBetweenChunksMillis();

  return useMemo(() => {
    if (!config || !order) return;
    const { srcToken, dstToken, srcAmount, srcBidAmount, dstMinAmount, srcFilledAmount, fillDelay, createdAt, deadline, dollarValueOut, progress } = order;
    if (!srcToken || !dstToken) return;
    const isMarketOrder = BN(dstMinAmount || 0).lte(1);
    const srcChunkAmountUi = amountUiV2(srcToken.decimals, srcBidAmount) || "0";
    const dstMinAmountOutUi = amountUiV2(dstToken.decimals, dstMinAmount) || "0";
    const dstAmount = amountUiV2(dstToken.decimals, order.dstAmount) || "0";
    const srcFilledAmountUi = amountUiV2(srcToken.decimals, srcFilledAmount) || "0";
    const totalChunks = order.totalChunks || 0;

    return {
      id: order.id,
      createdAt,
      createdAtUi: moment(createdAt * 1000).format("ll HH:mm"),
      deadlineUi: moment(deadline * 1000).format("ll HH:mm"),
      isMarketOrder,
      srcAmountUi: amountUiV2(srcToken.decimals, srcAmount) || "0",
      srcAmountUsdUi: order.dollarValueIn || "0",
      srcChunkAmountUi,
      srcFilledAmountUi,
      dstMinAmountOutUi,
      fillDelay: (fillDelay || 0) * 1000 + estimatedDelayBetweenChunksMillis,
      deadline: deadline * 1000,
      prefix: isMarketOrder ? "~" : "~",
      dstAmount,
      dstAmountUsd: dollarValueOut || "0",
      progress,
      srcToken,
      dstToken,
      totalChunks,
      status: order.status,
      txHash: order.txHash,
      limitPrice: isMarketOrder ? undefined : BN(dstMinAmountOutUi).div(srcChunkAmountUi).toString() || "0",
      excecutionPrice: BN(dstAmount).gt(0) && BN(srcFilledAmountUi).gt(0) ? BN(dstAmount).div(srcFilledAmountUi).toString() : undefined,
    };
  }, [config, order, estimatedDelayBetweenChunksMillis]);
};

export const useOrderById = (id?: number) => {
  const { data } = query.useOrdersHistory();

  const order = useMemo(() => {
    if (!data) return;
    return Object.keys(data)
      .flatMap((key) => data[key as keyof typeof data])
      .find((it: any) => it.id === id);
  }, [data, id]);

  return useParseOrderUi(order);
};
