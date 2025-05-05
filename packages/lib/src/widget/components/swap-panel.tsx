import { TokenPanel } from "./token-panel";
import { SwitchTokens } from "./switch-tokens";
import { LimitPanel } from "./limit-panel";
import { ShowConfirmationButton } from "./show-confirmation-button";
import { FillDelayPanel } from "./fill-delay-panel";
import { OrdersPortal } from "./orders/Orders";
import { PoweredByOrbs } from "./powered-by-orbs";
import { useTwapContext } from "../../context";
import { WarningMessage } from "./warnings";
import { TradeAmountMessage } from "./TradesAmountMe";
import { Duration } from "./trade-duration-panel";
import { TradesAmount } from "./trades-amount-panel";
import { PriceMode } from "./price-mode";

export function SwapPanel() {
  const { isLimitPanel } = useTwapContext();
  return (
    <div className="twap-widget-swap-panel">
      <div className="twap-widget-swap-panel-form">
        <PriceMode />
        <LimitPanel />
        <TokenPanel isSrcToken={true} />
        <SwitchTokens />
        <TokenPanel isSrcToken={false} />
        {isLimitPanel ? (
          <Duration />
        ) : (
          <div className="twap-inputs">
            <FillDelayPanel />
            <TradesAmount />
          </div>
        )}
        <TradeAmountMessage />
        <ShowConfirmationButton />
      </div>
      <PoweredByOrbs />
      <OrdersPortal />
      <WarningMessage />
    </div>
  );
}
