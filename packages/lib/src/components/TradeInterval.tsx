import { styled } from "styled-components";
import { ReactNode, useCallback } from "react";
import { stateActions } from "../context/actions";
import { useTwapContext } from "../context/context";
import { StyledColumnFlex } from "../styles";
import { TimeResolution } from "../types";
import { handleFillDelayText } from "../utils";
import { BottomContent, Label, Message, NumericInput, ResolutionSelect } from "./base";
import { useFillDelayWarning, useMinimumDelayMinutes, useShouldWrapOrUnwrapOnly } from "../hooks/lib";

const Input = ({ placeholder = "0", className = "" }: { placeholder?: string; className?: string }) => {
  const fillDelay = useTwapContext().state.customFillDelay;
  const setFillDelay = stateActions.useSetCustomFillDelay();

  return (
    <StyledInput className={className} value={fillDelay.amount} onChange={(v) => setFillDelay({ resolution: fillDelay.resolution, amount: Number(v) })} placeholder={placeholder} />
  );
};

const StyledInput = styled(NumericInput)({
  input: {
    padding: "0px",
  },
});

const Resolution = ({ placeholder, className = "" }: { placeholder?: string; className?: string }) => {
  const fillDelay = useTwapContext().state.customFillDelay;
  const setFillDelay = stateActions.useSetCustomFillDelay();

  const onChange = useCallback(
    (resolution: TimeResolution) => {
      setFillDelay({ resolution, amount: fillDelay.amount });
    },
    [fillDelay.amount, setFillDelay]
  );

  return <ResolutionSelect className={className} resolution={fillDelay.resolution} onChange={onChange} />;
};

export const TradeInterval = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  if (shouldWrapOrUnwrapOnly) {
    return null;
  }

  return (
    <Container className={className}>
      {children}
      <WarningComponent />
    </Container>
  );
};

const WarningComponent = () => {
  const warning = useFillDelayWarning();

  if (!warning) return null;

  return (
    <BottomContent>
      <Message title={warning} variant="warning" />
    </BottomContent>
  );
};

const TradeIntervalLabel = () => {
  const translations = useTwapContext().translations;
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

const Container = styled(StyledColumnFlex)({
  gap: 0,
});
