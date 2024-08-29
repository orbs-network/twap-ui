import { styled } from "styled-components";
import { useCallback, useState } from "react";
import { Translations } from "../../types";
import NumericInput from "./NumericInput";
import { StyledRowFlex } from "../../styles";
import { SelectMenu } from "./SelectMenu";
import { Duration, TimeResolution } from "@orbs-network/twap-sdk";

const timeArr: { text: keyof Translations; value: TimeResolution }[] = [
  {
    text: "minutes",
    value: TimeResolution.Minutes,
  },
  {
    text: "hours",
    value: TimeResolution.Hours,
  },
  {
    text: "days",
    value: TimeResolution.Days,
  },
];

interface Props {
  value: Duration;
  onChange: ({ resolution, amount }: Duration) => void;
  disabled?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
}

export function TimeSelector({ value, onChange, disabled = false, className = "", onFocus, onBlur, placeholder = "0" }: Props) {
  const onResolutionSelect = useCallback(
    (resolution: TimeResolution) => {
      onChange({ resolution, amount: value.amount });
    },
    [onChange],
  );

  return (
    <StyledContainer className={`twap-time-selector ${className}`} style={{ pointerEvents: disabled ? "none" : "unset" }}>
      <StyledInput
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        value={value.amount}
        onChange={(v) => onChange({ resolution: value.resolution, amount: Number(v) })}
        placeholder={placeholder}
      />

      <ResolutionSelect resolution={value.resolution} onChange={onResolutionSelect} />
    </StyledContainer>
  );
}

export const ResolutionSelect = ({ onChange, resolution, className = "" }: { onChange: (resolution: TimeResolution) => void; resolution: TimeResolution; className?: string }) => {
  const onSelect = useCallback(
    (resolution: TimeResolution) => {
      onChange(resolution);
    },
    [onChange],
  );

  return <SelectMenu onSelect={(it) => onSelect(it.value as number)} items={timeArr} selected={resolution} />;
};

const StyledInput = styled(NumericInput)({
  flex: 1,
  input: {
    textAlign: "left",
    paddingLeft: 10,
    flex: "unset",
    width: "100%",
    "&::placeholder": {
      color: "white",
    },
  },
});

const StyledContainer = styled(StyledRowFlex)({});
