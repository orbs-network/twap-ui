import ReactGA from "react-ga4";
import { useQuery } from "react-query";
import { useWeb3 } from "./store/store";

export const useAnalyticsInit = (analyticsID?: string) => {
  const { account } = useWeb3();

  useQuery(
    ["setAnalyticsApiKey"],
    () => {
      ReactGA.initialize(analyticsID!);
    },
    { enabled: !!analyticsID }
  );

  useQuery(
    ["setAnalyticsUserId"],
    () => {
      ReactGA.set({ userId: account });
    },
    { enabled: !!account }
  );
};
const getOrderType = (isLimitOrder: boolean) => (isLimitOrder ? "Limit" : "Market");

type Category = "Error" | "Main panel" | "Orders panel" | "Confirmation panel";

const onLimitOrderSelect = () => {
  sendAnalyticsEvent("Main panel", "Selected limit order");
};

const onMarketPriceSelect = () => {
  sendAnalyticsEvent("Main panel", "Selected market price");
};

const onSelectSrcToken = (symbol?: string) => {
  sendAnalyticsEvent("Main panel", `Selected source token: ${symbol}`, symbol);
};
const onSelectDstToken = (symbol?: string) => {
  sendAnalyticsEvent("Main panel", `Selected destination token: ${symbol}`, symbol);
};

const onSelectCustomInterval = () => {
  sendAnalyticsEvent("Main panel", "Selected custom trade interval");
};

const onApproveClick = () => {
  sendAnalyticsEvent("Main panel", "Approve token click");
};

const onApproveSuccess = () => {
  sendAnalyticsEvent("Main panel", "Approve token click");
};

const onWrapClick = () => {
  sendAnalyticsEvent("Main panel", "Wrap token click");
};

const onWrapTxSuccess = () => {
  sendAnalyticsEvent("Main panel", "Wrap success");
};

const onPlaceOrderClick = (isLimitOrder: boolean) => {
  sendAnalyticsEvent("Main panel", `Place ${getOrderType(isLimitOrder)} order click`);
};

const onCreateOrderClick = (isLimitOrder: boolean) => {
  const orderType = getOrderType(isLimitOrder);

  sendAnalyticsEvent("Confirmation panel", `Create ${orderType} order click`, `Order type: ${orderType}`);
};

const onNotificationsClick = () => {
  sendAnalyticsEvent("Orders panel", "Notifications click");
};

const onCreateOrderTxSuccess = (isLimitOrder: boolean) => {
  const orderType = getOrderType(isLimitOrder);
  sendAnalyticsEvent("Confirmation panel", `Create ${orderType} Order Success`, `Order type: ${orderType}`);
};

const onCreateOrderTxError = (message: string, isLimitOrder: boolean) => {
  sendAnalyticsEvent("Error", `Create ${getOrderType(isLimitOrder)} Order failed`, message);
};

const onWrapError = (message: string) => {
  sendAnalyticsEvent("Error", "Wrap failed", message);
};

const onApproveError = (message: string) => {
  sendAnalyticsEvent("Error", "Approve failed", message);
};

const onCancelOrderClick = (orderId: string) => {
  sendAnalyticsEvent("Orders panel", "Cancel order click", `Order ID: ${orderId}`);
};

const onCancelOrderTxSuccess = (orderId: string) => {
  sendAnalyticsEvent("Orders panel", "Cancel order sccess", `Order ID: ${orderId}`);
};

const onCancelOrderTxError = (error: string) => {
  sendAnalyticsEvent("Error", `Cancel order failed`, error);
};

export const AnalyticsEvents = {
  onLimitOrderSelect,
  onMarketPriceSelect,
  onSelectSrcToken,
  onSelectDstToken,
  onSelectCustomInterval,
  onApproveClick,
  onWrapClick,
  onWrapTxSuccess,
  onPlaceOrderClick,
  onCreateOrderClick,
  onNotificationsClick,
  onCreateOrderTxError,
  onWrapError,
  onApproveError,
  onCreateOrderTxSuccess,
  onApproveSuccess,
  onCancelOrderClick,
  onCancelOrderTxSuccess,
  onCancelOrderTxError,
};

const sendAnalyticsEvent = (category: Category, action: string, label?: string) => {
  if (!ReactGA.isInitialized) return;
  ReactGA.event({
    category: category,
    action: action,
    label,
  });
};
