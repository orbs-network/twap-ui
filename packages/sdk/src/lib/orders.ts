import { Config, Order, OrderStatus, OrderType } from "./types";
import { BigintSum, delay, eqIgnoreCase, getTheGraphUrl, groupBy, keyBy, orderBy, BigintDiv } from "./utils";
import { getEstimatedDelayBetweenChunksMillis } from "./lib";

const getProgress = (srcFilled?: bigint, srcAmountIn?: bigint) => {
  if (!srcFilled || !srcAmountIn) return 0;
  let progress = BigintDiv(srcFilled, srcAmountIn);

  return !progress ? 0 : progress < 0.99 ? progress * 100 : 100;
};

const graphCreatedOrders = async (account: string, endpoint: string, signal?: AbortSignal) => {
  const LIMIT = 1_000;
  let page = 0;
  let orders: any = [];

  const fetchOrders = async () => {
    const query = `
        {
        orderCreateds(first: ${LIMIT}, orderBy: timestamp, skip: ${page * LIMIT}, where:{maker: "${account}"}) {
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

    return payload.data.statuses.reduce((result: { [key: string]: string }, item: any) => {
      result[item.id] = item.status;
      return result;
    }, {});
  } catch (error) {}
};

const getOrderFills = (orderId: number, fills?: any) => {
  return {
    TWAP_id: Number(orderId),
    dstAmountOut: BigintSum(fills?.map((it: any) => it.dstAmountOut)),
    srcAmountIn: BigintSum(fills?.map((it: any) => it.srcAmountIn)),
    dollarValueIn: BigintSum(fills?.map((it: any) => it.dollarValueIn)),
    dollarValueOut: BigintSum(fills?.map((it: any) => it.dollarValueOut)),
  };
};

const graphOrderFills = async (account: string, endpoint: string, signal?: AbortSignal) => {
  const LIMIT = 1_000;
  let page = 0;
  let fills: any = [];

  const fetchFills = async () => {
    const query = `
      {
        orderFilleds(first: ${LIMIT}, orderBy: timestamp, skip: ${page * LIMIT}, where: { userAddress: "${account}" }) {
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
    const grouped = Object.entries(orderFilleds).map(([orderId, fills]: any) => {
      return getOrderFills(orderId, fills);
    });

    fills.push(...grouped);

    if (orderFilleds.length >= LIMIT) {
      page++;
      await fetchFills();
    } else {
      return fills;
    }
  };

  await fetchFills();

  return keyBy<ReturnType<typeof getOrderFills>>(fills, "TWAP_id");
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

const getLimitPrice = (order: Order, dstTokenDecimals: number) => {
  if (order.isMarketOrder) {
    return undefined;
  }

  const result = BigintDiv(BigInt(order.dstMinAmount), BigInt(order.srcBidAmount), dstTokenDecimals);

  return result.toString();
};

const getExcecutionPrice = (order: Order, dstTokenDecimals: number) => {
  if (!(BigInt(order.srcFilledAmount) > BigInt(0)) || !(BigInt(order.dstFilledAmount) > BigInt(0))) return;

  const result = BigintDiv(BigInt(order.dstFilledAmount), BigInt(order.srcFilledAmount), dstTokenDecimals);

  return result.toString();
};

const parseOrder = (order: any, config: Config, orderFill: any, statuses: any): Order => {
  const progress = getProgress(orderFill?.srcAmountIn, order.ask_srcAmount);
  const isMarketOrder = BigInt(order.ask_dstMinAmount || 0) < BigInt(1);

  const totalChunks = Math.ceil(BigintDiv(BigInt(order.ask_srcAmount || 0), BigInt(order.ask_srcBidAmount || 0)));

  const getOrderType = () => {
    if (isMarketOrder) {
      return OrderType.DCA_MARKET;
    }
    if (totalChunks === 1) {
      return OrderType.LIMIT;
    }

    return OrderType.DCA_LIMIT;
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
    totalChunks,
    isMarketOrder,
    fillDelay: (order.ask_fillDelay || 0) * 1000 + getEstimatedDelayBetweenChunksMillis(config),
    orderType: getOrderType(),
    getLimitPrice: (dstTokenDecimals: number) => getLimitPrice(order, dstTokenDecimals),
    getExcecutionPrice: (dstTokenDecimals: number) => getExcecutionPrice(order, dstTokenDecimals),
  };
};

const fetchOrders = async (config: Config, account: string, signal?: AbortSignal): Promise<Order[]> => {
  const endpoint = getTheGraphUrl(config!.chainId);
  if (!endpoint) {
    return [];
  }

  const [orders, fills] = await Promise.all([graphCreatedOrders(account, endpoint, signal), graphOrderFills(account, endpoint, signal)]);
  const ids = orders.map((order: any) => order.Contract_id);
  let statuses: any = {};

  try {
    statuses = await getOrderStatuses(ids, endpoint, signal);
  } catch (error) {}

  return orders.map((order: any) => {
    const orderFill = fills[order.Contract_id];
    return parseOrder(order, config, orderFill, statuses);
  });
};

export const getOrders = async (config: Config, account: string, signal?: AbortSignal) => {
  let orders = await fetchOrders(config, account!, signal);
  orders = orders.filter((o) => eqIgnoreCase(config!.exchangeAddress, o.exchange || ""));
  return orderBy(orders, (o) => o.createdAt, "desc");
};

export const groupOrdersByStatus = (orders: Order[]) => {
  const grouped = groupBy(orders, "status");
  grouped[OrderStatus.All] = orders;
  return grouped as GroupedOrders;
};

export const waitForOrdersUpdate = async (config: Config, orderId: number, account: string, signal?: AbortSignal) => {
  for (let i = 0; i < 20; i++) {
    const orders = await getOrders(config, account!, signal);
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
