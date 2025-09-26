/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-constant-condition */
import { Config, OrderStatus, OrderType, ParsedFills, RawOrder, TwapFill, SinkOrder } from "./types";
import BN from "bignumber.js";
import { amountUi, eqIgnoreCase, getExchanges, getTheGraphUrl, normalizeSubgraphList } from "./utils";
import { getEstimatedDelayBetweenChunksMillis } from "./lib";
import { API_ENDPOINT } from "./consts";

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

export type Order = ReturnType<typeof buildOrder>;

const getOrderType = (dstMinAmount: string, chunks: number) => {
  const isLimit = BN(dstMinAmount || 0).gt(1);
  const isTwap = chunks > 1;
  if (isTwap && chunks === 1) {
    return OrderType.TWAP_MARKET;
  }
  if (isTwap && isLimit) {
    return OrderType.TWAP_LIMIT;
  }

  if (isLimit) {
    return OrderType.LIMIT;
  }

  return OrderType.TWAP_MARKET;
};

export const getOrderExcecutionRate = (order: Order, srcTokenDecimals: number, dstTokenDecimals: number) => {
  if (!BN(order.filledSrcAmount || 0).gt(0) || !BN(order.filledDstAmount || 0).gt(0)) return "";
  const srcFilledAmountUi = amountUi(srcTokenDecimals, order.filledSrcAmount);
  const dstFilledAmountUi = amountUi(dstTokenDecimals, order.filledDstAmount);

  return BN(dstFilledAmountUi).div(srcFilledAmountUi).toFixed();
};

export const getOrderLimitPriceRate = (order: Order, srcTokenDecimals: number, dstTokenDecimals: number) => {
  if (order.type === OrderType.TWAP_MARKET) {
    return getOrderExcecutionRate(order, srcTokenDecimals, dstTokenDecimals);
  }
  const srcBidAmountUi = amountUi(srcTokenDecimals, order.srcAmountPerChunk);
  const dstMinAmountUi = amountUi(dstTokenDecimals, order.dstMinAmountPerChunk);
  return BN(dstMinAmountUi).div(srcBidAmountUi).toFixed();
};

type RawStatus = "CANCELED" | "COMPLETED" | null;

