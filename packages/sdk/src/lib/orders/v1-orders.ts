/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-constant-condition */
import { Config, OrderStatus, OrderType, ParsedFills, OrderV1, TwapFill, Order } from "../types";
import BN from "bignumber.js";
import { amountUi, eqIgnoreCase, getExchanges } from "../utils";
import { THE_GRAPH_ORDERS_API } from "../consts";
import { getEstimatedDelayBetweenChunksMillis } from "../lib";
type RawStatus = "CANCELED" | "COMPLETED" | null;

const normalizeSubgraphList = <T>(list?: T[], transform?: (val: T) => string) => (list && list.length ? list.map(transform || ((v) => `${v}`)) : undefined);

const getTheGraphUrl = (chainId?: number) => {
  if (!chainId) return;
  return THE_GRAPH_ORDERS_API[chainId as keyof typeof THE_GRAPH_ORDERS_API];
};

type GraphQLPageFetcher<T> = (page: number, limit: number) => string;

const fetchWithRetryPaginated = async <T>({
  chainId,
  buildQuery,
  extractResults,
  signal,
  retries = 1,
  limit = 1000,
  page: _page,
}: {
  chainId: number;
  buildQuery: GraphQLPageFetcher<T>;
  extractResults: (response: any) => T[];
  signal?: AbortSignal;
  retries?: number;
  limit?: number;
  page?: number;
}): Promise<T[]> => {
  const endpoint = getTheGraphUrl(chainId);
  if (!endpoint) throw new NoGraphEndpointError();

  const fetchPage = async (query: string): Promise<T[]> => {
    let attempts = 0;
    while (attempts <= retries) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body: JSON.stringify({ query }),
          signal,
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const json = await res.json();
        if (json.errors) {
          throw new Error(json.errors[0].message);
        }

        return extractResults(json);
      } catch (err) {
        if (attempts === retries) throw err;
        await new Promise((r) => setTimeout(r, 500 * 2 ** attempts));
        attempts++;
      }
    }
    return []; // should never reach here
  };

  let page = 0;
  const results: T[] = [];

  if (_page !== undefined) {
    const query = buildQuery(_page, limit);
    try {
      return await fetchPage(query);
    } catch (err) {
      console.warn(`Page ${_page} failed, retrying one final time...`);
      try {
        return await fetchPage(query);
      } catch (finalErr) {
        return [];
      }
    }
  }

  while (true) {
    const query = buildQuery(page, limit);

    let pageResults: T[];
    try {
      pageResults = await fetchPage(query);
    } catch (err) {
      console.warn(`Page ${page} failed, retrying one final time...`);
      try {
        pageResults = await fetchPage(query); // Final page-level retry
      } catch (finalErr) {
        return results;
      }
    }

    results.push(...pageResults);
    if (pageResults.length < limit) break;

    page++;
  }

  return results;
};

const parseFills = (fills: TwapFill[]): ParsedFills => {
  const initial = {
    dstAmountOut: BN(0),
    srcAmountIn: BN(0),
    dollarValueIn: BN(0),
    dollarValueOut: BN(0),
    dexFee: BN(0),
  };

  const result = fills.reduce(
    (acc, it) => ({
      dstAmountOut: acc.dstAmountOut.plus(BN(it.dstAmountOut || 0)),
      srcAmountIn: acc.srcAmountIn.plus(BN(it.srcAmountIn || 0)),
      dollarValueIn: acc.dollarValueIn.plus(BN(it.dollarValueIn || 0)),
      dollarValueOut: acc.dollarValueOut.plus(BN(it.dollarValueOut || 0)),
      dexFee: acc.dexFee.plus(BN(it.dstFee || 0)),
    }),
    initial,
  );

  return {
    filledDstAmount: result.dstAmountOut.toFixed(),
    filledSrcAmount: result.srcAmountIn.toFixed(),
    filledDollarValueIn: result.dollarValueIn.toFixed(),
    filledDollarValueOut: result.dollarValueOut.toFixed(),
    dexFee: result.dexFee.toFixed(),
  };
};

