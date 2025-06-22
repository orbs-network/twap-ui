/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-constant-condition */
import { Config, OrderStatus, OrderType, TwapFill } from "./types";
import BN from "bignumber.js";
import { amountUi, eqIgnoreCase, getExchanges, getTheGraphUrl } from "./utils";
import { getEstimatedDelayBetweenChunksMillis } from "./lib";

type GraphOrder = {
  Contract_id: string | number;
  srcTokenSymbol: string;
  dollarValueIn: string;
  blockNumber: number;
  maker: string;
  dstTokenSymbol: string;
  ask_fillDelay: number;
  exchange: string;
  twapAddress: string;
  dex: string;
  ask_deadline: number;
  timestamp: string;
  ask_srcAmount: string;
  ask_dstMinAmount: string;
  ask_srcBidAmount: string;
  transactionHash: string;
  ask_srcToken: string;
  ask_dstToken: string;
};

type ParsedFills = {
  filledDstAmount: string;
  filledSrcAmount: string;
  filledDollarValueIn: string;
  filledDollarValueOut: string;
  dexFee: string;
};

type OrderFills = {
  id: number;
  fills: TwapFill[];
  twapAddress: string;
  exchange: string;
};
function groupFillsByTWAP(fills: TwapFill[]): OrderFills[] {
  const groupedMap = new Map<number, TwapFill[]>();

  for (const fill of fills) {
    const id = fill.TWAP_id;

    if (!groupedMap.has(id)) {
      groupedMap.set(id, []);
    }
    groupedMap.get(id)!.push(fill);
  }

  return Array.from(groupedMap.entries()).map(([id, fills]) => ({
    id,
    fills,
    twapAddress: fills[0].twapAddress,
    exchange: fills[0].exchange,
  }));
}

type GraphQLPageFetcher<T> = (page: number, limit: number) => string;

