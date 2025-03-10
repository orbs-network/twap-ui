import { Config, OrderStatus, OrderType } from "./types";
import BN from "bignumber.js";
import { amountUi, getTheGraphUrl, groupBy, orderBy } from "./utils";
import { getEstimatedDelayBetweenChunksMillis } from "./lib";
import { LEGACY_ORDERS_MAP } from "./consts";

const getOrderProgress = (srcFilled?: string, srcAmountIn?: string) => {
  if (!srcFilled || !srcAmountIn) return 0;
  const progress = BN(srcFilled || "0")
    .dividedBy(srcAmountIn || "0")
    .toNumber();

  return !progress ? 0 : progress < 0.99 ? progress * 100 : 100;
};

const getOrderStatus = (rawOrder: any, status?: any) => {
  status = status?.toLowerCase();
  if (status === "completed") {
    return OrderStatus.Completed;
  }
  if (status === "canceled") {
    return OrderStatus.Canceled;
  }

  if (new Date(Number(rawOrder.ask_deadline)).getTime() > Date.now() / 1000) return OrderStatus.Open;
  return OrderStatus.Expired;
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
  config,
}: {
  endpoint: string;
  signal?: AbortSignal;
  account?: string;
  page: number;
  limit: number;
  config: Config;
}) => {
  const exchangeAddresses = [config.exchangeAddress, ...(LEGACY_ORDERS_MAP[config.name] || [])].map((a) => `"${a}"`);
  const exchange = `exchange_in: [${exchangeAddresses.join(", ")}]`;
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

export const getCreatedOrder = async ({ endpoint, signal, id, txHash }: { endpoint: string; signal?: AbortSignal; id?: number; txHash?: string }) => {
  if (!id && !txHash) {
    throw new Error("id or txHash is required");
  }

  let where;
  if (id) {
    where = `where:{Contract_id: ${id}}`;
  } else {
    where = `where:{transactionHash: "${txHash}"}`;
  }

  const query = `
  {
  orderCreateds(${where}) {
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

const getAllCreatedOrders = async ({ account, endpoint, signal, config, limit }: { account: string; endpoint: string; signal?: AbortSignal; config: Config; limit: number }) => {
  let page = 0;
  const orders: RawOrder[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const orderCreateds = await getCreatedOrders({
      config,
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

  const response = await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify({ query }),
    signal,
  });
  const payload = await response.json();
  if (payload.errors) {
    throw new Error(payload.errors[0].message);
  }
  return payload.data.statuses.reduce((result: { [key: string]: string }, item: any) => {
    result[item.id] = item.status;
    return result;
  }, {});
};

const parseFills = (orderId: number, fills?: any) => {
  return {
    TWAP_id: Number(orderId),
    dstAmountOut: fills?.reduce((acc: BN, it: any) => acc.plus(BN(it.dstAmountOut)), BN(0)).toString(),
    srcAmountIn: fills?.reduce((acc: BN, it: any) => acc.plus(BN(it.srcAmountIn)), BN(0)).toString(),
    dollarValueIn: fills?.reduce((acc: BN, it: any) => acc.plus(BN(it.dollarValueIn)), BN(0)).toString(),
    dollarValueOut: fills?.reduce((acc: BN, it: any) => acc.plus(BN(it.dollarValueOut)), BN(0)).toString(),
    dexFee: fills?.reduce((acc: BN, it: any) => acc.plus(BN(it.dexFee || 0)), BN(0)).toString(),
    fills,
  };
};

const getAllFills = async ({ endpoint, signal, ids, chainId }: { endpoint: string; signal?: AbortSignal; ids: string[]; chainId: number }) => {
  const LIMIT = 1_000;
  let page = 0;
  const where = `where: { TWAP_id_in: [${ids.join(", ")}] }`;
  const fills = [];
  const dexFee = chainId === 56 ? "dexFee" : "";
  // eslint-disable-next-line no-constant-condition
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
        dollarValueOut,
        ${dexFee}
      }
    }
  `;

    const payload = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ query }),
      signal,
    });
    const response = await payload.json();

    const orderFilleds = groupBy(response.data.orderFilleds, "TWAP_id");

    const result = Object.entries(orderFilleds).map(([orderId, fills]: any) => {
      return parseFills(orderId, fills);
    });

    fills.push(...result);
    if (fills.length < LIMIT) break;
    page++;
  }

  return fills;
};

