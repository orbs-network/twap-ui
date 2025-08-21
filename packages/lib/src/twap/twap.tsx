import { SubmitOrderPanel } from "./submit-order-modal/submit-order-panel";
import { TwapProvider } from "../context";
import { TwapProps } from "../types";
import { DISCLAIMER_URL, ORBS_LOGO, ORBS_WEBSITE_URL } from "../consts";
import { useOrderHistoryPanel, useOrders } from "../hooks/order-hooks";
import { DEFAULT_DURATION_OPTIONS } from "./consts";
import { Portal } from "../components/Portal";
import { useResetState } from "../useTwapStore";
import { useFieldsErrors } from "../hooks/use-fields-errors";
import { useOrderExecutionFlow } from "../hooks/use-confirmation";
import { useInvertTrade } from "../hooks/use-invert-trade";
import { useMarketPricePanel } from "../hooks/use-market-price-panel";
import { useLimitPricePanel } from "../hooks/use-limit-price";
import { useTokenPanel } from "../hooks/use-token-panel";
import { useLimitPriceToggle } from "../hooks/use-limit-price-toggle";
import { useFillDelayPanel } from "../hooks/use-fill-delay";
import { useDurationPanel } from "../hooks/use-duration";
import { useChunkSizeMessage, useDisclaimerMessage, useTriggerPriceWarning } from "../hooks/use-message";
import { useChunksPanel } from "../hooks/use-chunks";
import { useOnOpenConfirmationButton } from "../hooks/use-open-confirmation-button";
import { useTriggerPricePanel } from "../hooks/use-trigger-price";
import { useTranslation } from "../hooks/use-translation";
import { OrderHistory } from "./orders/Orders";

const TWAP = (props: TwapProps) => {
  return (
    <TwapProvider {...props}>
      <>{props.children}</>
    </TwapProvider>
  );
};

export {
  SubmitOrderPanel,
  TWAP,
  OrderHistory,
  useOrders,
  useMarketPricePanel,
  useTokenPanel,
  useLimitPriceToggle,
  useFillDelayPanel,
  useDurationPanel,
  useChunkSizeMessage,
  useChunksPanel,
  useOnOpenConfirmationButton,
  useLimitPricePanel,
  useFieldsErrors,
  useDisclaimerMessage,
  useOrderHistoryPanel,
  useResetState,
  useTriggerPricePanel,
  useInvertTrade,
  useTriggerPriceWarning,
  useOrderExecutionFlow,
  useTranslation,
  ORBS_WEBSITE_URL,
  ORBS_LOGO,
  DEFAULT_DURATION_OPTIONS,
  DISCLAIMER_URL,
  Portal,
};
