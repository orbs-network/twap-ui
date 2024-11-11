import { Config, Order, OrderStatus, OrderType } from "./types";
import BN from "bignumber.js";
import { amountUi, delay, eqIgnoreCase, getTheGraphUrl, groupBy, keyBy, orderBy } from "./utils";
import { getEstimatedDelayBetweenChunksMillis } from "./lib";
import { Configs } from "..";

const getProgress = (srcFilled?: string, srcAmountIn?: string) => {
  if (!srcFilled || !srcAmountIn) return 0;
  let progress = BN(srcFilled || "0")
    .dividedBy(srcAmountIn || "0")
    .toNumber();

  return !progress ? 0 : progress < 0.99 ? progress * 100 : 100;
};

const ordersCreatedQueryValues = `
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
`;

const getCreatedOrders = async ({
  endpoint,
  signal,
  account,
  page = 0,
  limit,
  exchangeAddress,
}: {
  endpoint: string;
  signal?: AbortSignal;
  account?: string;
  page: number;
  limit: number;
  exchangeAddress?: string;
}) => {
  const exchange = exchangeAddress ? `exchange: "${exchangeAddress}"` : "";
  const maker = account ? `, maker: "${account}"` : "";

  const where = `where:{${exchange} ${maker}}`;

  const query = `
  {
  orderCreateds(first: ${limit}, orderBy: timestamp,orderDirection: desc,  skip: ${page * limit},  ${where}) {
     ${ordersCreatedQueryValues}
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

export const getCreatedOrder = async ({ endpoint, signal, orderId }: { endpoint: string; signal?: AbortSignal; orderId: number }) => {
  const query = `
  {
  orderCreateds(where:{Contract_id: ${orderId}}) {
     ${ordersCreatedQueryValues}
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

const getAllCreatedOrders = async ({
  account,
  endpoint,
  signal,
  exchangeAddress,
  limit,
}: {
  account: string;
  endpoint: string;
  signal?: AbortSignal;
  exchangeAddress?: string;
  limit: number;
}) => {
  let page = 0;
  let orders: any = [];

  while (true) {
    const orderCreateds = await getCreatedOrders({
      exchangeAddress,
      account,
      signal,
      endpoint,
      page,
      limit,
    });

    orders.push(...orderCreateds);
    if (orderCreateds.length < limit) break;

    page++;
  }

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
  let fills = [];
  while (true) {
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
    const result = Object.entries(orderFilleds).map(([orderId, fills]: any) => {
      return parseFills(orderId, fills);
    });

    fills.push(...result);
    if (fills.length < LIMIT) break;
    page++;
  }

  return fills;
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

const parseOrder = (order: any, orderFill: any, statuses: any, config?: Config): Order => {
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
    ask_fillDelay: order.ask_fillDelay,
    dex: getConfigFromExchangeAddress(order.exchange)?.name || "",
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
    orderType: getOrderType(),
    fillDelay: !config ? 0 : (order.ask_fillDelay || 0) * 1000 + getEstimatedDelayBetweenChunksMillis(config),
    getLimitPrice: (srcTokenDecimals: number, dstTokenDecimals: number) =>
      getLimitPrice(order.ask_srcBidAmount, order.ask_dstMinAmount, isMarketOrder, srcTokenDecimals, dstTokenDecimals),
    getExcecutionPrice: (srcTokenDecimals: number, dstTokenDecimals: number) =>
      getExcecutionPrice(srcTokenDecimals, dstTokenDecimals, orderFill?.srcAmountIn, orderFill?.dstAmountOut),
  };
};

export const getOrderFillDelay = (order: Order, config: Config) => {
  return (order.ask_fillDelay || 0) * 1000 + getEstimatedDelayBetweenChunksMillis(config);
};

export const getConfigFromExchangeAddress = (exchangeAddress: string) => {
  return Object.values(Configs).find((config) => eqIgnoreCase(config.exchangeAddress, exchangeAddress));
};

export const getOrders = async ({
  chainId,
  account = "",
  signal,
  page,
  limit = 1_000,
  config,
  exchangeAddress: _exchangeAddress,
}: {
  account?: string;
  signal?: AbortSignal;
  page?: number;
  chainId: number;
  limit?: number;
  config?: Config;
  exchangeAddress?: string;
}): Promise<Order[]> => {
  const exchangeAddress = _exchangeAddress || config?.exchangeAddress;
  const endpoint = getTheGraphUrl(chainId);
  if (!endpoint) return [];
  let orders = [];
  if (typeof page === "number") {
    orders = await getCreatedOrders({ endpoint, signal, account, exchangeAddress, page, limit });
  } else {
    orders = await getAllCreatedOrders({ endpoint, signal, account, exchangeAddress, limit });
  }
  const ids = orders.map((order: any) => order.Contract_id);
  const fills = await getAllFills({ endpoint, signal, ids });
  const statuses = await getOrderStatuses(ids, endpoint, signal);
  orders = orders.map((order: any) => {
    const fill = fills?.find((it) => it.TWAP_id === order.Contract_id);
    return parseOrder(order, fill, statuses, config);
  });

  const result = orderBy(orders, (o: any) => o.createdAt, "desc");

  return result;
};

export const getOrderById = async ({ chainId, orderId, signal }: { chainId: number; orderId: number; signal?: AbortSignal }): Promise<Order> => {
  const endpoint = getTheGraphUrl(chainId);
  if (!endpoint) {
    throw new Error("No endpoint found");
  }
  const [order] = await getCreatedOrder({ endpoint, signal, orderId });
  const ids = [order.Contract_id];
  const fills = await getAllFills({ endpoint, signal, ids });

  const statuses = await getOrderStatuses(ids, endpoint, signal);

  return parseOrder(order, fills?.[0], statuses);
};

export const getAllOrders = ({
  chainId,
  signal,
  page,
  limit = 1_000,
  exchangeAddress,
}: {
  signal?: AbortSignal;
  page?: number;
  chainId: number;
  limit?: number;
  exchangeAddress?: string;
}) => {
  return getOrders({
    chainId,
    signal,
    page,
    limit,
    exchangeAddress,
  });
};

export const getUserOrders = async ({ account, signal, page, limit = 1_000, config }: { account: string; signal?: AbortSignal; page?: number; limit?: number; config: Config }) => {
  return getOrders({ chainId: config?.chainId, account, signal, page, limit, config });
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
    const orders = await getOrders({ config, account, signal, chainId: config.chainId });
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