export type RawOrder = {
  Contract_id: string | number;
  srcTokenSymbol: string;
  dollarValueIn: string;
  blockNumber: number;
  maker: string;
  dstTokenSymbol: string;
  ask_fillDelay: number;
  exchange: string;
  dex: string;
  ask_deadline: number;
  timestamp: number;
  ask_srcAmount: string;
  ask_dstMinAmount: string;
  ask_srcBidAmount: string;
  transactionHash: string;
  ask_srcToken: string;
  ask_dstToken: string;
};

export class Order {
  id: number;
  exchange: string;
  ask_fillDelay: number;
  dex: string;
  deadline: number;
  createdAt: number;
  srcAmount: string;
  dstMinAmount: string;
  status: string;
  srcBidAmount: string;
  txHash: string;
  dstFilledAmount: string;
  srcFilledAmount: string;
  srcFilledAmountUsd: string;
  dstFilledAmountUsd: string;
  progress: number;
  srcTokenAddress: string;
  dstTokenAddress: string;
  totalChunks: number;
  isMarketOrder: boolean;
  orderType: string;
  srcTokenSymbol: string;
  dstTokenSymbol: string;
  maker: string;
  dollarValueIn: string;
  blockNumber: number;
  dexFee: string;

  constructor(rawOrder: RawOrder, fills: any, status: any) {
    this.status = getOrderStatus(rawOrder, status);
    const isMarketOrder = BN(rawOrder.ask_dstMinAmount || 0).lte(1);
    this.srcTokenSymbol = rawOrder.srcTokenSymbol;
    this.dollarValueIn = rawOrder.dollarValueIn;
    this.blockNumber = rawOrder.blockNumber;
    this.maker = rawOrder.maker;
    this.dstTokenSymbol = rawOrder.dstTokenSymbol;
    const progress = this.status === OrderStatus.Completed ? 100 : getOrderProgress(fills?.srcAmountIn, rawOrder.ask_srcAmount);
    this.id = Number(rawOrder.Contract_id);
    this.exchange = rawOrder.exchange;
    this.ask_fillDelay = rawOrder.ask_fillDelay;
    this.dex = rawOrder.dex;
    this.deadline = Number(rawOrder.ask_deadline) * 1000;
    this.createdAt = new Date(rawOrder.timestamp).getTime();
    this.srcAmount = rawOrder.ask_srcAmount;
    this.dstMinAmount = rawOrder.ask_dstMinAmount;
    this.srcBidAmount = rawOrder.ask_srcBidAmount;
    this.txHash = rawOrder.transactionHash;
    this.dstFilledAmount = fills?.dstAmountOut || 0;
    this.srcFilledAmount = fills?.srcAmountIn || 0;
    this.srcFilledAmountUsd = fills?.dollarValueIn || "0";
    this.dstFilledAmountUsd = fills?.dollarValueOut || "0";
    this.progress = progress;
    this.srcTokenAddress = rawOrder.ask_srcToken;
    this.dstTokenAddress = rawOrder.ask_dstToken;
    this.totalChunks = new BN(rawOrder.ask_srcAmount || 0)
      .div(rawOrder.ask_srcBidAmount || 1) // Avoid division by zero
      .integerValue(BN.ROUND_FLOOR)
      .toNumber();
    this.orderType = isMarketOrder ? OrderType.TWAP_MARKET : BN(this.totalChunks).eq(1) ? OrderType.LIMIT : OrderType.TWAP_LIMIT;
    this.isMarketOrder = isMarketOrder;
    this.dexFee = fills?.dexFee || 0;
  }
}

