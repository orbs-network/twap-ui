import { networks } from "@defi.org/web3-candies";
import { Order, Status, TokenData, TWAPLib } from "@orbs-network/twap";
import BN from "bignumber.js";
import moment from "moment";
import { amountUi } from "./utils";

export const parseOrder = ({
  order,
  dstAmount,
  srcFilled,
  lib,
  srcToken,
  dstToken,
}: {
  order: Order;
  dstAmount?: string;
  srcFilled?: string;
  lib: TWAPLib;
  srcToken?: TokenData;
  dstToken?: TokenData;
}) => {
  const isBsc = lib?.config.chainId === networks.bsc.id;
  const srcAmountIn = order.ask.srcAmount;
  const bscProgress =
    !srcFilled || !srcAmountIn
      ? 0
      : BN(srcFilled || "0")
          .dividedBy(srcAmountIn || "0")
          .toNumber();
  const _progress = lib?.config.chainId === networks.bsc.id ? bscProgress : lib!.orderProgress(order);
  const progress = !_progress ? 0 : _progress < 0.99 ? _progress * 100 : 100;
  const status = () => {
    if (progress === 100) return Status.Completed;
    if (lib?.config.chainId === networks.bsc.id) {
      // Temporary fix to show open order until the graph is synced.
      if ((order.status === 2 && progress < 100) || order.status > Date.now() / 1000) return Status.Open;
    }
    return lib!.status(order);
  };
  const srcFilledAmount = isBsc ? srcFilled : order.srcFilledAmount;

  return {
    order,
    totalChunks: order.ask.srcAmount.div(order.ask.srcBidAmount).integerValue(BN.ROUND_CEIL).toNumber(),
    status: status(),
    srcToken,
    dstToken,
    srcFilledAmount: srcFilled,
    isMarketOrder: lib.isMarketOrder(order),
    srcAmountUi: amountUi(srcToken, order.ask.srcAmount),
    srcChunkAmountUi: amountUi(srcToken, order.ask.srcBidAmount),
    srcFilledAmountUi: amountUi(srcToken, BN(srcFilledAmount || "0")),
    dstMinAmountOutUi: amountUi(dstToken, order.ask.dstMinAmount),
    fillDelay: order.ask.fillDelay * 1000 + lib.estimatedDelayBetweenChunksMillis(),
    createdAtUi: moment(order.time * 1000).format("ll HH:mm"),
    deadlineUi: moment(order.ask.deadline * 1000).format("ll HH:mm"),
    prefix: "~",
    progress,
    dstAmount,
  };
};

export type ParsedOrder = ReturnType<typeof parseOrder>;
