/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-constant-condition */
import { OrderStatus, OrderType, OrderV2, Order } from "../types";
import BN from "bignumber.js";
import { API_ENDPOINT } from "../consts";

const getOrderType = (order: OrderV2) => {
  const isLimit = BN(order.order.witness.output.limit || 0).gt(1);
  const isTriggerPrice = BN(order.order.witness.output.stop || 0).gt(0);
  const chunks = order.metadata.chunks?.length || 0;

  if (isTriggerPrice && isLimit) {
    return OrderType.TRIGGER_PRICE_LIMIT;
  }

  if (isTriggerPrice) {
    return OrderType.TRIGGER_PRICE_MARKET;
  }

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

const getProgress = (order: OrderV2) => {
  const successChunks = order.metadata.chunks?.filter((chunk) => chunk.status === "success").length || 0;
  const totalChunks = order.metadata.chunks?.length || 0;
  const progress = BN(successChunks).dividedBy(totalChunks).toNumber();

  if (progress >= 0.99) return 100;
  if (progress <= 0) return 0;

  return Number((progress * 100).toFixed(2));
};

const OPEN_STATUS = ["pending", "eligible"];

const getStatus = (order: OrderV2) => {
  if (order.metadata.status === "completed") return OrderStatus.Completed;
  if (OPEN_STATUS.includes(order.metadata.status)) return OrderStatus.Open;
  if (order.metadata.description.toLowerCase() === "cancelled by contract") return OrderStatus.Canceled;

  return OrderStatus.Expired;
};

export const buildV2Order = (order: OrderV2): Order => {
  return {
    id: order.hash,
    hash: order.hash,
    version: 2,
    type: getOrderType(order),
    maker: order.order.witness.swapper,
    progress: getProgress(order),
    srcAmountFilled: "",
    dstAmountFilled: "",
    dollarValueInFilled: "",
    dollarValueOutFilled: "",
    feesFilled: "",
    fills: [],
    srcTokenAddress: order.order.witness.input.token,
    dstTokenAddress: order.order.witness.output.token,
    orderDollarValueIn: "",
    fillDelay: order.order.witness.epoch,
    deadline: Number(order.order.deadline) * 1000,
    createdAt: new Date(order.timestamp).getTime(),
    srcAmount: order.order.witness.input.maxAmount,
    dstMinAmountPerTrade: Number(order.order.witness.output.limit) === 1 ? "" : order.order.witness.output.limit,
    triggerPricePerTrade: BN(order.order.witness.output.stop || 0).isZero() ? "" : order.order.witness.output.stop,
    srcAmountPerTrade: order.order.witness.input.amount,
    txHash: "",
    totalTradesAmount: order.metadata.chunks?.length || 0,
    isMarketPrice: false,
    chainId: order.order.witness.chainid,
    filledOrderTimestamp: 0,
    status: getStatus(order),
  };
};

export const getOrders = async ({ chainId, signal, account }: { chainId: number; signal?: AbortSignal; account?: string }): Promise<Order[]> => {
  if (!account) return [];
  const response = await fetch(`${API_ENDPOINT}/orders?swapper=${account}&chainId=${chainId}`, {
    signal,
  });

  const payload = (await response.json()) as { orders: OrderV2[] };

  return payload.orders.map(buildV2Order);
};
