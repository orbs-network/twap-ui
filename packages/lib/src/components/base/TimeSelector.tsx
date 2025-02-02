import { styled } from "styled-components";
import React, { useCallback } from "react";
import { Translations } from "../../types";
import NumericInput from "./NumericInput";
import { StyledRowFlex } from "../../styles";
import { SelectMenu } from "./SelectMenu";
import { TimeDuration, TimeUnit } from "@orbs-network/twap-sdk";

const timeArr: { text: keyof Translations; value: TimeUnit }[] = [
  {
    text: "minutes",
    value: TimeUnit.Minutes,
  },
  {
    text: "hours",
    value: TimeUnit.Hours,
  },
  {
    text: "days",
    value: TimeUnit.Days,
  },
];

interface Props {
  value: TimeDuration;
  onChange: (timeDuration: TimeDuration) => void;
  disabled?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
}

export function TimeSelector({ value, onChange, disabled = false, className = "", onFocus, onBlur, placeholder = "0" }: Props) {
  const onResolutionSelect = useCallback(
    (unit: TimeUnit) => {
      onChange({ unit, value: value.value });
    },
    [onChange]
  );

  return (
    <StyledContainer className={`twap-time-selector ${className}`} style={{ pointerEvents: disabled ? "none" : "unset" }}>
      <NumericInput
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        value={value.value}
        onChange={(v) => onChange({ unit: value.unit, value: Number(v) })}
        placeholder={placeholder}
      />

      <ResolutionSelect unit={value.unit} onChange={onResolutionSelect} />
    </StyledContainer>
  );
}

export const ResolutionSelect = ({
  onChange,
  unit,
  className = "",
  onOpen,
  onClose,
}: {
  onChange: (unit: TimeUnit) => void;
  unit: TimeUnit;
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
}) => {
  const onSelect = useCallback(
    (unit: TimeUnit) => {
      onChange(unit);
    },
    [onChange]
  );

  return <SelectMenu onOpen={onOpen} onClose={onClose} onSelect={(it) => onSelect(it.value as number)} items={timeArr} selected={unit} />;
};

const StyledContainer = styled(StyledRowFlex)({
  ".twap-input": {
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
  },
});
