import { Config, Status } from "@orbs-network/twap";
import BN from "bignumber.js";
import _ from "lodash";
import { amountUiV2 } from "./utils";
import { eqIgnoreCase, networks } from "@defi.org/web3-candies";

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
    return Status.Completed;
  }
  if (status === "canceled") {
    return Status.Canceled;
  }

  if (new Date(Number(rawOrder.ask_deadline)).getTime() > Date.now() / 1000) return Status.Open;
  return Status.Expired;
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
      twapAddress
`;

const getCreatedOrders = async ({ endpoint, signal, account, page = 0, limit }: { endpoint: string; signal?: AbortSignal; account?: string; page: number; limit: number }) => {
  const maker = account ? `, maker: "${account}"` : "";

  const where = `where:{ ${maker}}`;

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

const getAllCreatedOrders = async ({ account, endpoint, signal, limit }: { account: string; endpoint: string; signal?: AbortSignal; limit: number }) => {
  let page = 0;
  const orders: any = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const orderCreateds = await getCreatedOrders({
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
        twapAddress
        exchange
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

    fills.push(...response.data.orderFilleds);
    if (fills.length < LIMIT) break;
    page++;
  }

  return fills;
};

export enum OrderType {
  LIMIT = "limit",
  TWAP_LIMIT = "twap-limit",
  TWAP_MARKET = "twap-market",
}

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
  twapAddress: string;

  constructor(rawOrder: any, fills: any) {
    this.status = "";
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
    this.srcTokenAddress = rawOrder.ask_srcToken;
    this.dstTokenAddress = rawOrder.ask_dstToken;
    this.twapAddress = rawOrder.twapAddress;
    this.totalChunks = new BN(rawOrder.ask_srcAmount || 0)
      .div(rawOrder.ask_srcBidAmount || 1) // Avoid division by zero
      .integerValue(BN.ROUND_FLOOR)
      .toNumber();
    this.orderType = isMarketOrder ? OrderType.TWAP_MARKET : BN(this.totalChunks).eq(1) ? OrderType.LIMIT : OrderType.TWAP_LIMIT;
    this.isMarketOrder = isMarketOrder;
    this.dexFee = fills?.dexFee || 0;
  }

  public getFillDelay = (config: Config) => {
    return (this.ask_fillDelay || 0) * 1000 + getEstimatedDelayBetweenChunksMillis(config);
  };

  public getLimitPrice = (srcTokenDecimals: number, dstTokenDecimals: number) => {
    if (this.isMarketOrder) return;
    const srcBidAmountUi = amountUiV2(srcTokenDecimals, this.srcBidAmount);
    const dstMinAmountUi = amountUiV2(dstTokenDecimals, this.dstMinAmount);
    return BN(dstMinAmountUi).div(srcBidAmountUi).toString();
  };
  public getExcecutionPrice = (srcTokenDecimals: number, dstTokenDecimals: number) => {
    if (!BN(this.srcFilledAmount || 0).gt(0) || !BN(this.dstFilledAmount || 0).gt(0)) return;
    const srcFilledAmountUi = amountUiV2(srcTokenDecimals, this.srcFilledAmount);
    const dstFilledAmountUi = amountUiV2(dstTokenDecimals, this.dstFilledAmount);

    return BN(dstFilledAmountUi).div(srcFilledAmountUi).toString();
  };
}

export const getEstimatedDelayBetweenChunksMillis = (config: Config) => {
  return config.bidDelaySeconds * 1000 * 2;
};

export const getMinimumDelayMinutes = (config: Config) => {
  return getEstimatedDelayBetweenChunksMillis(config) / 1000 / 60;
};

const THE_GRAPH_API = "https://hub.orbs.network/api/apikey/subgraphs/id";

export const THE_GRAPH_ORDERS_API = {
  [networks.eth.id]: `${THE_GRAPH_API}/Bf7bvMYcJbDAvYWJmhMpHZ4cpFjqzkhK6GXXEpnPRq6`,
  [networks.bsc.id]: `${THE_GRAPH_API}/4NfXEi8rreQsnAr4aJ45RLCKgnjcWX46Lbt9SadiCcz6`,
  [networks.poly.id]: `${THE_GRAPH_API}/3PyRPWSvDnMowGbeBy7aNsvUkD5ZuxdXQw2RdJq4NdXi`,
  [networks.arb.id]: `${THE_GRAPH_API}/83bpQexEaqBjHaQbKoFTbtvCXuo5RudRkfLgtRUYqo2c`,
  [networks.base.id]: `${THE_GRAPH_API}/DFhaPQb3HATXkpsWNZw3gydYHehLBVEDiSk4iBdZJyps`,
  [networks.linea.id]: `${THE_GRAPH_API}/6VsNPEYfFLPZCqdMMDadoXQjLHWJdjEwiD768GAtb7j6`,
  [networks.ftm.id]: `${THE_GRAPH_API}/DdRo1pmJkrJC9fjsjEBWnNE1uqrbh7Diz4tVKd7rfupp`,
};

export const getTheGraphUrl = (chainId?: number) => {
  if (!chainId) return;
  return THE_GRAPH_ORDERS_API[chainId as keyof typeof THE_GRAPH_ORDERS_API];
};

export const getOrders = async ({
  chainId,
  account = "",
  signal,
  page,
  limit = 1_000,
}: {
  account?: string;
  signal?: AbortSignal;
  page?: number;
  chainId: number;
  limit?: number;
  twapAddress: string;
}): Promise<Order[]> => {
  const endpoint = getTheGraphUrl(chainId);
  if (!endpoint) return [];
  let orders: any = [];
  if (typeof page === "number") {
    orders = await getCreatedOrders({ endpoint, signal, account, page, limit });
  } else {
    orders = await getAllCreatedOrders({ endpoint, signal, account, limit });
  }

  const ids = orders.map((order: any) => order.Contract_id);

  const allFills = await getAllFills({ endpoint, signal, ids, chainId });

  orders = orders.map((rawOrder: any) => {
    const orderFilleds = allFills?.filter((fill: any) => {
      return eqIgnoreCase(fill.twapAddress, rawOrder.twapAddress) && fill.TWAP_id === Number(rawOrder.Contract_id) && eqIgnoreCase(fill.exchange, rawOrder.exchange);
    });

    const parsedFills = parseFills(Number(rawOrder.Contract_id), orderFilleds);

    return new Order(rawOrder, parsedFills);
  });

  return _.orderBy(orders, (o: any) => o.createdAt, "desc");
};

export const groupOrdersByStatus = (orders: Order[]): GroupedOrders => {
  const grouped = _.groupBy(orders, "status");

  return {
    [Status.Open]: grouped[Status.Open] || [],
    [Status.Completed]: grouped[Status.Completed] || [],
    [Status.Expired]: grouped[Status.Expired] || [],
    [Status.Canceled]: grouped[Status.Canceled] || [],
  };
};
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface GroupedOrders {
  [Status.Open]?: Order[];
  [Status.Canceled]?: Order[];
  [Status.Expired]?: Order[];
  [Status.Completed]?: Order[];
}
