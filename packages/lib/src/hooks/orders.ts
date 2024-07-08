import moment from "moment";
import { useMemo } from "react";
import { useTwapContext } from "../context/context";
import { HistoryOrder } from "../types";
import { amountUiV2 } from "../utils";
import BN from "bignumber.js";
import { query } from "./query";
import _ from "lodash";

export const useParseOrderUi = (order?: HistoryOrder) => {
  const lib = useTwapContext()?.lib;

  return useMemo(() => {
    if (!lib || !order) return;
    const { srcToken, dstToken, srcAmount, srcBidAmount, dstMinAmount, srcFilledAmount, fillDelay, createdAt, deadline, dollarValueOut, progress } = order;
    if (!srcToken || !dstToken) return;
    const isMarketOrder = BN(dstMinAmount || 0).lte(1);
    return {
      id: order.id,
      createdAt,
      createdAtUi: moment(createdAt * 1000).format("ll HH:mm"),
      deadlineUi: moment(deadline * 1000).format("ll HH:mm"),
      isMarketOrder,
      srcAmountUi: amountUiV2(srcToken.decimals, srcAmount),
      srcAmountUsdUi: order.dollarValueIn,
      srcChunkAmountUi: amountUiV2(srcToken.decimals, srcBidAmount),
      srcFilledAmountUi: amountUiV2(srcToken.decimals, srcFilledAmount),
      dstMinAmountOutUi: amountUiV2(dstToken.decimals, dstMinAmount),
      fillDelay: (fillDelay || 0) * 1000 + lib.estimatedDelayBetweenChunksMillis(),
      deadline: deadline * 1000,
      prefix: isMarketOrder ? "~" : "~",
      dstAmount: amountUiV2(dstToken.decimals, order.dstAmount),
      dstAmountUsd: dollarValueOut,
      progress,
      srcToken,
      dstToken,
      totalChunks: order.totalChunks,
      srcChunkAmountUsdUi: "0",
      dstMinAmountOutUsdUi: "",
      status: order.status,
      txHash: order.txHash,
    };
  }, [lib, order]);
};

export const useOrderById = (id?: number) => {
  const { data } = query.useOrdersHistory();

  const order = useMemo(() => {
    return _.flatMap(data).find((it) => it.id === id);
  }, [data, id]);

  return useParseOrderUi(order);
};
