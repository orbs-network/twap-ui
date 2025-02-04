import React, { ReactNode } from "react";
import { TokenPanel } from "./components/token-panel";
import { WidgetMessage } from "./components/message";
import { SubmitOrderPanel } from "./components/submit-order-panel";
import { FillDelayPanel } from "./components/fill-delay-panel";
import { LimitPanel } from "./components/limit-panel";
import { PriceTabs } from "./components/price-tabs";
import { TradesAmountPanel } from "./components/trades-amount-panel";
import { DurationPanel } from "./components/trade-duration-panel";
import { Panel } from "../components/Panel";
import { SwitchTokens } from "./components/switch-tokens";
import { ErrorMessage } from "./components/error-message";
import { OrdersPortal } from "./components/orders/Orders";
import { PoweredByOrbsPortal } from "./components/powered-by-orbs";
import { PriceSwitch } from "./components/price-switch";
import { LimitPriceWarning } from "../components";

const Widget = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

Widget.Orders = OrdersPortal;
Widget.LimitPricePanel = LimitPanel;
Widget.SubmitOrderPanel = SubmitOrderPanel;
Widget.TradesAmountPanel = TradesAmountPanel;
Widget.TokenPanel = TokenPanel;
Widget.PoweredByOrbs = PoweredByOrbsPortal;
Widget.FillDelayPanel = FillDelayPanel;
Widget.PriceTabs = PriceTabs;
Widget.DurationPanel = DurationPanel;
Widget.Panel = Panel;
Widget.SwitchTokens = SwitchTokens;
Widget.ErrorMessage = ErrorMessage;
Widget.Message = WidgetMessage;
Widget.PriceSwitch = PriceSwitch;
Widget.LimitPriceWarning = LimitPriceWarning;
export { Widget };
