import { styled } from "styled-components";
import { FC, ReactNode, useCallback, useMemo } from "react";
import { useTwapContext } from "../context/context";
import { useDuration, useShouldWrapOrUnwrapOnly, useSetDuration, useIsMinTradeDurationWarning, useIsMaxTradeDurationWarning, useIsPartialFillWarning } from "../hooks/lib";
import { StyledColumnFlex } from "../styles";
import { BottomContent, Button, Label, Message, NumericInput, ResolutionSelect } from "./base";
import { MIN_DURATION_MILLIS_FORMATTED, TimeResolution } from "@orbs-network/twap-sdk";

const Input = ({ placeholder = "0", className = "" }: { placeholder?: string; className?: string }) => {
  const duration = useDuration().duration;
  const setCustomDuration = useSetDuration();

  return (
    <StyledInput
      className={className}
      value={duration.amount}
      onChange={(v) => setCustomDuration({ resolution: duration.resolution, amount: Number(v) })}
      placeholder={placeholder}
    />
  );
};

const StyledInput = styled(NumericInput)({
  input: {
    padding: "0px",
  },
});

const Resolution = ({ placeholder, className = "" }: { placeholder?: string; className?: string }) => {
  const duration = useDuration().duration;
  const setCustomDuration = useSetDuration();

  const onChange = useCallback(
    (resolution: TimeResolution) => {
      setCustomDuration({ resolution, amount: duration.amount });
    },
    [duration.amount, setCustomDuration],
  );

  return <ResolutionSelect className={className} resolution={duration.resolution} onChange={onChange} />;
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

const WarningComponent = () => {
  const { translations: t } = useTwapContext();
  const minDurationWarning = useIsMinTradeDurationWarning();
  const maxDurationWarning = useIsMaxTradeDurationWarning();
  const partialFillWarning = useIsPartialFillWarning();

  const warning = useMemo(() => {
    if (minDurationWarning) {
      return t.minDurationWarning.replace("{duration}", MIN_DURATION_MILLIS_FORMATTED.toString());
    }
    if (maxDurationWarning) {
      return t.maxDurationWarning;
    }
    if (partialFillWarning) {
      return t.partialFillWarning;
    }
  }, [minDurationWarning, maxDurationWarning, partialFillWarning, t]);

  if (!warning) return null;

  return (
    <BottomContent>
      <Message title={warning} variant="warning" />
    </BottomContent>
  );
};
const MaxDurationLabel = () => {
  const translations = useTwapContext().translations;
  return (
    <Label>
      <Label.Text text={translations.expiry} />
      <Label.Info text={translations.maxDurationTooltip} />
    </Label>
  );
};

const Reset = ({ Component }: { Component?: FC<{ onClick: () => void }> }) => {
  const setCustomDuration = useSetDuration();
  const { state } = useTwapContext();
  const { typedDuration } = state;

  if (!typedDuration) return null;

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
