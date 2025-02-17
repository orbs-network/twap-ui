import { Panel } from "../../components/Panel";
import { StyledRowFlex } from "../../styles";
import { styled } from "styled-components";
import { Label, Message, NumericInput, ResolutionSelect } from "../../components/base";
import React, { ReactNode } from "react";
import { useWidgetContext } from "../..";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/useShouldWrapOrUnwrap";
import { useFillDelayPanel } from "../hooks";

const Input = ({ placeholder = "0", className = "" }: { placeholder?: string; className?: string }) => {
  const { onInputChange, fillDelay } = useFillDelayPanel();
  const { onBlur, onFocus } = Panel.usePanelContext();

  return (
    <StyledInput
      onBlur={onBlur}
      onFocus={onFocus}
      className={`twap-trade-interval-panel-input ${className}`}
      value={fillDelay.value}
      onChange={onInputChange}
      placeholder={placeholder}
    />
  );
};

const StyledInput = styled(NumericInput)({
  input: {
    padding: "0px",
  },
});

const Resolution = ({ className = "" }: { className?: string }) => {
  const { onUnitSelect, fillDelay } = useFillDelayPanel();
  const { onBlur, onFocus } = Panel.usePanelContext();

  return <ResolutionSelect onClose={onBlur} onOpen={onFocus} className={`twap-trade-interval-panel-resolution ${className}`} unit={fillDelay.unit} onChange={onUnitSelect} />;
};

export const FillDelayPanel = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const { error } = useFillDelayPanel();
  const hide = useShouldWrapOrUnwrapOnly();

  if (hide) return null;

  return (
    <Panel className={`${className} twap-trade-interval-panel`} error={!!error}>
      {children}
    </Panel>
  );
};

const WarningComponent = () => {
  const fillDelayError = useFillDelayPanel().error;

  if (!fillDelayError) return null;

  return <Message title={fillDelayError} variant="warning" />;
};

const TradeIntervalLabel = () => {
  const { translations, twap } = useWidgetContext();
  return (
    <Label className="twap-trade-interval-panel-label">
      <Label.Text text={translations.tradeInterval} />
      {/* <Label.Info text={handleFillDelayText(translations.tradeIntervalTootlip, twap.values.estimatedDelayBetweenChunksMillis)} /> */}
    </Label>
  );
};

const Main = ({ className = "" }: { className?: string }) => {
  return (
    <StyledMain className={`${className} twap-trade-interval-panel-main`}>
      <Panel.Header>
        <FillDelayPanel.Label />
      </Panel.Header>
      <StyledRowFlex>
        <FillDelayPanel.Input />
        <FillDelayPanel.Resolution />
      </StyledRowFlex>
    </StyledMain>
  );
};

FillDelayPanel.Resolution = Resolution;
FillDelayPanel.Input = Input;
FillDelayPanel.Label = TradeIntervalLabel;
FillDelayPanel.Warning = WarningComponent;
FillDelayPanel.Main = Main;

const StyledMain = styled("div")({
  ".twap-select-menu": {
    width: "auto",
  },
  ".twap-input": {
    flex: 1,
  },
});
