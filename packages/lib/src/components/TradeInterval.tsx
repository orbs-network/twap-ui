import { styled } from "@mui/material";
import { ReactNode, useCallback } from "react";
import { stateActions } from "../context/actions";
import { useTwapContext } from "../context/context";
import { useFillDelayWarning } from "../hooks/hooks";
import { StyledColumnFlex } from "../styles";
import { TimeResolution } from "../types";
import { BottomContent, Message, NumericInput, TimeSelectMenu } from "./base";

const Input = ({ placeholder = "0", className = "" }: { placeholder?: string; className?: string }) => {
  const fillDelay = useTwapContext().state.customFillDelay;
  const setFillDelay = stateActions.useSetCustomFillDelay();

  return (
    <NumericInput
      className={className}
      value={fillDelay.amount}
      onChange={(v) => setFillDelay({ resolution: fillDelay.resolution, amount: Number(v) })}
      placeholder={placeholder}
    />
  );
};

export const Resolution = ({ placeholder, className = "" }: { placeholder?: string; className?: string }) => {
  const fillDelay = useTwapContext().state.customFillDelay;
  const setFillDelay = stateActions.useSetCustomFillDelay();

  const onChange = useCallback(
    (resolution: TimeResolution) => {
      setFillDelay({ resolution, amount: fillDelay.amount });
    },
    [fillDelay.amount, setFillDelay]
  );

  return <TimeSelectMenu className={className} resolution={fillDelay.resolution} onChange={onChange} />;
};

export const TradeInterval = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
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

TradeInterval.Resolution = Resolution;
TradeInterval.Input = Input;

const Container = styled(StyledColumnFlex)({
  gap: 0,
});