export const buildOrder = ({
  fills,
  srcAmount,
  srcTokenAddress,
  dstTokenAddress,
  srcAmountPerChunk = "1",
  deadline,
  dstMinAmountPerChunk,
  tradeDollarValueIn,
  blockNumber,
  id,
  fillDelay,
  createdAt,
  txHash,
  maker,
  exchange,
  twapAddress,
  chainId,
  status,
  filledSrcAmount: _filledSrcAmount,
  srcTokenSymbol,
  dstTokenSymbol,
}: {
  fills?: TwapFill[];
  srcAmount: string;
  srcTokenAddress: string;
  dstTokenAddress: string;
  srcAmountPerChunk: string;
  deadline: number;
  dstMinAmountPerChunk: string;
  tradeDollarValueIn: string;
  blockNumber?: number;
  id: string;
  fillDelay: number;
  createdAt: number;
  txHash: string;
  maker: string;
  exchange: string;
  twapAddress: string;
  chainId: number;
  status: OrderStatus;
  filledSrcAmount?: string;
  srcTokenSymbol?: string;
  dstTokenSymbol?: string;
}) => {
  const { filledDstAmount, filledSrcAmount: filledSrcAmountFromFills, filledDollarValueIn, filledDollarValueOut, dexFee } = parseFills(fills || ([] as TwapFill[]));
  const chunks = new BN(srcAmount || 0)
    .div(srcAmountPerChunk) // Avoid division by zero
    .integerValue(BN.ROUND_FLOOR)
    .toNumber();
  const type = getOrderType(dstMinAmountPerChunk, chunks);
  const isFilled = fills?.length === chunks;
  const filledDate = isFilled ? fills?.[fills?.length - 1]?.timestamp : undefined;
  const filledSrcAmount = _filledSrcAmount || filledSrcAmountFromFills;
  const progress = getOrderProgress(srcAmount, filledSrcAmount);
  return {
    id,
    type,
    exchange,
    twapAddress,
    maker,
    progress,
    filledDstAmount: !fills ? "" : filledDstAmount,
    filledSrcAmount,
    filledDollarValueIn: !fills ? "" : filledDollarValueIn,
    filledDollarValueOut: !fills ? "" : filledDollarValueOut,
    filledFee: !fills ? "" : dexFee,
    fills,
    srcTokenAddress,
    dstTokenAddress,
    tradeDollarValueIn,
    blockNumber,
    fillDelay,
    deadline,
    createdAt,
    srcAmount,
    dstMinAmountPerChunk: Number(dstMinAmountPerChunk) === 1 ? "" : dstMinAmountPerChunk,
    srcAmountPerChunk,
    txHash,
    chunks,
    dstMinAmount: Number(dstMinAmountPerChunk) === 1 ? "" : new BN(dstMinAmountPerChunk).times(chunks).toString(),
    isMarketOrder: type === OrderType.TWAP_MARKET,
    chainId,
    filledDate,
    status,
    srcTokenSymbol,
    dstTokenSymbol,
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
  const minDollarValueIn = filters.minDollarValueIn;

  return [
    exchanges ? `exchange_in: [${exchanges.join(", ")}]` : "",
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
}): Promise<RawOrder[]> {
  const limit = _limit || 1000;

  const whereClause = getCreatedOrdersFilters(filters);

  const orders = await fetchWithRetryPaginated<RawOrder>({
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

export const getStatuses = async ({ chainId, orders, signal }: { chainId: number; orders: RawOrder[]; signal?: AbortSignal }): Promise<GraphStatus[]> => {
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

const getFills = async ({ chainId, orders, signal }: { chainId: number; orders: RawOrder[]; signal?: AbortSignal }) => {
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

export const getOrdersFromGraph = async ({
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

      return buildOrder({
        fills: orderFills,
        srcAmount: o.ask_srcAmount,
        srcTokenAddress: o.ask_srcToken,
        dstTokenAddress: o.ask_dstToken,
        srcAmountPerChunk: o.ask_srcBidAmount,
        deadline: o.ask_deadline * 1000,
        dstMinAmountPerChunk: o.ask_dstMinAmount,
        tradeDollarValueIn: o.dollarValueIn,
        blockNumber: o.blockNumber,
        id: o.Contract_id.toString(),
        fillDelay: o.ask_fillDelay,
        createdAt: new Date(o.timestamp).getTime(),
        txHash: o.transactionHash,
        maker: o.maker,
        exchange: o.exchange,
        twapAddress: o.twapAddress,
        chainId,
        status: getStatus(o, orderFills || [], statuses),
        srcTokenSymbol: o.srcTokenSymbol,
        dstTokenSymbol: o.dstTokenSymbol,
      });
    })
    .sort((a, b) => b.createdAt - a.createdAt);
  return parsedOrders;
};

const getStatus = (order: RawOrder, fills: TwapFill[], statuses?: GraphStatus[]): OrderStatus => {
  const status = statuses?.find((it) => it.twapId === order.Contract_id.toString() && eqIgnoreCase(it.twapAddress, order.twapAddress))?.status;
  const { filledSrcAmount } = parseFills(fills);
  const progress = getOrderProgress(order.ask_srcAmount, filledSrcAmount);
  return parseOrderStatus(progress, order.ask_deadline * 1000, status);
};

export const getOrderProgress = (srcAmount: string, filledSrcAmount: string) => {
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

export const parseRawStatus = (progress: number, status?: number): OrderStatus => {
  if (progress === 100) return OrderStatus.Completed;
  if (status && status > Date.now() / 1000) return OrderStatus.Open;

  switch (status) {
    case 1:
      return OrderStatus.Canceled;
    case 2:
      return OrderStatus.Completed;
    default:
      return OrderStatus.Expired;
  }
};

export const getOrderFillDelayMillis = (order: Order, config: Config) => {
  return (order.fillDelay || 0) * 1000 + getEstimatedDelayBetweenChunksMillis(config);
};

export const buildSinkOrder = (order: SinkOrder) => {
  return buildOrder({
    id: order.hash,
    srcAmount: order.order.witness.input.maxAmount,
    srcTokenAddress: order.order.witness.input.token,
    dstTokenAddress: order.order.witness.output.token,
    srcAmountPerChunk: order.order.witness.input.amount,
    deadline: Number(order.order.deadline) * 1000,
    dstMinAmountPerChunk: order.order.witness.output.maxAmount,
    tradeDollarValueIn: "",
    fillDelay: Number(order.order.witness.epoch),
    createdAt: new Date(order.timestamp).getTime(),
    txHash: order.hash,
    maker: order.order.witness.info.swapper,
    exchange: "",
    twapAddress: "",
    chainId: Number(order.order.witness.chainId),
    status: OrderStatus.Open,
    srcTokenSymbol: "",
    dstTokenSymbol: "",
  });
};

export const getSinkOrders = async ({ chainId, signal, account }: { chainId: number; signal?: AbortSignal; account?: string }): Promise<Order[]> => {
  if (!account) return [];
  const response = await fetch(`${API_ENDPOINT}/orders?swapper=${account}&chainId=${chainId}`, {
    signal,
  });

  const payload = (await response.json()) as { orders: SinkOrder[] };

  return payload.orders.map(buildSinkOrder);
};

export const getUserOrders = async ({
  signal,
  page,
  limit,
  config,
  account,
}: {
  signal?: AbortSignal;
  page?: number;
  limit?: number;
  config: Config;
  account: string;
}): Promise<Order[]> => {
  return Promise.all([
    getOrdersFromGraph({ chainId: config.chainId, signal, page, limit, filters: { accounts: [account] } }),
    getSinkOrders({ chainId: config.chainId, signal, account }),
  ]).then(([graphOrders, apiOrders]) => {
    return [...graphOrders, ...apiOrders];
  });
};
