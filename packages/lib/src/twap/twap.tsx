import React, { useMemo } from "react";
import { Orders, OrdersPortal } from "./orders/Orders";
import { SubmitOrderModal } from "./submit-order-modal/SubmitOrderModal";
import { TwapProvider } from "../context";
import { TwapProps } from "../types";
import { shouldUnwrapOnly, shouldWrapOnly } from "../utils";
import {
  useShowOrderConfirmationModalButton,
  useDisclaimerPanel,
  useDurationPanel,
  useFillDelayPanel,
  useLimitPricePanel,
  usePriceModePanel,
  useSubmitOrderPanel,
  useTokenPanel,
  useChunkSizeMessage,
  useChunksPanel,
  useTradeType,
} from "../hooks/ui-hooks";
import { DISCLAIMER_URL, ORBS_LOGO, ORBS_WEBSITE_URL } from "../consts";
import { useOrders } from "../hooks/order-hooks";
import { useInputsError } from "../hooks/logic-hooks";
import { DEFAULT_DURATION_OPTIONS } from "./consts";

const TWAP = (props: TwapProps) => {
  const shouldWrapOrUnwrap = useMemo(() => {
    return shouldWrapOnly(props.srcToken, props.dstToken, props.chainId) || shouldUnwrapOnly(props.srcToken, props.dstToken, props.chainId);
  }, [props.srcToken, props.dstToken, props.chainId]);
  return (
    <TwapProvider {...props}>
      <div className={`twap-widget ${shouldWrapOrUnwrap ? "twap-widget-wrap-only" : ""}`}>
        <Orders />
        <SubmitOrderModal />
        {props.children}
      </div>
    </TwapProvider>
  );
};

export {
  TWAP,
  OrdersPortal as OrderHistory,
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
  useTradeType,
  ORBS_WEBSITE_URL,
  ORBS_LOGO,
  DEFAULT_DURATION_OPTIONS,
  DISCLAIMER_URL,
};
