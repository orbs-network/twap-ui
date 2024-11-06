import { Config, Order, OrderStatus, OrderType } from "./types";
import BN from "bignumber.js";
import { amountUi, convertDecimals, delay, eqIgnoreCase, getTheGraphUrl, groupBy, keyBy, orderBy } from "./utils";
import { getEstimatedDelayBetweenChunksMillis } from "./lib";

const getProgress = (srcFilled?: string, srcAmountIn?: string) => {
  if (!srcFilled || !srcAmountIn) return 0;
  let progress = BN(srcFilled || "0")
    .dividedBy(srcAmountIn || "0")
    .toNumber();

  return !progress ? 0 : progress < 0.99 ? progress * 100 : 100;
};

const getCreatedOrders = async ({
  endpoint,
  signal,
  config,
  account,
  page = 0,
  limit,
}: {
  endpoint: string;
  signal?: AbortSignal;
  config: Config;
  account?: string;
  page: number;
  limit: number;
}) => {
  const exchange = `exchange: "${config.exchangeAddress}"`;
  const maker = account ? `, maker: "${account}"` : "";

  const where = `where:{${exchange} ${maker}}`;

  const query = `
  {
  orderCreateds(first: ${limit}, orderBy: timestamp, skip: ${page * limit},  ${where}) {
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
  return response.data.orderCreateds;
};

const getAllCreatedOrders = async ({ account, endpoint, signal, config, limit }: { account: string; endpoint: string; signal?: AbortSignal; config: Config; limit: number }) => {
  let page = 0;
  let orders: any = [];

  const paginate = async () => {
    const orderCreateds = await getCreatedOrders({
      config,
      account,
      signal,
      endpoint,
      page,
      limit,
    });

    orders.push(...orderCreateds);
    if (orderCreateds.length >= limit) {
      page++;
      await paginate();
    } else {
      return orders;
    }
  };

  await paginate();

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

    return payload.data.statuses.reduce((result: { [key: string]: string }, item: any) => {
      result[item.id] = item.status;
      return result;
    }, {});
  } catch (error) {
    return {};
  }
};

const parseFills = (orderId: number, fills?: any) => {
  return {
    TWAP_id: Number(orderId),
    dstAmountOut: fills?.reduce((acc: BN, it: any) => acc.plus(BN(it.dstAmountOut)), BN(0)).toString(),
    srcAmountIn: fills?.reduce((acc: BN, it: any) => acc.plus(BN(it.srcAmountIn)), BN(0)).toString(),
    dollarValueIn: fills?.reduce((acc: BN, it: any) => acc.plus(BN(it.dollarValueIn)), BN(0)).toString(),
    dollarValueOut: fills?.reduce((acc: BN, it: any) => acc.plus(BN(it.dollarValueOut)), BN(0)).toString(),
  };
};

const getAllFills = async ({ endpoint, signal, ids }: { endpoint: string; signal?: AbortSignal; ids: string[] }) => {
  const LIMIT = 1_000;
  let page = 0;
  const where = `where: { TWAP_id_in: [${ids.join(", ")}] }`;

  const paginate = async () => {
    const query = `
        {
          orderFilleds(first: ${LIMIT}, orderBy: timestamp, skip: ${page * LIMIT}, ${where}) {
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
    let orderFilleds = groupBy(response.data.orderFilleds, "TWAP_id");
    const fills = Object.entries(orderFilleds).map(([orderId, fills]: any) => {
      return parseFills(orderId, fills);
    });
    fills.push(...fills);
    if (fills.length >= LIMIT) {
      page++;
      await paginate();
    } else {
      return fills;
    }
  };

  return paginate();
};

const getStatus = (progress = 0, order: any, statuses?: any) => {
  let status = statuses?.[order.Contract_id]?.toLowerCase();

  if (progress === 100 || status === "completed") {
    return OrderStatus.Completed;
  }
  if (status === "canceled") {
    return OrderStatus.Canceled;
  }

  if (new Date(Number(order.ask_deadline)).getTime() > Date.now() / 1000) return OrderStatus.Open;
  return OrderStatus.Expired;
};

const getLimitPrice = (srcBidAmount: string, dstMinAmount: string, isMarketOrder: boolean, srcTokenDecimals: number, dstTokenDecimals: number) => {
  if (isMarketOrder) return;
  const srcBidAmountUi = amountUi(srcTokenDecimals, srcBidAmount);
  const dstMinAmountUi = amountUi(dstTokenDecimals, dstMinAmount);

  return BN(dstMinAmountUi).div(srcBidAmountUi).toString();
};

const getExcecutionPrice = (srcTokenDecimals: number, dstTokenDecimals: number, srcFilledAmount?: string, dstFilledAmount?: string) => {
  if (!BN(srcFilledAmount || 0).gt(0) || !BN(dstFilledAmount || 0).gt(0)) return;

  const srcFilledAmountUi = amountUi(srcTokenDecimals, srcFilledAmount);
  const dstFilledAmountUi = amountUi(dstTokenDecimals, dstFilledAmount);

  return BN(dstFilledAmountUi).div(srcFilledAmountUi).toString();
};

const parseOrder = (order: any, config: Config, orderFill: any, statuses: any): Order => {
  const progress = getProgress(orderFill?.srcAmountIn, order.ask_srcAmount);
  const isMarketOrder = BN(order.ask_dstMinAmount || 0).lte(1);
  const totalChunks = BN(order.ask_srcAmount || 0)
    .div(order.ask_srcBidAmount || 0)
    .integerValue(BN.ROUND_CEIL)
    .toNumber();

  const getOrderType = () => {
    if (isMarketOrder) {
      return OrderType.TWAP_MARKET;
    }
    if (BN(totalChunks).eq(1)) {
      return OrderType.LIMIT;
    }

    return OrderType.TWAP_LIMIT;
  };

  return {
    id: Number(order.Contract_id),
    exchange: order.exchange,
    dex: order.dex.toLowerCase(),
    deadline: Number(order.ask_deadline) * 1000,
    createdAt: new Date(order.timestamp).getTime(),
    srcAmount: order.ask_srcAmount,
    dstMinAmount: order.ask_dstMinAmount,
    status: getStatus(progress, order, statuses),
    srcBidAmount: order.ask_srcBidAmount,
    txHash: order.transactionHash,
    dstFilledAmount: orderFill?.dstAmountOut,
    srcFilledAmount: orderFill?.srcAmountIn,
    srcFilledAmountUsd: orderFill?.dollarValueIn || "0",
    dstFilledAmountUsd: orderFill?.dollarValueOut || "0",
    progress,
    srcTokenAddress: order.ask_srcToken,
    dstTokenAddress: order.ask_dstToken,
    totalChunks: BN(order.ask_srcAmount || 0)
      .div(order.ask_srcBidAmount || 0)
      .integerValue(BN.ROUND_CEIL)
      .toNumber(),
    isMarketOrder,
    fillDelay: (order.ask_fillDelay || 0) * 1000 + getEstimatedDelayBetweenChunksMillis(config),
    orderType: getOrderType(),
    getLimitPrice: (srcTokenDecimals: number, dstTokenDecimals: number) =>
      getLimitPrice(order.ask_srcBidAmount, order.ask_dstMinAmount, isMarketOrder, srcTokenDecimals, dstTokenDecimals),
    getExcecutionPrice: (srcTokenDecimals: number, dstTokenDecimals: number) =>
      getExcecutionPrice(srcTokenDecimals, dstTokenDecimals, orderFill?.srcAmountIn, orderFill?.dstAmountOut),
  };
};

export const getOrders = async ({
  config,
  account = "",
  signal,
  page,
  limit = 1_000,
}: {
  account?: string;
  signal?: AbortSignal;
  page?: number;
  config: Config;
  limit?: number;
}) => {
  const endpoint = getTheGraphUrl(config!.chainId);
  if (!endpoint) return [];
  let orders = [];
  if (typeof page === "number") {
    orders = await getCreatedOrders({ endpoint, signal, account, config, page, limit });
  } else {
    orders = await getAllCreatedOrders({ endpoint, signal, account, config, limit });
  }
  const ids = orders.map((order: any) => order.Contract_id);
  const fills = await getAllFills({ endpoint, signal, ids });
  const statuses = await getOrderStatuses(ids, endpoint, signal);

  orders = orders.map((order: any) => {
    const fill = fills?.find((it) => it.TWAP_id === order.Contract_id);
    return parseOrder(order, config, fill, statuses);
  });

  return orderBy(orders, (o: any) => o.createdAt, "desc");
};

export const groupOrdersByStatus = (orders: Order[]): GroupedOrders => {
  const grouped = groupBy(orders, "status");
  return {
    [OrderStatus.All]: orders || [],
    [OrderStatus.Open]: grouped.open || [],
    [OrderStatus.Completed]: grouped.completed || [],
    [OrderStatus.Expired]: grouped.expired || [],
    [OrderStatus.Canceled]: grouped.canceled || [],
  };
};

export const waitForOrdersUpdate = async (config: Config, orderId: number, account: string, signal?: AbortSignal) => {
  for (let i = 0; i < 20; i++) {
    const orders = await getOrders({ config, account, signal });
    if (orders.find((o) => o.id === orderId)) {
      return orders;
    }
    await delay(3_000);
  }
};

export interface GroupedOrders {
  [OrderStatus.All]?: Order[];
  [OrderStatus.Open]?: Order[];
  [OrderStatus.Canceled]?: Order[];
  [OrderStatus.Expired]?: Order[];
  [OrderStatus.Completed]?: Order[];
}
