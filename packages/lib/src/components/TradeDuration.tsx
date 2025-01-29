import { styled } from "styled-components";
import React, { FC, ReactNode, useCallback } from "react";
import { useShouldWrapOrUnwrapOnly } from "../hooks/lib";
import { StyledColumnFlex } from "../styles";
import { BottomContent, Button, Label, Message, NumericInput, ResolutionSelect } from "./base";
import { TimeUnit } from "@orbs-network/twap-sdk";
import { useWidgetContext } from "../context/context";

const Input = ({ placeholder = "0", className = "" }: { placeholder?: string; className?: string }) => {
  const {
    values: { duration },
    actionHandlers: { setDuration },
  } = useWidgetContext().twap;

  return <StyledInput className={className} value={duration.value} onChange={(v) => setDuration({ unit: duration.unit, value: Number(v) })} placeholder={placeholder} />;
};

const StyledInput = styled(NumericInput)({
  input: {
    padding: "0px",
  },
});

const Resolution = ({ placeholder, className = "" }: { placeholder?: string; className?: string }) => {
  const {
    values: { duration },
    actionHandlers: { setDuration },
  } = useWidgetContext().twap;

  const onChange = useCallback(
    (unit: TimeUnit) => {
      setDuration({ unit, value: duration.value });
    },
    [duration.value, setDuration],
  );

  return <ResolutionSelect className={className} unit={duration.unit} onChange={onChange} />;
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
  const { translations: t, twap } = useWidgetContext();
  const errors = twap.errors;

  if (!errors.duration) return null;

  return (
    <BottomContent>
      <Message title={errors.duration.text} variant="warning" />
    </BottomContent>
  );
};
const MaxDurationLabel = () => {
  const translations = useWidgetContext().translations;
  return (
    <Label>
      <Label.Text text={translations.expiry} />
      <Label.Info text={translations.maxDurationTooltip} />
    </Label>
  );
};

const Reset = ({ Component }: { Component?: FC<{ onClick: () => void }> }) => {
  const {
    values: { duration },
    actionHandlers: { onResetDuration },
  } = useWidgetContext().twap;

  if (!duration) return null;

  if (Component) {
    return <Component onClick={onResetDuration} />;
  }

  return (
    <Button className="twap-duration-reset" onClick={onResetDuration}>
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
