import { Order, Status, TokenData, TWAPLib } from "@orbs-network/twap";
import BN from "bignumber.js";
import _ from "lodash";
import moment from "moment";
import { OrderCreated } from "./types";
import { amountUi, getTheGraphUrl } from "./utils";
import { networks } from "./web3-candies/networks";

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

export const getUserOrders = async (maker: string, chainId: number, signal?: AbortSignal) => {
  const LIMIT = 1_000;
  let page = 0;
  const orders: OrderCreated[] = [];

  const getOrders = async () => {
    const query = `{
        orderCreateds(first: ${LIMIT}, orderBy: timestamp, skip: ${page * LIMIT},  where:{maker: "${maker}"}) {
            id
            Contract_id
            ask_bidDelay
            ask_data
            ask_deadline
            ask_dstMinAmount
            ask_dstToken
            ask_fillDelay
            ask_exchange
            ask_srcToken
            ask_srcBidAmount
            ask_srcAmount
            blockNumber
            blockTimestamp
            dex
            dollarValueIn
            dstTokenSymbol
            exchange
            maker
            srcTokenSymbol
            timestamp
            transactionHash
        }
    }`;
    const endpoint = getTheGraphUrl(chainId);
    if (!endpoint) {
      throw new Error("Unsupported chainId");
    }
    const payload = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ query }),
      signal,
    });
    const response = await payload.json();
    const orderCreateds = response.data.orderCreateds;
    orders.push(...orderCreateds);
    if (orderCreateds.length >= LIMIT) {
      page++;
      await getOrders();
    } else {
      return orders;
    }
  };
  return getOrders();
};

export const getOrderFills = async (maker: string, chainId: number, signal?: AbortSignal) => {
  const LIMIT = 1_000;
  let page = 0;
  let fills: any = [];

  const fetchFills = async () => {
    const query = `
    {
      orderFilleds(first: ${LIMIT}, orderBy: timestamp, skip: ${page * LIMIT}, where: { userAddress: "${maker}" }) {
        id
        dstAmountOut
        dstFee
        srcFilledAmount
        TWAP_id
        srcAmountIn
        timestamp
        dollarValueIn
        dollarValueOut
      }
    }
  `;
    const endpoint = getTheGraphUrl(chainId);
    if (!endpoint) {
      throw new Error("Unsupported chainId");
    }
    const payload = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ query }),
      signal,
    });
    const response = await payload.json();
    const orderFilleds = response.data.orderFilleds;

    const grouped = _.map(_.groupBy(orderFilleds, "TWAP_id"), (fills, orderId) => ({
      TWAP_id: Number(orderId),
      dstAmountOut: fills.reduce((acc, it) => acc.plus(BN(it.dstAmountOut)), BN(0)).toString(),
      srcAmountIn: fills.reduce((acc, it) => acc.plus(BN(it.srcAmountIn)), BN(0)).toString(),
      dollarValueIn: fills.reduce((acc, it) => acc.plus(BN(it.dollarValueIn)), BN(0)).toString(),
      dollarValueOut: fills.reduce((acc, it) => acc.plus(BN(it.dollarValueOut)), BN(0)).toString(),
    }));

    fills.push(...grouped);

    if (orderFilleds.length >= LIMIT) {
      page++;
      await fetchFills();
    } else {
      return fills;
    }
  };

  await fetchFills();

  const res = _.mapValues(_.keyBy(fills, "TWAP_id"));
  return res;
};