const getOrderType = (ask_dstMinAmount: string, chunks: number) => {
  const isLimit = BN(ask_dstMinAmount || 0).gt(1);

  if (!isLimit && chunks === 1) {
    return OrderType.TWAP_MARKET;
  }
  if (chunks > 1 && isLimit) {
    return OrderType.TWAP_LIMIT;
  }

  if (isLimit) {
    return OrderType.LIMIT;
  }

  return OrderType.TWAP_MARKET;
};

const isMarketPrice = (type: OrderType) => {
  return type === OrderType.TWAP_MARKET || type === OrderType.TRIGGER_PRICE_MARKET;
};

const buildV1Order = (order: OrderV1, chainId: number, fills: TwapFill[], status: OrderStatus): Order => {
  const { filledDstAmount, filledSrcAmount, filledDollarValueIn, filledDollarValueOut, dexFee } = parseFills(fills || ([] as TwapFill[]));
  const chunks = new BN(order.ask_srcAmount || 0)
    .div(order.ask_srcBidAmount) // Avoid division by zero
    .integerValue(BN.ROUND_FLOOR)
    .toNumber();
  const isFilled = fills?.length === chunks;
  const filledOrderTimestamp = isFilled ? fills?.[fills?.length - 1]?.timestamp : undefined;
  const progress = getV1OrderProgress(order.ask_srcAmount, filledSrcAmount);
  const type = getOrderType(order.ask_dstMinAmount, chunks);
  return {
    version: 1,
    id: order.Contract_id.toString(),
    hash: "",
    type: getOrderType(order.ask_dstMinAmount, chunks),
    srcTokenAddress: order.ask_srcToken,
    dstTokenAddress: order.ask_dstToken,
    exchangeAddress: order.exchange,
    twapAddress: order.twapAddress,
    maker: order.maker,
    progress,
    dstAmountFilled: !fills ? "" : filledDstAmount,
    srcAmountFilled: !fills ? "" : filledSrcAmount,
    orderDollarValueIn: order.dollarValueIn,
    srcAmount: order.ask_srcAmount,
    dollarValueInFilled: !fills ? "" : filledDollarValueIn,
    dollarValueOutFilled: !fills ? "" : filledDollarValueOut,
    feesFilled: !fills ? "" : dexFee,
    dstMinAmountTotal: BN(order.ask_dstMinAmount).multipliedBy(chunks).toString(),
    fills: fills || ([] as TwapFill[]),
    fillDelay: order.ask_fillDelay,
    deadline: order.ask_deadline * 1000,
    createdAt: new Date(order.timestamp).getTime(),
    dstMinAmountPerTrade: BN(order.ask_dstMinAmount).eq(1) ? "" : order.ask_dstMinAmount,
    triggerPricePerTrade: "",
    srcAmountPerTrade: order.ask_srcBidAmount,
    txHash: order.transactionHash,
    totalTradesAmount: chunks,
    isMarketPrice: isMarketPrice(type),
    chainId,
    filledOrderTimestamp: filledOrderTimestamp || 0,
    status,
    rawOrder: order,
  };
};

