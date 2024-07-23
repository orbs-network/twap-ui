import BN from "bignumber.js";
import moment from "moment";
import { HistoryOrder, Status } from "./types";
import { groupBy, keyBy } from "./utils";

const getProgress = (srcFilled?: string, srcAmountIn?: string) => {
  if (!srcFilled || !srcAmountIn) return 0;
  let progress = BN(srcFilled || "0")
    .dividedBy(srcAmountIn || "0")
    .toNumber();

  return !progress ? 0 : progress < 0.99 ? progress * 100 : 100;
};

export const graphCreatedOrders = async ({ account, endpoint, signal }: { account: string; endpoint: string; signal?: AbortSignal }) => {
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
  } catch (error) {
   
  }
};

export type ParsedOrder = ReturnType<any>;

const getOrderFills = (orderId: number, fills?: any) => {
  return {
    TWAP_id: Number(orderId),
    dstAmountOut: fills?.reduce((acc: BN, it: any) => acc.plus(BN(it.dstAmountOut)), BN(0)).toString(),
    srcAmountIn: fills?.reduce((acc: BN, it: any) => acc.plus(BN(it.srcAmountIn)), BN(0)).toString(),
    dollarValueIn: fills?.reduce((acc: BN, it: any) => acc.plus(BN(it.dollarValueIn)), BN(0)).toString(),
    dollarValueOut: fills?.reduce((acc: BN, it: any) => acc.plus(BN(it.dollarValueOut)), BN(0)).toString(),
  };
};

const graphOrderFills = async ({ account, endpoint, signal }: { account: string; endpoint: string; signal?: AbortSignal }) => {
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
  let status = statuses?.[order.Contract_id].toLowerCase();

  if (progress === 100 || status === "completed") {
    return Status.Completed;
  }
  if (status === "canceled") {
    return Status.Canceled;
  }

  if (moment(Number(order.ask_deadline)).valueOf() > moment().valueOf() / 1000) {
    return Status.Open;
  }
  return Status.Expired;
};

export const getGraphOrders = async (endpoint: string, account: string, signal?: AbortSignal): Promise<HistoryOrder[]> => {
  const args = { account, endpoint, signal };
  const [orders, fills] = await Promise.all([graphCreatedOrders(args), graphOrderFills(args)]);
  const ids = orders.map((order: any) => order.Contract_id);
  let statuses: any = {};

  try {
    statuses = await getOrderStatuses(ids, endpoint, signal);
  } catch (error) {}
  return orders.map((order: any) => {
    const orderFill = fills[order.Contract_id];

    const progress = getProgress(orderFill?.srcAmountIn, order.ask_srcAmount);
    return {
      id: Number(order.Contract_id),
      exchange: order.exchange,
      dex: order.dex.toLowerCase(),
      deadline: Number(order.ask_deadline),
      createdAt: moment(order.timestamp).unix().valueOf(),
      srcAmount: order.ask_srcAmount,
      dstMinAmount: order.ask_dstMinAmount,
      status: getStatus(progress, order, statuses),
      srcBidAmount: order.ask_srcBidAmount,
      fillDelay: order.ask_fillDelay,
      txHash: order.transactionHash,
      dstAmount: orderFill?.dstAmountOut,
      srcFilledAmount: orderFill?.srcAmountIn,
      dollarValueIn: orderFill?.dollarValueIn,
      dollarValueOut: orderFill?.dollarValueOut,
      progress,
      srcTokenAddress: order.ask_srcToken,
      dstTokenAddress: order.ask_dstToken,
      totalChunks: BN(order.ask_srcAmount || 0)
        .div(order.ask_srcBidAmount || 0)
        .integerValue(BN.ROUND_CEIL)
        .toNumber(),
    };
  });
};
