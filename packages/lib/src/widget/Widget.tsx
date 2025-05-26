import React, { useMemo } from "react";
import { TokenPanel } from "./components/token-panel";
import { ShowConfirmationButton } from "./components/show-confirmation-button";
import { FillDelayPanel } from "./components/fill-delay-panel";
import { LimitPanel } from "./components/limit-panel";
import { SwitchTokens } from "./components/switch-tokens";
import { Orders, OrdersPortal } from "./components/orders/Orders";
import { PoweredByOrbs, PoweredbyOrbsPortal } from "./components/powered-by-orbs";
import { PriceMode } from "./components/price-mode";
import { SubmitOrderModal } from "./components/submit-order-modal/SubmitOrderModal";
import { SwapPanel } from "./components/swap-panel";
import { TwapProvider } from "../context";
import { WarningMessage, WarningMessagePortal } from "./components/warnings";
import { TwapProps } from "../types";
import { TradeAmountMessage } from "./components/TradeAmountMessage";
import { shouldUnwrapOnly, shouldWrapOnly } from "../utils";
import { Duration } from "./components/trade-duration-panel";
import { TradesAmount } from "./components/trades-amount-panel";
import { useUserOrders } from "../hooks/ui-hooks";

const Widget = (props: TwapProps) => {
  const shouldWrapOrUnwrap = useMemo(() => {
    return shouldWrapOnly(props.srcToken, props.dstToken, props.chainId) || shouldUnwrapOnly(props.srcToken, props.dstToken, props.chainId);
  }, [props.srcToken, props.dstToken, props.chainId]);
  return (
    <TwapProvider {...props}>
      <div className={`twap-widget ${shouldWrapOrUnwrap ? "twap-widget-wrap-only" : ""}`}>
        <Orders />
        <WarningMessagePortal />
        <PoweredbyOrbsPortal />
        <SubmitOrderModal />
        {props.children || <SwapPanel />}
      </div>
    </TwapProvider>
  );
};
Widget.Orders = OrdersPortal;
Widget.LimitPrice = LimitPanel;
Widget.ShowConfirmationButton = ShowConfirmationButton;
Widget.TradesAmount = TradesAmount;
Widget.TokenPanel = TokenPanel;
Widget.PoweredByOrbs = PoweredByOrbs;
Widget.FillDelayPanel = FillDelayPanel;
Widget.Duration = Duration;
Widget.SwitchTokens = SwitchTokens;
Widget.PriceMode = PriceMode;
Widget.WarningMessage = WarningMessage;
Widget.TradeAmountMessage = TradeAmountMessage;
Widget.useOrders = useUserOrders;
export { Widget };