const getCreatedOrdersFilters = (filters?: GetOrdersFilters) => {
  if (!filters) return "";

  const accounts = normalizeSubgraphList(filters.accounts, (a) => `"${a.toLowerCase()}"`);
  const exchanges = normalizeSubgraphList(getExchanges(filters.configs), (e) => `"${e.toLowerCase()}"`);
  const inTokenSymbols = normalizeSubgraphList(filters.inTokenSymbols, (s) => `"${s.toUpperCase()}"`);
  const outTokenSymbols = normalizeSubgraphList(filters.outTokenSymbols, (s) => `"${s.toUpperCase()}"`);
  const inTokenAddresses = normalizeSubgraphList(filters.inTokenAddresses, (a) => `"${a.toLowerCase()}"`);
  const outTokenAddresses = normalizeSubgraphList(filters.outTokenAddresses, (a) => `"${a.toLowerCase()}"`);
  const transactionHashes = normalizeSubgraphList(filters.transactionHashes, (h) => `"${h.toLowerCase()}"`);
  const orderIds = normalizeSubgraphList(filters.orderIds, (id) => `"${id}"`);
  const twapAddresses = normalizeSubgraphList(
    filters.configs?.map((c) => c.twapAddress),
    (a) => `"${a.toLowerCase()}"`,
  );
  const minDollarValueIn = filters.minDollarValueIn;

  return [
    exchanges ? `exchange_in: [${exchanges.join(", ")}]` : "",
    twapAddresses ? `twapAddress_in: [${twapAddresses.join(", ")}]` : "",
    accounts ? `maker_in: [${accounts.join(", ")}]` : "",
    transactionHashes ? `transactionHash_in: [${transactionHashes.join(", ")}]` : "",
    orderIds ? `Contract_id_in: [${orderIds.join(", ")}]` : "",
    minDollarValueIn ? `dollarValueIn_gte: ${minDollarValueIn}` : "",
    inTokenSymbols ? `srcTokenSymbol_in: [${inTokenSymbols.join(", ")}]` : "",
    outTokenSymbols ? `dstTokenSymbol_in: [${outTokenSymbols.join(", ")}]` : "",
    inTokenAddresses ? `srcTokenAddress_in: [${inTokenAddresses.join(", ")}]` : "",
    outTokenAddresses ? `dstTokenAddress_in: [${outTokenAddresses.join(", ")}]` : "",
    filters?.startDate ? `blockTimestamp_gte: ${filters.startDate}` : "",
    filters?.endDate ? `blockTimestamp_lte: ${filters.endDate}` : "",
    filters?.orderType === "limit" ? `ask_dstMinAmount_gt: 1` : "",
    filters?.orderType === "market" ? `ask_dstMinAmount_lte: 1` : "",
  ]
    .filter(Boolean)
    .join(", ");
};
export async function getCreatedOrders({
  chainId,
  signal,
  page,
  limit: _limit,
  filters,
}: {
  chainId: number;
  signal?: AbortSignal;
  exchanges?: string[];
  page?: number;
  limit?: number;
  filters?: GetOrdersFilters;
}): Promise<OrderV1[]> {
  const limit = _limit || 1000;

  const whereClause = getCreatedOrdersFilters(filters);

  const orders = await fetchWithRetryPaginated<OrderV1>({
    chainId,
    signal,
    limit,
    page,
    buildQuery: (page, limit) => `
      {
        orderCreateds(
          ${whereClause ? `where: { ${whereClause} }` : ""},
          first: ${limit},
          skip: ${page * limit},
          orderBy: timestamp,
          orderDirection: desc,
        ) {
          id
          twapAddress
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
    `,
    extractResults: (json) => json.data?.orderCreateds || [],
  });

  return orders;
}

type GraphStatus = {
  twapId: string;
  twapAddress: string;
  status: RawStatus;
};

export const getStatuses = async ({ chainId, orders, signal }: { chainId: number; orders: OrderV1[]; signal?: AbortSignal }): Promise<GraphStatus[]> => {
  if (orders.length === 0) return [];

  const ids = uniq(orders.map((o) => o.Contract_id.toString()));

  if (!ids.length) return [];

  const formattedIds = ids.map((id) => `"${id}"`).join(", ");

  const where = `where: { twapId_in: [${formattedIds}]}`;

  const statuses = await fetchWithRetryPaginated<GraphStatus>({
    chainId,
    signal,
    limit: 1000,
    buildQuery: (page, limit) => `
      {
        statusNews(
          first: ${limit},
          skip: ${page * limit},
          ${where}
        ) {
          twapId
          twapAddress
          status
        }
      }
    `,
    extractResults: (json) => json.data?.statusNews || [],
  });

  return statuses;
};

export function uniq<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

