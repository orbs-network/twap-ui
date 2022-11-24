import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import moment from "moment";
import { deadlineGet, dstAmountGet, dstTokenAtom, fillDelayAtom, srcChunkAmountGet, srcTokenAtom, totalChunksAtom, twapLibAtom } from "./state";

enum Category {
  Error = "Error",
  TWAPPanel = "TWAPPanel",
  OrdersPanel = "OrdersPanel",
  ConfirmationPanel = "ConfirmationPanel",
}

export const useSendAnalyticsEvents = () => {
  const lib = useAtomValue(twapLibAtom);
  const srcToken = useAtomValue(srcTokenAtom);
  const dstToken = useAtomValue(dstTokenAtom);
  const srcTokenAmount = useAtomValue(srcTokenAtom);
  const chunksAmount = useAtomValue(srcChunkAmountGet);
  const dstMinAmountOut = useAtomValue(dstAmountGet);
  const deadline = useAtomValue(deadlineGet);
  const fillDelay = useAtomValue(fillDelayAtom);
  const totalChunks = useAtomValue(totalChunksAtom);

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
    sendAnalyticsEvent(Category.ConfirmationPanel, `onConfirmationCreateOrderClick`, {
      config: lib?.config,
      exchangeAddress: lib?.config.exchangeAddress,
      srcToken: srcToken?.address,
      dstToken: dstToken?.address,
      srcTokenAmount: srcTokenAmount?.toString(),
      tradeSize: chunksAmount,
      minAmountOut: dstMinAmountOut,
      deadline,
      tradeInterval: fillDelay,
      totalTrades: totalChunks,
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

  const onCancelOrderClick = (orderId: number) => {
    sendAnalyticsEvent(Category.OrdersPanel, "onCancelOrderClick", orderId);
  };

  const onCancelOrderSuccess = (orderId: string) => {
    sendAnalyticsEvent(Category.OrdersPanel, "onCancelOrderSuccess", orderId);
  };

  const onCancelOrderError = (error: string) => {
    sendAnalyticsEvent(Category.Error, `onCancelOrderError`, error);
  };

  const sendAnalyticsEvent = (category: Category, action: string, data?: any) => {
    fetch("https://bi.orbs.network/putes/twap-ui", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maker: lib?.maker,
        timestamp: moment().valueOf(),
        userAgent: navigator.userAgent.toString(),
        partner: lib?.config.partner,
        chain: lib?.config.chainId,
        category,
        action,
        data,
      }),
    }).catch();
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
