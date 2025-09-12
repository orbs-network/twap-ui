import React, { useMemo } from "react";
import { Orders, OrdersPortal, OrderHistory } from "./orders/Orders";
import { SubmitOrderPanel } from "./submit-order-modal/SubmitOrderModal";
import { TwapProvider, useTwapContext } from "../context";
import { TwapProps } from "../types";
import { shouldUnwrapOnly, shouldWrapOnly } from "../utils";
import {
  useShowOrderConfirmationModalButton,
  useDisclaimerPanel,
  useDurationPanel,
  useFillDelayPanel,
  useLimitPricePanel,
  usePriceModePanel,
  useTokenPanel,
  useChunkSizeMessage,
  useChunksPanel,
  useDisclaimerMessage,
  useOrderHistoryPanel,
  useStopLossPanel,
  useMarketPrice,
  useCreateOrderCallback,
  useResetTwap,
} from "../hooks/ui-hooks";
import { DISCLAIMER_URL, ORBS_LOGO, ORBS_WEBSITE_URL } from "../consts";
import { useOrders } from "../hooks/order-hooks";
import { useBalanceError, useInputsError, useResetState } from "../hooks/logic-hooks";
import { DEFAULT_DURATION_OPTIONS } from "./consts";
import { useSubmitOrderPanel } from "../hooks/use-submit-order-panel";
import { Portal } from "../components/Portal";

const TWAP = (props: TwapProps) => {
  const shouldWrapOrUnwrap = useMemo(() => {
    return shouldWrapOnly(props.srcToken, props.dstToken, props.chainId) || shouldUnwrapOnly(props.srcToken, props.dstToken, props.chainId);
  }, [props.srcToken, props.dstToken, props.chainId]);
  return (
    <TwapProvider {...props}>
      <div className={`twap-container ${shouldWrapOrUnwrap ? "twap-container-wrap-only" : ""}`}>
        <Orders />
        <SubmitOrderPanel />
        {props.children}
      </div>
    </TwapProvider>
  );
};

const useTranslations = () => {
  const { translations } = useTwapContext();
  return translations;
};

const OrderHistoryContent = () => {
  return <OrderHistory />;
};

export {
  TWAP,
  useBalanceError,
  useTranslations,
  OrdersPortal as OrderHistory,
  useCreateOrderCallback,
  useResetTwap,
  OrderHistoryContent,
  useOrders,
  useSubmitOrderPanel,
  useTokenPanel,
  usePriceModePanel as usePriceTogglePanel,
  useFillDelayPanel,
  useDurationPanel,
  useChunkSizeMessage,
  useChunksPanel,
  useShowOrderConfirmationModalButton,
  useLimitPricePanel,
  useDisclaimerPanel,
  useInputsError,
  useDisclaimerMessage,
  useOrderHistoryPanel,
  useResetState,
  useStopLossPanel,
  useMarketPrice,
  ORBS_WEBSITE_URL,
  ORBS_LOGO,
  DEFAULT_DURATION_OPTIONS,
  DISCLAIMER_URL,
  Portal,
};
