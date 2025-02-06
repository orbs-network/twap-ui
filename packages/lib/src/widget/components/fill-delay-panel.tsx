import { Panel } from "../../components/Panel";
import { StyledRowFlex } from "../../styles";
import { styled } from "styled-components";
import { TimeUnit } from "@orbs-network/twap-sdk";
import { Label, Message, NumericInput, ResolutionSelect } from "../../components/base";
import React, { ReactNode, useCallback } from "react";
import { handleFillDelayText } from "../../utils";
import { useWidgetContext } from "../..";

const Input = ({ placeholder = "0", className = "" }: { placeholder?: string; className?: string }) => {
  const {
    values: { fillDelay },
    actionHandlers: { setFillDelay },
  } = useWidgetContext().twap;

  const { onBlur, onFocus } = Panel.usePanelContext();

  return (
    <StyledInput
      onBlur={onBlur}
      onFocus={onFocus}
      className={`twap-trade-interval-panel-input ${className}`}
      value={fillDelay.value}
      onChange={(v) => setFillDelay({ unit: fillDelay.unit, value: Number(v) })}
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
  const {
    values: { fillDelay },
    actionHandlers: { setFillDelay },
  } = useWidgetContext().twap;
  const { onBlur, onFocus } = Panel.usePanelContext();

  const onChange = useCallback(
    (unit: TimeUnit) => {
      setFillDelay({ unit, value: fillDelay.value });
    },
    [fillDelay.value, setFillDelay],
  );

  return <ResolutionSelect onClose={onBlur} onOpen={onFocus} className={`twap-trade-interval-panel-resolution ${className}`} unit={fillDelay.unit} onChange={onChange} />;
};

export const FillDelayPanel = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const { twap } = useWidgetContext();

  return (
    <Panel className={`${className} twap-trade-interval-panel`} error={Boolean(twap.errors.fillDelay?.text)}>
      {children}
    </Panel>
  );
};

const WarningComponent = () => {
  const fillDelayError = useWidgetContext().twap.errors.fillDelay;

  if (!fillDelayError) return null;

  return <Message title={fillDelayError.text} variant="warning" />;
};

const TradeIntervalLabel = () => {
  const { translations, twap } = useWidgetContext();
  return (
    <Label className="twap-trade-interval-panel-label">
      <Label.Text text={translations.tradeInterval} />
      <Label.Info text={handleFillDelayText(translations.tradeIntervalTootlip, twap.values.estimatedDelayBetweenChunksMillis)} />
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
