import React from "react";
import { TokenPanel } from "./components/token-panel";
import { ShowConfirmationButton } from "./components/show-confirmation-button";
import { FillDelayPanel } from "./components/fill-delay-panel";
import { LimitPanel } from "./components/limit-panel";
import { PriceTabs } from "./components/price-tabs";
import { TradesAmountPanel } from "./components/trades-amount-panel";
import { DurationPanel } from "./components/trade-duration-panel";
import { SwitchTokens } from "./components/switch-tokens";
import { Orders, OrdersPortal } from "./components/orders/Orders";
import { PoweredbyOrbs } from "./components/powered-by-orbs";
import { PriceSwitch } from "./components/price-switch";
import { SubmitOrderModal } from "./components/submit-order-modal/SubmitOrderModal";
import { SwapPanel } from "./components/swap-panel";
import { GlobalStyles } from "./styles";
import { TwapProvider } from "../context";
import { LimitPriceMessage } from "./components/limit-price-message";
import { TwapProps } from "../types";
import { createGlobalStyle } from "styled-components";
import * as uiHooks from "../hooks/ui-hooks";

const Widget = (props: TwapProps) => {
  return (
    <TwapProvider {...props}>
      <div className="twap-widget">
        <Orders />
        {props.includeStyles && <GlobalStyles isDarkMode={true} />}
        {props.children || <SwapPanel />}
      </div>
    </TwapProvider>
  );
};

Widget.Orders = OrdersPortal;
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
Widget.PriceSwitch = PriceSwitch;
Widget.LimitPriceMessage = LimitPriceMessage;
Widget.createGlobalStyle = createGlobalStyle;
Widget.hooks = uiHooks;
export { Widget };
