import { styled } from "styled-components";
import React, { ReactNode, useCallback, useMemo } from "react";
import { StyledColumnFlex } from "../styles";
import { handleFillDelayText } from "../utils";
import { BottomContent, Label, Message, NumericInput, ResolutionSelect } from "./base";
import { TimeUnit } from "@orbs-network/twap-sdk";
import { useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";
import { useFillDelay, useMinimumDelayMinutes, useSetFillDelay, useShouldWrapOrUnwrapOnly } from "../hooks/lib";
import { useWidgetContext } from "../context/context";

const Input = ({ placeholder = "0", className = "" }: { placeholder?: string; className?: string }) => {
  const fillDelay = useTwapContextUI().state.typedFillDelay;
  const setFillDelay = useSetFillDelay();

  return <StyledInput className={className} value={fillDelay.value} onChange={(v) => setFillDelay({ unit: fillDelay.unit, value: Number(v) })} placeholder={placeholder} />;
};

const StyledInput = styled(NumericInput)({
  input: {
    padding: "0px",
  },
});

const Resolution = ({ placeholder, className = "" }: { placeholder?: string; className?: string }) => {
  const fillDelay = useTwapContextUI().state.typedFillDelay;
  const setFillDelay = useSetFillDelay();

  const onChange = useCallback(
    (unit: TimeUnit) => {
      setFillDelay({ unit, value: fillDelay.value });
    },
    [fillDelay.value, setFillDelay]
  );

  return <ResolutionSelect className={className} unit={fillDelay.unit} onChange={onChange} />;
};

export const TradeInterval = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  if (shouldWrapOrUnwrapOnly) return null;

  return (
    <Container className={className}>
      {children}
      <WarningComponent />
    </Container>
  );
};

const WarningComponent = () => {
  const fillDelayWarning = useFillDelay().warning;

  if (!fillDelayWarning) return null;

  return <Message title={fillDelayWarning} variant="warning" />;
};

const TradeIntervalLabel = () => {
  const translations = useWidgetContext().translations;
  const getMinimumDelayMinutes = useMinimumDelayMinutes();
  return (
    <Label>
      <Label.Text text={translations.tradeInterval} />
      <Label.Info text={handleFillDelayText(translations.tradeIntervalTootlip, getMinimumDelayMinutes)} />
    </Label>
  );
};

TradeInterval.Resolution = Resolution;
TradeInterval.Input = Input;
TradeInterval.Label = TradeIntervalLabel;
TradeInterval.Warning = WarningComponent;

const Container = styled(StyledColumnFlex)({
  gap: 0,
});
