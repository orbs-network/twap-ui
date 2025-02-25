import { Analytics } from "./analytics";
import { getEstimatedDelayBetweenChunksMillis, derivedSwapValues, prepareOrderArgs, getDeadline } from "./lib";
import { addCancelledOrder, addNewOrder, getOrders, RawOrder } from "./orders";
import { Config, DerivedSwapValuesArgs, PrepareOrderArgs, TimeDuration } from "./types";

interface Props {
  config: Config;
  minChunkSizeUsd?: number;
}

const analytics = new Analytics();

const analyticsCallback = {
  onApproveRequest: analytics.onApproveRequest.bind(analytics),
  onApproveSuccess: analytics.onApproveSuccess.bind(analytics),
  onApproveError: analytics.onApproveError.bind(analytics),
  onWrapRequest: analytics.onWrapRequest.bind(analytics),
  onWrapSuccess: analytics.onWrapSuccess.bind(analytics),
  onWrapError: analytics.onWrapError.bind(analytics),
  onCreateOrderRequest: analytics.onCreateOrderRequest.bind(analytics),
  onCreateOrderSuccess: analytics.onCreateOrderSuccess.bind(analytics),
  onCreateOrderError: analytics.onCreateOrderError.bind(analytics),
  onCancelOrderRequest: analytics.onCancelOrder.bind(analytics),
  onCancelOrderSuccess: analytics.onCancelOrderSuccess.bind(analytics),
  onCancelOrderError: analytics.onCanelOrderError.bind(analytics),
};

export class TwapSDK {
  public config: Config;
  public analytics = analyticsCallback;
  public estimatedDelayBetweenChunksMillis: number;
  constructor(props: Props) {
    this.config = props.config;
    analytics.onConfigChange(props.config);
    this.estimatedDelayBetweenChunksMillis = getEstimatedDelayBetweenChunksMillis(this.config);
  }

  prepareOrderArgs(props: PrepareOrderArgs) {
    return prepareOrderArgs(this.config, props);
  }

  derivedSwapValues(props: DerivedSwapValuesArgs) {
    return derivedSwapValues(this.config, props);
  }
  orderDeadline(currentTimeMillis: number, duration: TimeDuration) {
    return getDeadline(currentTimeMillis, duration);
  }

  async getUserOrders({ account, signal, page, limit }: { account: string; signal?: AbortSignal; page?: number; limit?: number }) {
    return getOrders({ chainId: this.config.chainId, config: this.config, account, signal, page, limit });
  }

  async addNewOrder(account: string, rawOrder: RawOrder) {
    return addNewOrder(account, this.config.exchangeAddress, rawOrder);
  }

  async addCancelledOrder(account: string, orderId: number) {
    return addCancelledOrder(account, this.config.exchangeAddress, orderId);
  }
}

export const constructSDK = (props: Props) => {
  return new TwapSDK(props);
};
