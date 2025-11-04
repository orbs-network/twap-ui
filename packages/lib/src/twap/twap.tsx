import { SubmitOrderPanel } from "./components/submit-order-panel";
import { TwapProvider as TWAP } from "../context/twap-context";
import { DISCLAIMER_URL, ORBS_LOGO, ORBS_WEBSITE_URL, DEFAULT_DURATION_OPTIONS } from "../consts";
import { Orders } from "./components/orders/orders";
import { useTradesPanel } from "../hooks/use-trades";
import { useFillDelayPanel } from "../hooks/use-fill-delay";
import { useMarketPricePanel } from "../hooks/use-market-price";
import { useDurationPanel } from "../hooks/use-duration";
import { useDisclaimerPanel } from "../hooks/use-disclaimer-panel";
import { useSubmitSwapPanel } from "../hooks/use-submit-swap-panel";
import { useTriggerPricePanel } from "../hooks/use-trigger-price";
import { useOrderHistoryPanel } from "../hooks/order-hooks";
import { useDstTokenPanel, useSrcTokenPanel } from "../hooks/use-token-panel";
import { useLimitPricePanel } from "../hooks/use-limit-price";
import { useInvertTradePanel } from "../hooks/use-invert-trade-panel";
import { useInputErrors } from "../hooks/use-input-errors";
import { useBuildRePermitOrderDataCallback } from "../hooks/use-build-repermit-order-data-callback.ts";
import { useTogglePricePanel } from "../hooks/use-toggle-price";

const Components = {
  SubmitOrderPanel,
  Orders,
};

export {
  TWAP,
  ORBS_WEBSITE_URL,
  ORBS_LOGO,
  DEFAULT_DURATION_OPTIONS,
  DISCLAIMER_URL,
  Components,
  useTradesPanel,
  useDurationPanel,
  useFillDelayPanel,
  useLimitPricePanel,
  useMarketPricePanel,
  useSrcTokenPanel,
  useDstTokenPanel,
  useTriggerPricePanel,
  useOrderHistoryPanel,
  useSubmitSwapPanel,
  useDisclaimerPanel,
  useInvertTradePanel,
  useInputErrors,
  useTogglePricePanel,
  useBuildRePermitOrderDataCallback,
};
