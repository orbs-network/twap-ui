import React, { ReactNode } from "react";
import { TokenPanel } from "./components/token-panel";
import { WidgetMessage } from "./components/message";
import { SubmitOrderPanel } from "./components/submit-order-panel";
import { FillDelayPanel } from "./components/fill-delay-panel";
import { LimitPanel } from "./components/limit-panel";
import { LimitPriceSwitch } from "./components/limit-price-switch";
import { TradesAmountPanel } from "./components/trades-amount-panel";
import { DurationPanel } from "./components/trade-duration-panel";
import { Panel } from "../components/Panel";
import { SwitchTokens } from "./components/switch-tokens";
import { ErrorMessage } from "./components/error-message";
import { OrdersPortal } from "./components/orders/Orders";
import { PoweredByOrbs } from "./components/powered-by-orbs";

const Widget = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

Widget.Orders = OrdersPortal;
Widget.LimitPricePanel = LimitPanel;
Widget.SubmitOrderPanel = SubmitOrderPanel;
Widget.TradesAmountPanel = TradesAmountPanel;
Widget.TokenPanel = TokenPanel;
Widget.PoweredByOrbs = PoweredByOrbs;
Widget.FillDelayPanel = FillDelayPanel;
Widget.LimitPriceSwitch = LimitPriceSwitch;
Widget.DurationPanel = DurationPanel;
Widget.Panel = Panel;
Widget.SwitchTokens = SwitchTokens;
Widget.ErrorMessage = ErrorMessage;
Widget.Message = WidgetMessage;

export { Widget };
