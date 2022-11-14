import axios from "axios";
import BigNumber from "bignumber.js";
import moment from "moment";
import { useTwapStore, useWeb3Store } from "./store/store";

enum Category {
  Error = "Error",
  TWAPPanel = "TWAPPanel",
  OrdersPanel = "OrdersPanel",
  ConfirmationPanel = "ConfirmationPanel",
}

export const useSendAnalyticsEvents = () => {
  const { account = "", integrationKey, chain = 0 } = useWeb3Store();
  const { srcTokenInfo, dstTokenInfo, srcTokenAmount, getTradeSize, getMinAmountOut, getDeadline, getTradeIntervalMillis, totalTrades } = useTwapStore();

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

  const onConfirmationCreateOrderClick = (config: any) => {
    sendAnalyticsEvent(Category.ConfirmationPanel, `onConfirmationCreateOrderClick`, {
      config,
      exchangeAddress: config.exchangeAddress,
      srcToken: srcTokenInfo?.address,
      dstToken: dstTokenInfo?.address,
      srcTokenAmount: srcTokenAmount?.toString(),
      tradeSize: getTradeSize().toString(),
      minAmountOut: getMinAmountOut().toString(),
      deadline: Math.round(getDeadline() / 1000),
      tradeInterval: Math.round(getTradeIntervalMillis() / 1000),
      totalTrades,
    });
  };

  const onODNPClick = () => {
    sendAnalyticsEvent(Category.OrdersPanel, "onODNPClick");
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

  const onCancelOrderClick = (orderId: string) => {
    sendAnalyticsEvent(Category.OrdersPanel, "onCancelOrderClick", orderId);
  };

  const onCancelOrderSuccess = (orderId: string) => {
    sendAnalyticsEvent(Category.OrdersPanel, "onCancelOrderSuccess", orderId);
  };

  const onCancelOrderError = (error: string) => {
    sendAnalyticsEvent(Category.Error, `onCancelOrderError`, error);
  };

  const sendAnalyticsEvent = (category: Category, action: string, data?: any) => {
    axios
      .post("https://bi.orbs.network/putes/twap-ui", {
        maker: account,
        timestamp: moment().valueOf(),
        userAgent: navigator.userAgent.toString(),
        partner: integrationKey,
        chain,
        category,
        action,
        data,
      })
      .catch(console.log);
  };

  return {
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
  };
};
