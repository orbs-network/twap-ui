import { Analytics } from "./analytics";
import { getEstimatedDelayBetweenChunksMillis, derivedSwapValues, prepareOrderArgs, getDeadline } from "./lib";
import { getOrders, waitForCancelledOrder, waitForNewOrder, waitForOrdersUpdate } from "./orders";
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
  public minChunkSizeUsd: number;
  constructor(props: Props) {
    this.config = props.config;
    analytics.onConfigChange(props.config);
    this.estimatedDelayBetweenChunksMillis = getEstimatedDelayBetweenChunksMillis(this.config);
    this.minChunkSizeUsd = props.minChunkSizeUsd || props.config.minChunkSizeUsd;
  }

  prepareOrderArgs(props: PrepareOrderArgs) {
    return prepareOrderArgs(this.config, props);
  }

  derivedSwapValues(props: DerivedSwapValuesArgs) {
    return derivedSwapValues(this.config, this.minChunkSizeUsd, props);
  }
  orderDeadline(currentTimeMillis: number, duration: TimeDuration) {
    return getDeadline(currentTimeMillis, duration);
  }

  async getUserOrders({ account, signal, page, limit }: { account: string; signal?: AbortSignal; page?: number; limit?: number }) {
    return getOrders({ chainId: this.config.chainId, exchangeAddress: this.config.exchangeAddress, account, signal, page, limit });
  }

  async waitForNewOrder({ orderId, account, signal, currentOrdersLength }: { orderId?: number; account: string; signal?: AbortSignal; currentOrdersLength?: number }) {
    return waitForNewOrder({ config: this.config, orderId, account, signal, currentOrdersLength });
  }

  async waitForCancelledOrder({ orderId, account, signal }: { orderId?: number; account: string; signal?: AbortSignal }) {
    return waitForCancelledOrder({ config: this.config, orderId, account, signal });
  }
}

export const constructSDK = (props: Props) => {
  return new TwapSDK(props);
};
