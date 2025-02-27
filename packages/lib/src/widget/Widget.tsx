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
import { Orders } from "./components/orders/Orders";
import { PoweredbyOrbs } from "./components/powered-by-orbs";
import { PriceSwitch } from "./components/price-switch";
import { SubmitOrderModal } from "./components/submit-order-modal/SubmitOrderModal";
import { SwapPanel } from "./components/swap-panel";
import { GlobalStyles } from "./styles";
import { useTwapContext } from "../context";
import {
  useChunkSizeMessage,
  useConfirmationModalPanel,
  useFillDelayPanel,
  useOrderDurationPanel,
  usePriceToggle,
  useShowConfirmationModalButton,
  useSwitchTokensCallback,
  useTradesAmountPanel,
} from "../hooks/ui-hooks";
import { LimitPriceMessage } from "./components/limit-price-message";

const Widget = ({ children }: { children: ReactNode }) => {
  const { includeStyles, isDarkTheme } = useTwapContext();
  return (
    <div className="twap-widget">
      {includeStyles && <GlobalStyles isDarkMode={isDarkTheme} />}
      {children}
    </div>
  );
};

const hooks = {
  useSwitchTokensCallback,
  useTradesAmountPanel,
  useOrderDurationPanel,
  useShowConfirmationModalButton,
  usePriceToggle,
  useChunkSizeMessage,
  useFillDelayPanel,
  useConfirmationModalPanel,
};

Widget.Orders = Orders;
Widget.LimitPricePanel = LimitPanel;
Widget.ShowConfirmationButton = ShowConfirmationButton;
Widget.OrderConfirmation = SubmitOrderModal;
Widget.TradesAmountPanel = TradesAmountPanel;
Widget.TokenPanel = TokenPanel;
Widget.PoweredByOrbs = PoweredbyOrbs;
Widget.FillDelayPanel = FillDelayPanel;
Widget.PriceTabs = PriceTabs;
Widget.DurationPanel = DurationPanel;
Widget.SwitchTokens = SwitchTokens;
Widget.Message = WidgetMessage;
Widget.PriceSwitch = PriceSwitch;
Widget.LimitPriceMessage = LimitPriceMessage;
Widget.SwapPanel = SwapPanel;
Widget.hooks = hooks;
export { Widget };
