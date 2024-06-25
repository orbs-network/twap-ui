import BigNumber from "bignumber.js";
import { useTwapStore } from "./store";
import { amountUi } from "./utils";
require("isomorphic-fetch");

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
  if (process.env.NODE_ENV === "development") return;


  // try {
  //   fetch("https://bi.orbs.network/putes/twap-ui", {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       timestamp: new Date().toISOString(),
  //       maker: lib?.maker,
  //       partner: lib?.config.partner,
  //       chain: lib?.config.chainId,
  //       category,
  //       action,
  //       ...data,
  //     }),
  //   });
  // } catch (error) {
  //   console.error(error);
  // }
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
