import React, { ReactNode } from "react";
import { TokenPanel } from "./components/token-panel";
import { WidgetMessage } from "./components/message";
import { ShowConfirmationButton } from "./components/show-confirmation-button";
import { FillDelayPanel } from "./components/fill-delay-panel";
import { LimitPanel } from "./components/limit-panel";
import { PriceTabs } from "./components/price-tabs";
import { TradesAmountPanel } from "./components/trades-amount-panel";
import { DurationPanel } from "./components/trade-duration-panel";
import { SwitchTokens } from "./components/switch-tokens";
import { ErrorMessage } from "./components/error-message";
import { OrdersPortal } from "./components/orders/Orders";
import { PoweredByOrbsPortal } from "./components/powered-by-orbs";
import { PriceSwitch } from "./components/price-switch";
import { LimitPriceWarning } from "../components";
import { useOrderHistoryManager } from "../hooks/useOrderHistoryManager";
import { SubmitOrderModalPortal } from "./components/submit-order-modal/SubmitOrderModal";
import { useConfirmation } from "../hooks/useConfirmation";
import * as Hooks from "./hooks";

const Widget = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

const hooks = {
  useOrderHistoryManager,
  useConfirmation,
  useTokenPanel: Hooks.useTokenPanel,
  useSwitchTokens: Hooks.useSwitchTokens,
  useTradesAmountPanel: Hooks.useTradesAmountPanel,
  useTradeDurationPanel: Hooks.useTradeDurationPanel,
  useShowConfirmationButton: Hooks.useShowConfirmationButton,
  usePriceMode: Hooks.usePriceMode,
  useMessage: Hooks.useMessage,
  useLimitPricePanel: Hooks.useLimitPricePanel,
  useFillDelayPanel: Hooks.useFillDelayPanel,
  useError: Hooks.useError,
};

Widget.Orders = OrdersPortal;
Widget.LimitPricePanel = LimitPanel;
Widget.ShowConfirmationButton = ShowConfirmationButton;
Widget.OrderConfirmation = SubmitOrderModalPortal;
Widget.TradesAmountPanel = TradesAmountPanel;
Widget.TokenPanel = TokenPanel;
Widget.PoweredByOrbs = PoweredByOrbsPortal;
Widget.FillDelayPanel = FillDelayPanel;
Widget.PriceTabs = PriceTabs;
Widget.DurationPanel = DurationPanel;
Widget.SwitchTokens = SwitchTokens;
Widget.ErrorMessage = ErrorMessage;
Widget.Message = WidgetMessage;
Widget.PriceSwitch = PriceSwitch;
Widget.LimitPriceWarning = LimitPriceWarning;
Widget.hooks = hooks;
export { Widget };
