import BigNumber from "bignumber.js";
import { amountUi, useTwapStore } from "./store";

enum Category {
  Error = "Error",
  TWAPPanel = "TWAPPanel",
  OrdersPanel = "OrdersPanel",
  ConfirmationPanel = "ConfirmationPanel",
  PageView = "onTwapPageView",
}

const onLimitToggleClick = (isLimitOrder: boolean) => {
  sendAnalyticsEvent(Category.TWAPPanel, "onLimitToggleClick", { isLimitOrder });
};

const uiCrashed = (location: "orders" | "twap", error: Error) => {
  sendAnalyticsEvent(Category.Error, "UI crashed", { location, message: error.message, stack: error.stack });
};

const onSrcTokenClick = (symbol?: string) => {
  sendAnalyticsEvent(Category.TWAPPanel, `onSrcTokenClick`, { symbol });
};

const onDstTokenClick = (symbol?: string) => {
  sendAnalyticsEvent(Category.TWAPPanel, `onDstTokenClick`, { symbol });
};

const onCustomIntervalClick = () => {
  sendAnalyticsEvent(Category.TWAPPanel, "onCustomIntervalClick");
};

const onApproveClick = (amount: BigNumber) => {
  sendAnalyticsEvent(Category.TWAPPanel, "onApproveClick", { amount: amount.toString() });
};

const onApproveSuccess = () => {
  sendAnalyticsEvent(Category.TWAPPanel, "onApproveSuccess");
};

const onWrapClick = (amount: BigNumber) => {
  sendAnalyticsEvent(Category.TWAPPanel, "onWrapClick", { amount: amount.toString() });
};

const onWrapSuccess = () => {
  sendAnalyticsEvent(Category.TWAPPanel, "onWrapSuccess");
};

const onConfirmationCreateOrderClick = () => {
  const lib = useTwapStore.getState().lib;

  const srcToken = useTwapStore.getState().srcToken;
  const dsToken = useTwapStore.getState().dstToken;

  sendAnalyticsEvent(Category.ConfirmationPanel, `onConfirmationCreateOrderClick`, {
    exchangeAddress: lib?.config.exchangeAddress,
    srcToken: useTwapStore.getState().srcToken?.address,
    dstToken: useTwapStore.getState().dstToken?.address,
    srcTokenAmount: amountUi(srcToken, useTwapStore.getState().getSrcAmount()),
    tradeSize: amountUi(srcToken, useTwapStore.getState().getSrcChunkAmount()),
    minAmountOut: amountUi(dsToken, useTwapStore.getState().getDstAmount()),
    deadline: useTwapStore.getState().getDeadline(),
    tradeInterval: useTwapStore.getState().getFillDelayUiMillis(),
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

const onCreateOrderSuccess = (orderId: number) => {
  sendAnalyticsEvent(Category.ConfirmationPanel, `onCreateOrderSuccess`, { orderId });
};

const onCreateOrderError = (message: string) => {
  sendAnalyticsEvent(Category.Error, `onCreateOrderError`, { message });
};

const onWrapError = (message: string) => {
  sendAnalyticsEvent(Category.Error, "onWrapError", { message });
};

const onApproveError = (message: string) => {
  sendAnalyticsEvent(Category.Error, "onApproveError", { message });
};

const onCancelOrderClick = (orderId: number) => {
  sendAnalyticsEvent(Category.OrdersPanel, "onCancelOrderClick", { orderId });
};

const onCancelOrderSuccess = (orderId: string) => {
  sendAnalyticsEvent(Category.OrdersPanel, "onCancelOrderSuccess", { orderId });
};

const onCancelOrderError = (error: string) => {
  sendAnalyticsEvent(Category.Error, `onCancelOrderError`, { error });
};

const onCreateOrderRejected = () => {
  sendAnalyticsEvent(Category.Error, `onCreateOrderRejected`);
};

const onOpenConfirmationModal = () => {
  sendAnalyticsEvent(Category.ConfirmationPanel, `onOpenConfirmationModal`);
};

const sendAnalyticsEvent = (category: Category, action: string, data = {} as { [key: string]: any }) => {
  const lib = useTwapStore.getState().lib;

  fetch("https://bi.orbs.network/putes/twap-ui", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      maker: lib?.maker,
      partner: lib?.config.partner,
      chain: lib?.config.chainId,
      location: document ? document.location.href : "",
      category,
      action,
      ...data,
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
  onOpenConfirmationModal,
  uiCrashed,
};
