import BigNumber from "bignumber.js";
import { useTwapStore } from "./store";

enum Category {
  Error = "Error",
  TWAPPanel = "TWAPPanel",
  OrdersPanel = "OrdersPanel",
  ConfirmationPanel = "ConfirmationPanel",
  PageView = "onTwapPageView",
}

const onLimitToggleClick = (isLimitOrder: boolean) => {
  sendAnalyticsEvent(Category.TWAPPanel, "onLimitToggleClick", isLimitOrder);
};

const onSrcTokenClick = (symbol?: string) => {
  sendAnalyticsEvent(Category.TWAPPanel, `onSrcTokenClick`, symbol);
};

const onDstTokenClick = (symbol?: string) => {
  sendAnalyticsEvent(Category.TWAPPanel, `onDstTokenClick`, symbol);
};

const onCustomIntervalClick = () => {
  sendAnalyticsEvent(Category.TWAPPanel, "onCustomIntervalClick");
};

const onApproveClick = (amount: BigNumber) => {
  sendAnalyticsEvent(Category.TWAPPanel, "onApproveClick", amount.toString());
};

const onApproveSuccess = () => {
  sendAnalyticsEvent(Category.TWAPPanel, "onApproveSuccess");
};

const onWrapClick = (amount: BigNumber) => {
  sendAnalyticsEvent(Category.TWAPPanel, "onWrapClick", amount.toString());
};

const onWrapSuccess = () => {
  sendAnalyticsEvent(Category.TWAPPanel, "onWrapSuccess");
};

const onPlaceOrderClick = () => {
  sendAnalyticsEvent(Category.TWAPPanel, `onPlaceOrderClick`);
};

const onConfirmationCreateOrderClick = () => {
  const lib = useTwapStore.getState().lib;

  sendAnalyticsEvent(Category.ConfirmationPanel, `onConfirmationCreateOrderClick`, {
    config: lib?.config,
    exchangeAddress: lib?.config.exchangeAddress,
    srcToken: useTwapStore.getState().srcToken?.address,
    dstToken: useTwapStore.getState().dstToken?.address,
    srcTokenAmount: useTwapStore.getState().getSrcAmount(),
    tradeSize: useTwapStore.getState().getSrcChunkAmount(),
    minAmountOut: useTwapStore.getState().getDstMinAmountOut(),
    deadline: useTwapStore.getState().getDeadline(),
    tradeInterval: useTwapStore.getState().getFillDelayMillis(),
    totalTrades: useTwapStore.getState().getChunks(),
  });
};

const onODNPClick = () => {
  sendAnalyticsEvent(Category.OrdersPanel, "onODNPClick");
};

const onModuleLoad = () => {
  sendAnalyticsEvent(Category.PageView, "onModuleLoad");
};

const onTwapPageView = () => {
  sendAnalyticsEvent(Category.PageView, "onTwapPageView");
};

const onCreateOrderSuccess = () => {
  sendAnalyticsEvent(Category.ConfirmationPanel, `onCreateOrderSuccess`);
};

const onCreateOrderError = (message: string) => {
  sendAnalyticsEvent(Category.Error, `onCreateOrderError`, message);
};

const onWrapError = (message: string) => {
  sendAnalyticsEvent(Category.Error, "onWrapError", message);
};

const onApproveError = (message: string) => {
  sendAnalyticsEvent(Category.Error, "onApproveError", message);
};

const onCancelOrderClick = (orderId: number) => {
  sendAnalyticsEvent(Category.OrdersPanel, "onCancelOrderClick", orderId);
};

const onCancelOrderSuccess = (orderId: string) => {
  sendAnalyticsEvent(Category.OrdersPanel, "onCancelOrderSuccess", orderId);
};

const onCancelOrderError = (error: string) => {
  sendAnalyticsEvent(Category.Error, `onCancelOrderError`, error);
};

const onCreateOrderRejected = () => {
  sendAnalyticsEvent(Category.Error, `onCreateOrderRejected`);
};

const sendAnalyticsEvent = (category: Category, action: string, data?: any) => {
  const lib = useTwapStore.getState().lib;

  fetch("https://bi.orbs.network/putes/twap-ui", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      maker: lib?.maker,
      userAgent: navigator.userAgent.toString(),
      partner: lib?.config.partner,
      chain: lib?.config.chainId,
      category,
      action,
      data,
    }),
  }).catch();
};

export const analytics = {
  onLimitToggleClick,
  onSrcTokenClick,
  onDstTokenClick,
  onCustomIntervalClick,
  onApproveClick,
  onApproveSuccess,
  onWrapClick,
  onWrapSuccess,
  onPlaceOrderClick,
  onConfirmationCreateOrderClick,
  onODNPClick,
  onCreateOrderSuccess,
  onCreateOrderError,
  onWrapError,
  onApproveError,
  onCancelOrderClick,
  onCancelOrderSuccess,
  onCancelOrderError,
  onTwapPageView,
  onCreateOrderRejected,
  onModuleLoad,
};
