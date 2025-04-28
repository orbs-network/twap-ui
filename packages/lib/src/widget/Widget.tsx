import React, { useMemo } from "react";
import { TokenPanel } from "./components/token-panel";
import { ShowConfirmationButton } from "./components/show-confirmation-button";
import { FillDelayPanel } from "./components/fill-delay-panel";
import { LimitPanel } from "./components/limit-panel";
import { SwitchTokens } from "./components/switch-tokens";
import { Orders, OrdersPortal } from "./components/orders/Orders";
import { PoweredbyOrbs } from "./components/powered-by-orbs";
import { PriceMode } from "./components/price-mode";
import { SubmitOrderModal } from "./components/submit-order-modal/SubmitOrderModal";
import { SwapPanel } from "./components/swap-panel";
import { GlobalStyles } from "./styles";
import { TwapProvider } from "../context";
import { WarningMessage } from "./components/warnings";
import { TwapProps } from "../types";
import { createGlobalStyle } from "styled-components";
import * as uiHooks from "../hooks/ui-hooks";
import { TradeAmountMessage } from "./components/TradesAmountMe";
import { shouldUnwrapOnly, shouldWrapOnly } from "../utils";
import { Duration } from "./components/trade-duration-panel";
import { TradesAmount } from "./components/trades-amount-panel";

const Widget = (props: TwapProps) => {
  const shouldWrapOrUnwrap = useMemo(() => {
    return shouldWrapOnly(props.srcToken, props.dstToken, props.chainId) || shouldUnwrapOnly(props.srcToken, props.dstToken, props.chainId);
  }, [props.srcToken, props.dstToken, props.chainId]);
  return (
    <TwapProvider {...props}>
      <div className={`twap-widget ${shouldWrapOrUnwrap ? "twap-widget-wrap-only" : ""}`}>
        <Orders />
        <SubmitOrderModal />
        {props.includeStyles && <GlobalStyles isDarkMode={true} />}
        {props.children || <SwapPanel />}
      </div>
    </TwapProvider>
  );
};

Widget.Orders = OrdersPortal;
Widget.LimitPricePanel = LimitPanel;
Widget.ShowConfirmationButton = ShowConfirmationButton;
Widget.TradesAmount = TradesAmount;
Widget.TokenPanel = TokenPanel;
Widget.PoweredByOrbs = PoweredbyOrbs;
Widget.FillDelayPanel = FillDelayPanel;
Widget.Duration = Duration;
Widget.SwitchTokens = SwitchTokens;
Widget.PriceMode = PriceMode;
Widget.WarningMessage = WarningMessage;
Widget.createGlobalStyle = createGlobalStyle;
Widget.hooks = uiHooks;
Widget.TradeAmountMessage = TradeAmountMessage;
export { Widget };
