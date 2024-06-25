import MuiSlider from "@mui/material/Slider";
import { styled } from "@mui/system";
import { useCallback, useEffect, useState } from "react";

function calculateValue(value: number) {
  return value;
}

export interface Props {
  onChange: (value: number) => void;
  value: number;
  maxTrades: number;
  className?: string;
  label?: string;
  min?: number;
}

const Slider = ({ onChange, value, maxTrades, className = "", label, min }: Props) => {
  const handleChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      onChange(newValue);
    }
  };

  const valueLabelFormat = useCallback(
    (value: number) => {
      return label || value.toLocaleString();
    },
    [label]
  );

  return (
    <StyledSlider
      value={value}
      min={min || 1}
      step={1}
      // marks={getMarks(maxTrades)}
      max={maxTrades}
      scale={calculateValue}
      getAriaValueText={valueLabelFormat}
      valueLabelFormat={valueLabelFormat}
      onChange={handleChange}
      valueLabelDisplay="auto"
      className={`twap-slider ${className}`}
    />
  );
};

export default Slider;

const StyledSlider = styled(MuiSlider)({
  "& .MuiSlider-markLabel": {
    maxWidth: 50,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
});