const getFills = async ({ chainId, orders, signal }: { chainId: number; orders: OrderV1[]; signal?: AbortSignal }) => {
  const ids = uniq(orders.map((o) => o.Contract_id)); // no `.toString()`
  const twapAddresses = uniq(orders.map((o) => o.twapAddress)).filter(Boolean);

  if (ids.length === 0) return [];

  const formattedIds = ids.join(", "); // no quotes
  const formattedTwapAddresses = twapAddresses.map((addr) => `"${addr}"`).join(", ");
  const twapAddressClause = twapAddresses.length ? `twapAddress_in: [${formattedTwapAddresses}]` : "";

  const whereFields = [`TWAP_id_in: [${formattedIds}]`, twapAddressClause].filter(Boolean);
  const where = `where: { ${whereFields.join(", ")} }`;
  const fills = await fetchWithRetryPaginated<TwapFill>({
    chainId,
    signal,
    limit: 1000,
    buildQuery: (page, limit) => `
      {
        orderFilleds(first: ${limit}, orderBy: timestamp, skip: ${page * limit}, ${where}) {
          id
          dstAmountOut
          dstFee
          srcFilledAmount
          twapAddress
          exchange
          TWAP_id
          srcAmountIn
          timestamp
          transactionHash
          dollarValueIn
          dollarValueOut
        }
      }
    `,
    extractResults: (json) =>
      (json.data?.orderFilleds || []).map((it: TwapFill) => ({
        ...it,
        timestamp: new Date(it.timestamp).getTime(),
      })),
  });

  return fills;
};

export class NoGraphEndpointError extends Error {
  constructor() {
    super("No graph endpoint found");
    this.name = "NoGraphEndpointError";
  }
}

export type GetOrdersFilters = {
  transactionHashes?: string[];
  orderIds?: number[];
  accounts?: string[];
  configs?: Config[];
  inTokenSymbols?: string[];
  outTokenSymbols?: string[];
  inTokenAddresses?: string[];
  outTokenAddresses?: string[];
  minDollarValueIn?: number;
  startDate?: number;
  endDate?: number;
  orderType?: "limit" | "market";
};

export const getOrders = async ({
  chainId,
  signal,
  page,
  limit,
  filters,
}: {
  chainId: number;
  signal?: AbortSignal;
  page?: number;
  limit?: number;
  filters?: GetOrdersFilters;
}): Promise<Order[]> => {
  const orders = await getCreatedOrders({ chainId, signal, page, limit, filters });
  const [fills, statuses] = await Promise.all([getFills({ chainId, orders, signal }), getStatuses({ chainId, orders, signal })]);

  const parsedOrders = orders
    .map((o) => {
      const orderFills = fills?.filter((it) => it.TWAP_id === Number(o.Contract_id) && eqIgnoreCase(it.exchange, o.exchange) && eqIgnoreCase(it.twapAddress, o.twapAddress));
      return buildV1Order(o, chainId, orderFills, getStatus(o, orderFills || [], statuses));
    })
    .sort((a, b) => b.createdAt - a.createdAt);
  return parsedOrders;
};

const getStatus = (order: OrderV1, fills: TwapFill[], statuses?: GraphStatus[]): OrderStatus => {
  const status = statuses?.find((it) => it.twapId === order.Contract_id.toString() && eqIgnoreCase(it.twapAddress, order.twapAddress))?.status;
  const { filledSrcAmount } = parseFills(fills);
  const progress = getV1OrderProgress(order.ask_srcAmount, filledSrcAmount);
  return parseOrderStatus(progress, order.ask_deadline * 1000, status);
};

export const getV1OrderProgress = (srcAmount: string, filledSrcAmount: string) => {
  if (!filledSrcAmount || !srcAmount) return 0;
  const progress = BN(filledSrcAmount).dividedBy(srcAmount).toNumber();

  if (progress >= 0.99) return 100;
  if (progress <= 0) return 0;

  return Number((progress * 100).toFixed(2));
};

const parseOrderStatus = (progress: number, deadline: number, status?: RawStatus): OrderStatus => {
  if (progress === 100) return OrderStatus.Completed;
  if (status === "CANCELED") return OrderStatus.Canceled;
  if (status === "COMPLETED") return OrderStatus.Completed;

  if (deadline > Date.now()) return OrderStatus.Open;

  return OrderStatus.Expired;
};