export const getOrderFillDelay = (order: Order, config: Config) => {
  return (order.ask_fillDelay || 0) * 1000 + getEstimatedDelayBetweenChunksMillis(config);
};

export const getOrderLimitPrice = (order: Order, srcTokenDecimals: number, dstTokenDecimals: number) => {
  if (order.isMarketOrder) return;
  const srcBidAmountUi = amountUi(srcTokenDecimals, order.srcBidAmount);
  const dstMinAmountUi = amountUi(dstTokenDecimals, order.dstMinAmount);
  return BN(dstMinAmountUi).div(srcBidAmountUi).toString();
};
export const getOrderExcecutionPrice = (order: Order, srcTokenDecimals: number, dstTokenDecimals: number) => {
  if (!BN(order.srcFilledAmount || 0).gt(0) || !BN(order.dstFilledAmount || 0).gt(0)) return;
  const srcFilledAmountUi = amountUi(srcTokenDecimals, order.srcFilledAmount);
  const dstFilledAmountUi = amountUi(dstTokenDecimals, order.dstFilledAmount);

  return BN(dstFilledAmountUi).div(srcFilledAmountUi).toString();
};

export const getOrders = async ({
  chainId,
  account = "",
  signal,
  page,
  limit = 1_000,
  config,
}: {
  account?: string;
  signal?: AbortSignal;
  page?: number;
  chainId: number;
  limit?: number;
  config: Config;
}): Promise<Order[]> => {
  const endpoint = getTheGraphUrl(chainId);
  if (!endpoint) {
    throw new Error("no endpoint found");
  }
  let rawOrders: RawOrder[] = [];
  if (typeof page === "number") {
    rawOrders = await getCreatedOrders({ endpoint, signal, account, config, page, limit });
  } else {
    rawOrders = await getAllCreatedOrders({ endpoint, signal, account, config, limit });
  }

  const ordersMap = new Map(rawOrders.map((order) => [Number(order.Contract_id), order]));
  const ids = rawOrders.map((rawOrder: any) => rawOrder.Contract_id);
  const fills = await getAllFills({ endpoint, signal, ids, chainId });
  const statuses = await getOrderStatuses(ids, endpoint, signal);

  const parseOrder = (rawOrder: RawOrder) => {
    const fill = fills?.find((it) => it.TWAP_id === Number(rawOrder.Contract_id));
    return new Order(rawOrder, fill, statuses?.[rawOrder.Contract_id]);
  };

  let orders = rawOrders.map((rawOrder: any) => {
    return parseOrder(rawOrder);
  }) as Order[];

  const { cancelledOrderIds, newOrders } = orderStore.getOrders(account, config.exchangeAddress);

  if (newOrders.length) {
    newOrders.forEach((newOrder) => {
      if (!ordersMap.has(Number(newOrder.Contract_id))) {
        console.log(`New added: ${newOrder.Contract_id}`);
        orders.unshift(parseOrder(newOrder));
      } else {
        console.log(`New removed: ${newOrder.Contract_id}`);
        orderStore.deleteNewOrder(account, config.exchangeAddress, Number(newOrder.Contract_id));
      }
    });
  }

  if (cancelledOrderIds.length) {
    const cancelledSet = new Set(cancelledOrderIds);

    orders = orders.map((order) => {
      if (cancelledSet.has(order.id)) {
        if (order.status !== OrderStatus.Canceled) {
          console.log(`Cancelled: ${order.id}`);
          return { ...order, status: OrderStatus.Canceled };
        } else {
          console.log(`Cancelled removed: ${order.id}`);

          orderStore.deleteCancelledOrderId(account, config.exchangeAddress, order.id);
        }
      }
      return order;
    });
  }

  return orderBy(orders, (o: any) => o.createdAt, "desc");
};

