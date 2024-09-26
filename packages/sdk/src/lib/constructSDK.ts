import { Analytics } from "./analytics";
import { getCreateOrderArgs, getSwapValues } from "./lib";
import { getOrders, groupOrdersByStatus } from "./orders";
import { Config, GetAskValuesArgs, GetSwapValuesArgs, Order } from "./types";

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
  onCancelOrderSuccess: analytics.onCancelOrder.bind(analytics),
  onCancelOrderError: analytics.onCancelOrder.bind(analytics),
};

class SDK {
  public config: Config;
  public analytics = analyticsCallback;
  constructor(props: Props) {
    this.config = props.config;
    analytics.onConfigChange(props.config);
  }

  getCreateOrderArgs(props: GetAskValuesArgs) {
    return getCreateOrderArgs(props, this.config);
  }
  getSwapValues(props: GetSwapValuesArgs) {
    return getSwapValues(props, this.config);
  }
  getOrders(account: string, signal?: AbortSignal) {
    return getOrders(this.config, account, signal);
  }
  groupOrdersByStatus(orders: Order[]) {
    return groupOrdersByStatus(orders);
  }
}

export const constructSDK = (props: Props) => {
  return new SDK(props);
};
