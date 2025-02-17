import React from "react";
import { TokenPanel } from "./token-panel";
import { SwitchTokens } from "./switch-tokens";
import { useWidgetContext } from "../widget-context";
import { LimitPanel } from "./limit-panel";
import { PriceSwitch } from "./price-switch";
import { ShowConfirmationButton } from "./show-confirmation-button";
import { TradesAmountPanel } from "./trades-amount-panel";
import { FillDelayPanel } from "./fill-delay-panel";
import { DurationPanel } from "./trade-duration-panel";
import { ErrorMessage } from "./error-message";

export function SwapPanel() {
  const {
    isLimitPanel,
    twap: {
      values: { isMarketOrder },
    },
  } = useWidgetContext();
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

      <ErrorMessage />
      <ShowConfirmationButton />
    </div>
  );
}
