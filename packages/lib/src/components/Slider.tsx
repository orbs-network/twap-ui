import React, { useEffect, useState } from "react";
import MuiSlider from "@mui/material/Slider";
import { styled } from "@mui/system";

function valueLabelFormat(value: number) {
  return value.toString();
}

function calculateValue(value: number) {
  return value;
}

export interface Props {
  onChange: (value: number) => void;
  value: number;
  maxTrades: number;
}

const Slider = ({ onChange, value, maxTrades }: Props) => {
  const handleChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      onChange(newValue);
    }
  };

  return (
    <StyledSlider
      value={value}
      min={1}
      step={1}
      // marks={getMarks(maxTrades)}
      max={maxTrades}
      scale={calculateValue}
      getAriaValueText={valueLabelFormat}
      valueLabelFormat={valueLabelFormat}
      onChange={handleChange}
      valueLabelDisplay="auto"
      className="twap-slider"
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

function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
