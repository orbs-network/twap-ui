import { TokenPanel } from "./token-panel";
import { SwitchTokens } from "./switch-tokens";
import { LimitPanel } from "./limit-panel";
import { PriceSwitch } from "./price-switch";
import { ShowConfirmationButton } from "./show-confirmation-button";
import { TradesAmountPanel } from "./trades-amount-panel";
import { FillDelayPanel } from "./fill-delay-panel";
import { DurationPanel } from "./trade-duration-panel";
import { OrdersPortal } from "./orders/Orders";
import { PoweredbyOrbs } from "./powered-by-orbs";
import { useTwapContext } from "../../context";
import { SubmitOrderModal } from "./submit-order-modal/SubmitOrderModal";
import { LimitPriceMessage } from "./limit-price-message";

export function SwapPanel() {
  const { isLimitPanel } = useTwapContext();
  return (
    <div className="twap-widget-swap-panel">
      <div className="twap-widget-swap-panel-form">
        <PriceSwitch />
        <LimitPanel />
        <TokenPanel isSrcToken={true} />
        <SwitchTokens />
        <TokenPanel isSrcToken={false} />
        {isLimitPanel ? (
          <DurationPanel />
        ) : (
          <div className="twap-inputs">
            <FillDelayPanel />
            <TradesAmountPanel />
          </div>
        )}
        <ShowConfirmationButton />
      </div>
      <PoweredbyOrbs />
      <OrdersPortal />
      <LimitPriceMessage />
      <SubmitOrderModal />
    </div>
  );
}
