import React from "react";
import { TokenPanel } from "./token-panel";
import { SwitchTokens } from "./switch-tokens";
import { LimitPanel } from "./limit-panel";
import { PriceSwitch } from "./price-switch";
import { ShowConfirmationButton } from "./show-confirmation-button";
import { TradesAmountPanel } from "./trades-amount-panel";
import { FillDelayPanel } from "./fill-delay-panel";
import { DurationPanel } from "./trade-duration-panel";
import { Orders } from "./orders/Orders";
import { PoweredbyOrbs } from "./powered-by-orbs";
import { useTwapContext } from "../../context";
import { SubmitOrderModal } from "./submit-order-modal/SubmitOrderModal";
import { LimitPriceMessage } from "./limit-price-message";

export function SwapPanel() {
  const {
    isLimitPanel,
    state: { isMarketOrder },
  } = useTwapContext();
  return (
    <div className="twap-widget-swap-panel">
      <PriceSwitch />
      {!isMarketOrder && (
        <LimitPanel>
          <LimitPanel.Main />
        </LimitPanel>
      )}
      <div className="twap-widget-swap-panel-top">
        <TokenPanel isSrcToken={true}>
          <TokenPanel.Main />
        </TokenPanel>
        <SwitchTokens />
        <TokenPanel isSrcToken={false}>
          <TokenPanel.Main />
        </TokenPanel>
      </div>
      {isLimitPanel ? (
        <DurationPanel>
          <DurationPanel.Main />
        </DurationPanel>
      ) : (
        <div className="twap-inputs">
          <FillDelayPanel>
            <FillDelayPanel.Main />
          </FillDelayPanel>
          <TradesAmountPanel>
            <TradesAmountPanel.Main />
          </TradesAmountPanel>
        </div>
      )}

      <ShowConfirmationButton />
      <PoweredbyOrbs />
      <Orders />
      <LimitPriceMessage />
      <SubmitOrderModal />
    </div>
  );
}
