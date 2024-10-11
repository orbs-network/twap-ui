import { Analytics } from "./analytics";
import { getEstimatedDelayBetweenChunksMillis, derivedSwapValues, prepareOrderArgs } from "./lib";
import { getOrders, waitForOrdersUpdate } from "./orders";
import { Config, DerivedSwapValuesArgs, PrepareOrderArgs } from "./types";

interface Props {
  config: Config;
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
  onCancelOrderError: analytics.onCancelOrder.bind(analytics),
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

  async getOrders(account: string, signal?: AbortSignal) {
    return getOrders(this.config, account, signal);
  }
  async waitForOrdersUpdate(orderId: number, account: string, signal?: AbortSignal) {
    return waitForOrdersUpdate(this.config, orderId, account, signal);
  }
}

export const constructSDK = (props: Props) => {
  return new TwapSDK(props);
};
