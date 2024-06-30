import { styled } from "@mui/material";
import { ReactNode, useCallback } from "react";
import { useFillDelayWarning } from "../hooks/hooks";
import { TimeResolution, useTwapStore } from "../store";
import { StyledColumnFlex } from "../styles";
import { BottomContent, Message, NumericInput, TimeSelectMenu } from "./base";

const Input = ({ placeholder = "0" }: { placeholder?: string }) => {
  const { setFillDelay, fillDelay } = useTwapStore((s) => ({
    setFillDelay: s.setFillDelay,
    fillDelay: s.customFillDelay,
  }));

  return <NumericInput value={fillDelay.amount} onChange={(v) => setFillDelay({ resolution: fillDelay.resolution, amount: Number(v) })} placeholder={placeholder} />;
};

export const Resolution = ({ placeholder }: { placeholder?: string }) => {
  const { setFillDelay, fillDelay } = useTwapStore((s) => ({
    setFillDelay: s.setFillDelay,
    fillDelay: s.customFillDelay,
  }));

  const onChange = useCallback(
    (resolution: TimeResolution) => {
      setFillDelay({ resolution, amount: fillDelay.amount });
    },
    [fillDelay.amount, setFillDelay]
  );

  return <TimeSelectMenu resolution={fillDelay.resolution} onChange={onChange} />;
};

export const TradeInterval = ({ children }: { children: ReactNode }) => {
  return (
    <Container>
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
