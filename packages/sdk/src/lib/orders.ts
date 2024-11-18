import { Config, OrderStatus, OrderType } from "./types";
import BN from "bignumber.js";
import { amountUi, delay, getTheGraphUrl, groupBy, keyBy, orderBy } from "./utils";
import { getEstimatedDelayBetweenChunksMillis } from "./lib";

const getOrderProgress = (srcFilled?: string, srcAmountIn?: string) => {
  if (!srcFilled || !srcAmountIn) return 0;
  let progress = BN(srcFilled || "0")
    .dividedBy(srcAmountIn || "0")
    .toNumber();

  return !progress ? 0 : progress < 0.99 ? progress * 100 : 100;
};

const getOrderStatus = (progress = 0, rawOrder: any, status?: any) => {
  status = status?.toLowerCase();
  if (progress === 100 || status === "completed") {
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
  };
};

const getAllFills = async ({ endpoint, signal, ids, chainId }: { endpoint: string; signal?: AbortSignal; ids: string[]; chainId: number }) => {
  const LIMIT = 1_000;
  let page = 0;
  const where = `where: { TWAP_id_in: [${ids.join(", ")}] }`;
  let fills = [];
  const dexFee = chainId === 56 ? "dexFee" : "";
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

    let orderFilleds = groupBy(response.data.orderFilleds, "TWAP_id");
    const result = Object.entries(orderFilleds).map(([orderId, fills]: any) => {
      return parseFills(orderId, fills);
    });

    console.log({ result });

    fills.push(...result);
    if (fills.length < LIMIT) break;
    page++;
  }

  return fills;
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

  constructor(rawOrder: any, fills: any, status: any) {
    const isMarketOrder = BN(rawOrder.ask_dstMinAmount || 0).lte(1);
    this.srcTokenSymbol = rawOrder.srcTokenSymbol;
    this.dollarValueIn = rawOrder.dollarValueIn;
    this.blockNumber = rawOrder.blockNumber;
    this.maker = rawOrder.maker;
    this.dstTokenSymbol = rawOrder.dstTokenSymbol;
    const progress = getOrderProgress(fills?.srcAmountIn, rawOrder.ask_srcAmount);
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
    this.status = getOrderStatus(progress, rawOrder, status);
    this.srcTokenAddress = rawOrder.ask_srcToken;
    this.dstTokenAddress = rawOrder.ask_dstToken;
    this.totalChunks = new BN(rawOrder.ask_srcAmount || 0)
      .div(rawOrder.ask_srcBidAmount || 1) // Avoid division by zero
      .integerValue(BN.ROUND_CEIL)
      .toNumber();
    this.orderType = isMarketOrder ? OrderType.TWAP_MARKET : BN(this.totalChunks).eq(1) ? OrderType.LIMIT : OrderType.TWAP_LIMIT;
    this.isMarketOrder = isMarketOrder;
  }

  public getFillDelay = (config: Config) => {
    return (this.ask_fillDelay || 0) * 1000 + getEstimatedDelayBetweenChunksMillis(config);
  };

  public getLimitPrice = (srcTokenDecimals: number, dstTokenDecimals: number) => {
    if (this.isMarketOrder) return;
    const srcBidAmountUi = amountUi(srcTokenDecimals, this.srcBidAmount);
    const dstMinAmountUi = amountUi(dstTokenDecimals, this.dstMinAmount);
    return BN(dstMinAmountUi).div(srcBidAmountUi).toString();
  };
  public getExcecutionPrice = (srcTokenDecimals: number, dstTokenDecimals: number) => {
    if (!BN(this.srcFilledAmount || 0).gt(0) || !BN(this.dstFilledAmount || 0).gt(0)) return;
    const srcFilledAmountUi = amountUi(srcTokenDecimals, this.srcFilledAmount);
    const dstFilledAmountUi = amountUi(dstTokenDecimals, this.dstFilledAmount);

    return BN(dstFilledAmountUi).div(srcFilledAmountUi).toString();
  };
}

export const getOrders = async ({
  chainId,
  account = "",
  signal,
  page,
  limit = 1_000,
  exchangeAddress,
}: {
  account?: string;
  signal?: AbortSignal;
  page?: number;
  chainId: number;
  limit?: number;
  exchangeAddress?: string;
}): Promise<Order[]> => {
  const endpoint = getTheGraphUrl(chainId);
  if (!endpoint) return [];
  let orders = [];
  if (typeof page === "number") {
    orders = await getCreatedOrders({ endpoint, signal, account, exchangeAddress, page, limit });
  } else {
    orders = await getAllCreatedOrders({ endpoint, signal, account, exchangeAddress, limit });
  }
  const ids = orders.map((order: any) => order.Contract_id);
  const fills = await getAllFills({ endpoint, signal, ids, chainId });
  const statuses = await getOrderStatuses(ids, endpoint, signal);
  orders = orders.map((rawOrder: any) => {
    const fill = fills?.find((it) => it.TWAP_id === Number(rawOrder.Contract_id));
    return new Order(rawOrder, fill, statuses?.[rawOrder.Contract_id]);
  });

  return orderBy(orders, (o: any) => o.createdAt, "desc");
};

export const getOrderById = async ({ chainId, orderId, signal }: { chainId: number; orderId: number; signal?: AbortSignal }): Promise<Order> => {
  const endpoint = getTheGraphUrl(chainId);
  if (!endpoint) {
    throw new Error("No endpoint found");
  }
  const [order] = await getCreatedOrder({ endpoint, signal, orderId });
  const ids = [order.Contract_id];
  const fills = await getAllFills({ endpoint, signal, ids, chainId });

  const statuses = await getOrderStatuses(ids, endpoint, signal);

  return new Order(order, fills?.[0], statuses[order.Contract_id]);
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
    const orders = await getOrders({ exchangeAddress: config.exchangeAddress, account, signal, chainId: config.chainId });
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