const fetchWithRetryPaginated = async <T>({
  chainId,
  buildQuery,
  extractResults,
  signal,
  retries = 1,
  limit = 1000,
}: {
  chainId: number;
  buildQuery: GraphQLPageFetcher<T>;
  extractResults: (response: any) => T[];
  signal?: AbortSignal;
  retries?: number;
  limit?: number;
}): Promise<T[]> => {
  const endpoint = getTheGraphUrl(chainId);
  if (!endpoint) throw new Error("no endpoint found");

  let page = 0;
  const results: T[] = [];

  while (true) {
    const query = buildQuery(page, limit);

    const fetchPage = async (): Promise<T[]> => {
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

    let pageResults: T[];
    try {
      pageResults = await fetchPage();
    } catch (err) {
      console.warn(`Page ${page} failed, retrying one final time...`);
      try {
        pageResults = await fetchPage(); // Final page-level retry
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
    filledDstAmount: result.dstAmountOut.toString(),
    filledSrcAmount: result.srcAmountIn.toString(),
    filledDollarValueIn: result.dollarValueIn.toString(),
    filledDollarValueOut: result.dollarValueOut.toString(),
    dexFee: result.dexFee.toString(),
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
  srcTokenSymbol,
  dstTokenSymbol,
  chainId,
  status: _status,
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
  id: number;
  fillDelay: number;
  createdAt: number;
  txHash: string;
  maker: string;
  exchange: string;
  twapAddress: string;
  srcTokenSymbol: string;
  dstTokenSymbol: string;
  chainId: number;
  status?: RawStatus;
}) => {
  const { filledDstAmount, filledSrcAmount, filledDollarValueIn, filledDollarValueOut, dexFee } = parseFills(fills || ([] as TwapFill[]));
  const chunks = new BN(srcAmount || 0)
    .div(srcAmountPerChunk) // Avoid division by zero
    .integerValue(BN.ROUND_FLOOR)
    .toNumber();
  const type = getOrderType(dstMinAmountPerChunk, chunks);
  const isFilled = fills?.length === chunks;
  const filledDate = isFilled ? fills?.[fills?.length - 1]?.timestamp : undefined;
  const progress = getOrderProgress(srcAmount, filledSrcAmount);
  const status = parseOrderStatusNew(progress, deadline, _status);
  return {
    id,
    type,
    exchange,
    twapAddress,
    maker,
    progress,
    filledDstAmount,
    filledSrcAmount,
    filledDollarValueIn,
    filledDollarValueOut,
    filledFee: dexFee,
    fills,
    srcTokenAddress,
    dstTokenAddress,
    tradeDollarValueIn,
    blockNumber,
    fillDelay,
    deadline,
    createdAt,
    srcAmount,
    dstMinAmountPerChunk: Number(dstMinAmountPerChunk) === 1 ? "0" : dstMinAmountPerChunk,
    srcAmountPerChunk,
    txHash,
    chunks,
    dstMinAmount: Number(dstMinAmountPerChunk) === 1 ? "0" : new BN(dstMinAmountPerChunk).times(chunks).toString(),
    isMarketOrder: type === OrderType.TWAP_MARKET,
    srcTokenSymbol,
    dstTokenSymbol,
    chainId,
    filledDate,
    status,
  };
};
export async function getCreatedOrders({
  chainId,
  account,
  signal,
  exchanges,
}: {
  chainId: number;
  account?: string;
  signal?: AbortSignal;
  exchanges?: string[];
}): Promise<GraphOrder[]> {
  const limit = 1000;

  const exchange = exchanges ? `exchange_in: [${exchanges.join(", ")}]` : "";
  const maker = account ? `maker: "${account}"` : "";

  const where = `where:{${exchange}, ${maker}}`;

  const orders = await fetchWithRetryPaginated<GraphOrder>({
    chainId,
    signal,
    limit,
    buildQuery: (page, limit) => `
      {
        orderCreateds(
          first: ${limit},
          skip: ${page * limit},
          orderBy: timestamp,
          orderDirection: desc,
          ${where}
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

export const getUserOrdersForDEX = async ({ dexConfig, account: _account, signal }: { dexConfig: Config; account: string; signal?: AbortSignal }) => {
  return getOrders({ chainId: dexConfig.chainId, account: _account, signal, exchanges: getExchanges(dexConfig) });
};

export const getUserOrdersForChain = async ({ chainId, account: _account, signal }: { chainId: number; account: string; signal?: AbortSignal }) => {
  return getOrders({ chainId, account: _account, signal });
};

export const getAllOrdersForChain = async ({ chainId, signal }: { chainId: number; signal?: AbortSignal }) => {
  return getOrders({ chainId, signal });
};

export const getAllOrdersForDEX = async ({ dexConfig, signal }: { dexConfig: Config; signal?: AbortSignal }) => {
  return getOrders({ chainId: dexConfig.chainId, signal, exchanges: getExchanges(dexConfig) });
};

type GraphStatus = {
  twapId: string;
  twapAddress: string;
  status: RawStatus;
};

export const getStatuses = async ({ chainId, orders, signal }: { chainId: number; orders: GraphOrder[]; signal?: AbortSignal }): Promise<GraphStatus[]> => {
  const ids = orders.map((o) => `"${o.Contract_id}"`).join(", ");
  const addresses = orders.map((o) => `"${o.twapAddress}"`).join(", ");

  const where = `where: { twapId_in: [${ids}], twapAddress_in: [${addresses}] }`;

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
const getFills = async ({ chainId, orders, signal, exchanges }: { chainId: number; orders: GraphOrder[]; signal?: AbortSignal; exchanges?: string[] }) => {
  const ids = orders.map((rawOrder) => rawOrder.Contract_id.toString()).join(", ");
  const exchange = exchanges ? `exchange_in: [${exchanges}]` : "";
  const where = `where: { TWAP_id_in: [${ids}], ${exchange} }`;

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

  return groupFillsByTWAP(fills);
};

const getOrders = async ({ chainId, account: _account, signal, exchanges }: { chainId: number; account?: string; signal?: AbortSignal; exchanges?: string[] }) => {
  const account = _account?.toLowerCase();
  const orders = await getCreatedOrders({ chainId, account, signal, exchanges });
  const fills = await getFills({ chainId, orders, signal, exchanges });
  const statuses = await getStatuses({ chainId, orders, signal });

  const parsedOrders = orders
    .map((o) => {
      const orderFills = fills?.find((it) => it.id === Number(o.Contract_id) && eqIgnoreCase(it.exchange, o.exchange) && eqIgnoreCase(it.twapAddress, o.twapAddress));

      return buildOrder({
        fills: orderFills?.fills,
        srcAmount: o.ask_srcAmount,
        srcTokenAddress: o.ask_srcToken,
        dstTokenAddress: o.ask_dstToken,
        srcAmountPerChunk: o.ask_srcBidAmount,
        deadline: o.ask_deadline * 1000,
        dstMinAmountPerChunk: o.ask_dstMinAmount,
        tradeDollarValueIn: o.dollarValueIn,
        blockNumber: o.blockNumber,
        id: Number(o.Contract_id),
        fillDelay: o.ask_fillDelay,
        createdAt: new Date(o.timestamp).getTime(),
        txHash: o.transactionHash,
        maker: o.maker,
        exchange: o.exchange,
        twapAddress: o.twapAddress,
        srcTokenSymbol: o.srcTokenSymbol,
        dstTokenSymbol: o.dstTokenSymbol,
        chainId,
        status: statuses.find((it) => it.twapId === o.Contract_id.toString() && eqIgnoreCase(it.twapAddress, o.twapAddress))?.status as RawStatus,
      });
    })
    .sort((a, b) => b.createdAt - a.createdAt);
  return parsedOrders;
};

const getOrderProgress = (srcAmount: string, filledSrcAmount: string) => {
  if (!filledSrcAmount || !srcAmount) return 0;
  const progress = BN(filledSrcAmount).dividedBy(srcAmount).toNumber();

  if (progress >= 0.99) return 100;
  if (progress <= 0) return 0;

  return progress * 100;
};

const parseOrderStatusNew = (progress: number, deadline: number, status?: RawStatus): OrderStatus => {
  if (progress === 100) return OrderStatus.Completed;
  if (status === "CANCELED") return OrderStatus.Canceled;
  if (status === "COMPLETED") return OrderStatus.Completed;

  if (deadline > Date.now()) return OrderStatus.Open;

  return OrderStatus.Expired;
};

export const parseOrderStatus = (progress: number, status?: number): OrderStatus => {
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