const getOrder = async ({ chainId, id, txHash, signal }: { chainId: number; id?: number; signal?: AbortSignal; txHash?: string }): Promise<Order> => {
  const endpoint = getTheGraphUrl(chainId);
  if (!endpoint) {
    throw new Error("No endpoint found");
  }
  const [order] = await getCreatedOrder({ endpoint, signal, id, txHash });
  const ids = [order.Contract_id];
  const fills = await getAllFills({ endpoint, signal, ids, chainId });

  const statuses = await getOrderStatuses(ids, endpoint, signal);

  return new Order(order, fills?.[0], statuses[order.Contract_id]);
};

export const getOrderById = async ({ chainId, id, signal }: { chainId: number; id: number; signal?: AbortSignal }): Promise<Order> => {
  return getOrder({ chainId, id, signal });
};

export const getOrderByTxHash = async ({ chainId, txHash, signal }: { chainId: number; txHash: string; signal?: AbortSignal }): Promise<Order> => {
  return getOrder({ chainId, txHash, signal });
};

export const getAllOrders = ({ chainId, signal, page, limit = 1_000, config }: { signal?: AbortSignal; page?: number; chainId: number; limit?: number; config: Config }) => {
  return getOrders({
    chainId,
    signal,
    page,
    limit,
    config,
  });
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

type ExchangeOrders = { newOrders: RawOrder[]; cancelledOrderIds: number[] };

class OrdersStore {
  getOrders(account: string, exchange: string): ExchangeOrders {
    const res = localStorage.getItem(`orders-${account}`);
    if (!res) return { newOrders: [], cancelledOrderIds: [] };

    const parsedData = JSON.parse(res);
    return parsedData[exchange] || { newOrders: [], cancelledOrderIds: [] };
  }
  save(account: string, exchange: string, exchangeOrders: ExchangeOrders) {
    const storedData = localStorage.getItem(`orders-${account}`);
    const allOrders = storedData ? JSON.parse(storedData) : {};
    allOrders[exchange] = exchangeOrders;
    localStorage.setItem(`orders-${account}`, JSON.stringify(allOrders));
  }

  addNewOrder(account: string, exchange: string, newOrder: RawOrder) {
    const orders = this.getOrders(account, exchange);
    if (orders.newOrders.some((order) => order.Contract_id === newOrder.Contract_id)) return;
    orders.newOrders.push(newOrder);
    this.save(account, exchange, orders);
  }
  addCancelledOrder(account: string, exchange: string, orderId: number) {
    const orders = this.getOrders(account, exchange);
    if (!orders.cancelledOrderIds.includes(orderId)) {
      // `.includes()` is more readable for arrays
      orders.cancelledOrderIds.push(orderId);
      this.save(account, exchange, orders);
    }
  }
  deleteNewOrder(account: string, exchange: string, orderId: number) {
    const orders = this.getOrders(account, exchange);
    orders.newOrders = orders.newOrders.filter((order) => order.Contract_id !== orderId);
    this.save(account, exchange, orders);
  }
  deleteCancelledOrderId(account: string, exchange: string, orderId: number) {
    const orders = this.getOrders(account, exchange);
    orders.cancelledOrderIds = orders.cancelledOrderIds.filter((id) => id !== orderId);
    this.save(account, exchange, orders);
  }
}

const orderStore = new OrdersStore();

export function addNewOrder(account: string, exchange: string, rawOrder: RawOrder) {
  orderStore.addNewOrder(account, exchange, rawOrder);
}

export function addCancelledOrder(account: string, exchange: string, orderId: number) {
  orderStore.addCancelledOrder(account, exchange, orderId);
}

export interface GroupedOrders {
  [OrderStatus.All]?: Order[];
  [OrderStatus.Open]?: Order[];
  [OrderStatus.Canceled]?: Order[];
  [OrderStatus.Expired]?: Order[];
  [OrderStatus.Completed]?: Order[];
}
