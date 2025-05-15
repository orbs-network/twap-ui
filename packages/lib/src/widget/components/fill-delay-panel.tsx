import { Panel } from "../../components/Panel";
import { Label, Message, NumericInput, ResolutionSelect } from "../../components/base";
import React, { ReactNode } from "react";
import { useTwapContext } from "../../context";
import { useFillDelayPanel } from "../../hooks/ui-hooks";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/logic-hooks";

const Input = ({ placeholder = "0", className = "" }: { placeholder?: string; className?: string }) => {
  const { onInputChange, fillDelay } = useFillDelayPanel();
  const { onBlur, onFocus } = Panel.usePanelContext();

  return (
    <NumericInput
      onBlur={onBlur}
      onFocus={onFocus}
      className={`twap-trade-interval-panel-input ${className}`}
      value={fillDelay.value}
      onChange={onInputChange}
      placeholder={placeholder}
    />
  );
};

const Resolution = () => {
  const { onUnitSelect, fillDelay } = useFillDelayPanel();
  const { onBlur, onFocus } = Panel.usePanelContext();

  return <ResolutionSelect onClose={onBlur} onOpen={onFocus} unit={fillDelay.unit} onChange={onUnitSelect} />;
};

export const FillDelayPanel = ({ children, className = "" }: { children?: ReactNode; className?: string }) => {
  const { error } = useFillDelayPanel();
  const hide = useShouldWrapOrUnwrapOnly();

  if (hide) return null;

  return (
    <Panel className={`${className} twap-trade-interval-panel`} error={!!error}>
      {children || <Main />}
    </Panel>
  );
};

const WarningComponent = () => {
  const fillDelayError = useFillDelayPanel().error;

  if (!fillDelayError) return null;

  return <Message variant="warning" />;
};

const TradeIntervalLabel = () => {
  const { translations } = useTwapContext();
  return <Label className="twap-trade-interval-panel-label" tooltip={translations.tradeIntervalTootlip} text={translations.tradeIntervalTitle} />;
};

const Main = () => {
  return (
    <>
      <Panel.Header>
        <FillDelayPanel.Label />
      </Panel.Header>
      <div className="twap-trade-interval-panel-content twap-panel-content">
        <FillDelayPanel.Input />
        <FillDelayPanel.Resolution />
      </div>
    </>
  );
};

FillDelayPanel.Resolution = Resolution;
FillDelayPanel.Input = Input;
FillDelayPanel.Label = TradeIntervalLabel;
FillDelayPanel.Warning = WarningComponent;
