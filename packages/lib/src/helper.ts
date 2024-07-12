import { Status, TWAPLib } from "@orbs-network/twap";
import BN from "bignumber.js";
import _ from "lodash";
import moment from "moment";
import { HistoryOrder } from "./types";
import { getTheGraphUrl, logger } from "./utils";

export type ParsedOrder = ReturnType<any>;

export const graphOrderFills = async ({ lib, endpoint, signal }: { lib: TWAPLib; endpoint: string; signal?: AbortSignal }) => {
  const LIMIT = 1_000;
  let page = 0;
  let fills: any = [];

  const fetchFills = async () => {
    const query = `
    {
      orderFilleds(first: ${LIMIT}, orderBy: timestamp, skip: ${page * LIMIT}, where: { userAddress: "${lib.maker}" }) {
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

const lensOrders = async (lib: TWAPLib): Promise<HistoryOrder[]> => {
  const orders = await lib.getAllOrders();

  return _.map(orders, (order): HistoryOrder => {
    let progress = lib.orderProgress(order);
    progress = !progress ? 0 : progress < 0.99 ? progress * 100 : 100;
    return {
      exchange: order.ask.exchange,
      id: order.id,
      deadline: order.ask.deadline,
      createdAt: moment(order.time).unix().valueOf(),
      srcAmount: order.ask.srcAmount.toString(),
      dstMinAmount: order.ask.dstMinAmount.toString(),
      status: progress === 100 ? Status.Completed : lib!.status(order),
      srcBidAmount: order.ask.srcBidAmount.toString(),
      fillDelay: order.ask.fillDelay,
      progress,
      totalChunks: order.ask.srcAmount
        .div(order.ask.srcBidAmount || 0)
        .integerValue(BN.ROUND_CEIL)
        .toNumber(),
      srcTokenAddress: order.ask.srcToken,
      dstTokenAddress: order.ask.dstToken,
    };
  });
};

const getStatus = (progress = 0, order: any, status?: any) => {
  status = status?.toLowerCase();

  if (progress === 100 || status === "completed") {
    return Status.Completed;
  }
  if (status === "canceled") {
    return Status.Canceled;
  }

  if (moment(Number(order.ask_deadline)).valueOf() > moment().valueOf() / 1000) {
    return Status.Open;
  }
  return Status.Expired;
};

export const getOrders = async (lib: TWAPLib, signal?: AbortSignal): Promise<HistoryOrder[]> => {
  const endpoint = getTheGraphUrl(lib.config.chainId);

  if (!endpoint) {
    return lensOrders(lib);
  }

  const args = { lib, endpoint, signal };
  const [orders, fills] = await Promise.all([graphOrders(args), graphOrderFills(args)]);

  const ids = orders.map((order: any) => order.Contract_id);
  let statuses: any = {};

  try {
    statuses = await getOrderStatuses(ids, endpoint, signal);
  } catch (error) {}

  return orders.map((order: any) => {
    const orderFill = fills[order.Contract_id];
    const progress = getProgress(orderFill?.srcAmountIn, order.ask_srcAmount);

    return {
      id: Number(order.Contract_id),
      exchange: order.exchange,
      dex: order.dex.toLowerCase(),
      deadline: Number(order.ask_deadline),
      createdAt: moment(order.timestamp).unix().valueOf(),
      srcAmount: order.ask_srcAmount,
      dstMinAmount: order.ask_dstMinAmount,
      status: getStatus(progress, order, statuses[order.Contract_id]),
      srcBidAmount: order.ask_srcBidAmount,
      fillDelay: order.ask_fillDelay,
      txHash: order.transactionHash,
      dstAmount: orderFill?.dstAmountOut,
      srcFilledAmount: orderFill?.srcAmountIn,
      dollarValueIn: orderFill?.dollarValueIn,
      dollarValueOut: orderFill?.dollarValueOut,
      progress,
      srcTokenAddress: order.ask_srcToken,
      dstTokenAddress: order.ask_dstToken,
      totalChunks: BN(order.ask_srcAmount || 0)
        .div(order.ask_srcBidAmount || 0)
        .integerValue(BN.ROUND_CEIL)
        .toNumber(),
    };
  });
};

const getProgress = (srcFilled?: string, srcAmountIn?: string) => {
  if (!srcFilled || !srcAmountIn) return 0;
  let progress = BN(srcFilled || "0")
    .dividedBy(srcAmountIn || "0")
    .toNumber();

  return !progress ? 0 : progress < 0.99 ? progress * 100 : 100;
};

const graphOrders = async ({ lib, endpoint, signal }: { lib: TWAPLib; endpoint: string; signal?: AbortSignal }) => {
  const LIMIT = 1_000;
  let page = 0;
  let orders: any = [];

  const fetchOrders = async () => {
    const query = `
    {
    orderCreateds(first: ${LIMIT}, orderBy: timestamp, skip: ${page * LIMIT}, where:{maker: "${lib.maker}"}) {
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
}
  `;

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
      await fetchOrders();
    } else {
      return orders;
    }
  };

  await fetchOrders();

  return orders;
};

const getOrderStatuses = async (ids: string[], endpoint: string, signal?: AbortSignal) => {
  const query = `
  {
      statuses(where:{id_in: [${ids.map((id) => `"${id}"`)}]}) {
        id
        status
      }
    }
    `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ query }),
      signal,
    });
    const payload = await response.json();

    return _.reduce(
      payload.data.statuses,
      (result, item) => {
        result[item.id] = item.status;
        return result;
      },
      {} as any
    );
  } catch (error) {}
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const waitForOrder = async (lib: TWAPLib, orderId: number) => {
  const maxRetries = 30,
    delayMs = 5_000;
  const endpoint = getTheGraphUrl(lib.config.chainId);
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    logger("Checking order", orderId, "attempt", attempt + 1, "of", maxRetries);
    let ids: number[] = [];
    if (!endpoint) {
      const orders = await lensOrders(lib);
      ids = orders.map((order) => order.id);
    } else {
      const orders = await graphOrders({ lib, endpoint });
      ids = orders.map((order: any) => Number(order.Contract_id));
    }
    if (ids.includes(orderId)) {
      logger("Order ID", orderId, "found");
      return true;
    }
    await delay(delayMs);
  }
  throw new Error(`Order ID ${orderId} not found after ${maxRetries} attempts`);
};
