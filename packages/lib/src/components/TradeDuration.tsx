import { styled } from "@mui/material";
import { FC, ReactNode, useCallback, useMemo } from "react";
import { stateActions } from "../context/actions";
import { useTwapContext } from "../context/context";
import { useDuration, useShouldWrapOrUnwrapOnly, useMinDuration, useTradeDurationWarning } from "../hooks/hooks";
import { StyledColumnFlex } from "../styles";
import { TimeResolution } from "../types";
import { BottomContent, Button, Label, Message, NumericInput, TimeSelectMenu } from "./base";

const Input = ({ placeholder = "0", className = "" }: { placeholder?: string; className?: string }) => {
  const duration = useDuration().duration;
  const setCustomDuration = stateActions.useSetCustomDuration();

  return (
    <NumericInput
      className={className}
      value={duration.amount}
      onChange={(v) => setCustomDuration({ resolution: duration.resolution, amount: Number(v) })}
      placeholder={placeholder}
    />
  );
};

const Resolution = ({ placeholder, className = "" }: { placeholder?: string; className?: string }) => {
  const duration = useDuration().duration;
  const setCustomDuration = stateActions.useSetCustomDuration();

  const onChange = useCallback(
    (resolution: TimeResolution) => {
      setCustomDuration({ resolution, amount: duration.amount });
    },
    [duration.amount, setCustomDuration]
  );

  return <TimeSelectMenu className={className} resolution={duration.resolution} onChange={onChange} />;
};

export const TradeDuration = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
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

const usePartialFillWarning = () => {
  const minDurationMillis = useMinDuration().millis;
  const tradeDuration = useDuration().millis;
  const { translations: t } = useTwapContext();

  return useMemo(() => {
    if (!tradeDuration) return;
    if (minDurationMillis > tradeDuration) {
      return t.partialFillWarning;
    }
  }, [minDurationMillis, tradeDuration, t]);
};

const WarningComponent = () => {
  const durationWarning = useTradeDurationWarning();
  const partialFillWarning = usePartialFillWarning();
  const warning = durationWarning || partialFillWarning;

  if (!warning) return null;

  return (
    <BottomContent>
      <Message title={warning} variant="warning" />
    </BottomContent>
  );
};
const MaxDurationLabel = () => {
  const translations = useTwapContext().translations;
  return <Label tooltipText={translations.maxDurationTooltip}>{translations.expiry}</Label>;
};

const Reset = ({ Component }: { Component?: FC<{ onClick: () => void }> }) => {
  const setCustomDuration = stateActions.useSetCustomDuration();
  const customDuration = useTwapContext().state.customDuration;

  if (!customDuration) return null;

  if (Component) {
    return <Component onClick={() => setCustomDuration(undefined)} />;
  }

  return (
    <Button className="twap-duration-reset" onClick={() => setCustomDuration(undefined)}>
      Default
    </Button>
  );
};

TradeDuration.Resolution = Resolution;
TradeDuration.Input = Input;
TradeDuration.Label = MaxDurationLabel;
TradeDuration.Reset = Reset;

const Container = styled(StyledColumnFlex)({
  gap: 0,
});
