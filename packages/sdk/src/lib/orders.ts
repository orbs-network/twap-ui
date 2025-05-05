import { Config, OrderStatus, OrderType } from "./types";
import BN from "bignumber.js";
import { amountUi, getTheGraphUrl } from "./utils";
import { getEstimatedDelayBetweenChunksMillis } from "./lib";
import { LEGACY_EXCHANGES_MAP } from "./consts";

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

type GraphFill = {
  TWAP_id: number;
  dollarValueIn: string;
  dollarValueOut: string;
  dstAmountOut: string;
  dstFee: string;
  id: string;
  srcAmountIn: string;
  srcFilledAmount: string;
  timestamp: string;
  twapAddress: string;
  exchange: string;
};

type OrderFills = {
  id: number;
  fills: GraphFill[];
  twapAddress: string;
  exchange: string;
};
function groupFillsByTWAP(fills: GraphFill[]): OrderFills[] {
  const groupedMap = new Map<number, GraphFill[]>();

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

const parseFills = (fills: GraphFill[]): ParsedFills => {
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

export class Orders {
  private exchanges: string;
  private endpoint: string;
  constructor(private readonly config: Config) {
    this.exchanges = [this.config.exchangeAddress, ...(LEGACY_EXCHANGES_MAP[this.config.name] || [])].map((a) => `"${a.toLowerCase()}"`).join(", ");
    this.endpoint = getTheGraphUrl(this.config.chainId)!;
  }

  private async getCreatedOrders(account: string, signal?: AbortSignal): Promise<GraphOrder[]> {
    const limit = 1_000;
    const exchange = `exchange_in: [${this.exchanges}]`;
    const maker = `maker: "${account}"`;

    const where = `where:{${exchange}, ${maker}}`;

    const orders: GraphOrder[] = [];
    let page = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const query = `
        {
          orderCreateds(
            first: ${limit},
            orderBy: timestamp,
            orderDirection: desc,
            skip: ${page * limit},
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
      `;

      const payload = await fetch(this.endpoint, {
        method: "POST",
        body: JSON.stringify({ query }),
        signal,
      });

      const response = await payload.json();
      const orderCreateds = response.data.orderCreateds;

      orders.push(...orderCreateds);

      if (orderCreateds.length < limit) {
        break; // No more orders to fetch
      }

      page++;
    }

    return orders;
  }

  private async getFills(ids: string[], signal?: AbortSignal) {
    const LIMIT = 1_000;
    let page = 0;
    const where = `where: { TWAP_id_in: [${ids.join(", ")}], exchange_in: [${this.exchanges}] }`;

    const fills = [];
    const dexFee = this.config.chainId === 56 ? "dexFee" : "";
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const query = `
      {
        orderFilleds(first: ${LIMIT}, orderBy: timestamp, skip: ${page * LIMIT}, ${where}) {
          id
          dstAmountOut
          dstFee
          srcFilledAmount
          twapAddress
          exchange
          TWAP_id
          srcAmountIn
          timestamp
          dollarValueIn
          dollarValueOut,
          ${dexFee}
        }
      }
    `;

      const payload = await fetch(this.endpoint, {
        method: "POST",
        body: JSON.stringify({ query }),
        signal,
      });
      const response = await payload.json();

      const groupedFills = groupFillsByTWAP(response.data.orderFilleds);

      fills.push(...groupedFills);
      if (groupedFills.length < LIMIT) break;
      page++;
    }

    return fills;
  }

  public async getOrders(account: string, signal?: AbortSignal) {
    const endpoint = getTheGraphUrl(this.config.chainId);
    if (!endpoint) {
      throw new Error("no endpoint found");
    }
    const createdOrders = await this.getCreatedOrders(account.toLowerCase(), signal);

    const ids = createdOrders.map((rawOrder) => rawOrder.Contract_id.toString());
    const allFills = await this.getFills(ids, signal);

    const parsedOrders = createdOrders.map((o) => {
      const fills = allFills?.find((it) => it.id === Number(o.Contract_id) && it.exchange === o.exchange && it.twapAddress === o.twapAddress);
      return buildOrder({
        fills: fills?.fills,
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
      });
    });
    return parsedOrders;
  }
}
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
}: {
  fills?: GraphFill[];
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
}) => {
  const { filledDstAmount, filledSrcAmount, filledDollarValueIn, filledDollarValueOut, dexFee } = parseFills(fills || ([] as GraphFill[]));
  const chunks = new BN(srcAmount || 0)
    .div(srcAmountPerChunk) // Avoid division by zero
    .integerValue(BN.ROUND_FLOOR)
    .toNumber();
  const type = getOrderType(dstMinAmountPerChunk, chunks);
  return {
    id,
    type,
    exchange,
    twapAddress,
    maker,
    progress: getOrderProgress(srcAmount, filledSrcAmount),
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
  };
};

const getOrderProgress = (srcAmount: string, filledSrcAmount: string) => {
  if (!filledSrcAmount || !srcAmount) return 0;
  const progress = BN(filledSrcAmount).dividedBy(srcAmount).toNumber();

  if (progress >= 0.99) return 100;
  if (progress <= 0) return 0;

  return progress * 100;
};

export const parseOrderStatus = (progress: number, status?: number) => {
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

export const getOrderFillDelay = (fillDelay: number, config: Config) => {
  return (fillDelay || 0) * 1000 + getEstimatedDelayBetweenChunksMillis(config);
};
