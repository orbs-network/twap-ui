import moment from "moment";
import { useMemo } from "react";
import { useTwapContext } from "../context/context";
import { HistoryOrder } from "../types";
import { amountUiV2, flatMap, flatMapObject } from "../utils";
import BN from "bignumber.js";
import { query } from "./query";
import { useEstimatedDelayBetweenChunksMillis, useGetTokenFromParsedTokensList } from "./hooks";

export const useParseOrderUi = (order?: HistoryOrder) => {
  const { config, useParsedToken } = useTwapContext();
  const estimatedDelayBetweenChunksMillis = useEstimatedDelayBetweenChunksMillis();
  const getTokensFromTokensList = useGetTokenFromParsedTokensList();
  const srcTokenFromHook = useParsedToken?.(order?.srcTokenAddress);
  const dstTokenFromHook = useParsedToken?.(order?.dstTokenAddress);

  return useMemo(() => {
    if (!config || !order) return;
    const { srcAmount, srcBidAmount, dstMinAmount, srcFilledAmount, fillDelay, createdAt, deadline, dollarValueOut, progress } = order;
    const srcToken = srcTokenFromHook || getTokensFromTokensList(order.srcTokenAddress);
    const dstToken = dstTokenFromHook || getTokensFromTokensList(order.dstTokenAddress);
    const isMarketOrder = BN(dstMinAmount || 0).lte(1);
    const srcChunkAmountUi = !srcToken ? "" : amountUiV2(srcToken.decimals, srcBidAmount) || "";
    const dstMinAmountOutUi = !dstToken ? "" : amountUiV2(dstToken.decimals, dstMinAmount) || "0";
    const dstAmount = !dstToken ? "" : amountUiV2(dstToken.decimals, order.dstAmount) || "0";
    const srcFilledAmountUi = !srcToken ? "" : amountUiV2(srcToken.decimals, srcFilledAmount) || "0";
    const totalChunks = order.totalChunks || 0;

    return {
      id: order.id,
      createdAt,
      createdAtUi: moment(createdAt * 1000).format("ll HH:mm"),
      deadlineUi: moment(deadline * 1000).format("ll HH:mm"),
      isMarketOrder,
      srcAmountUi: !srcToken ? "" : amountUiV2(srcToken.decimals, srcAmount) || "0",
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
      isLoading: !srcToken || !dstToken,
    };
  }, [config, order, estimatedDelayBetweenChunksMillis, getTokensFromTokensList, srcTokenFromHook, dstTokenFromHook]);
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
