import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiSlider from "@mui/material/Slider";
import { styled } from "@mui/system";
import Tooltip from "./Tooltip";
import { useTwapTranslations } from "../context";

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

const getMarks = (maxTrades: number) => {
  if (maxTrades < 4) return [];
  const size = maxTrades / 4;
  return Array.from(Array(4)).map((_, index) => {
    const value: number = size * (index + 1);
    return {
      value,
      label: value.toFixed(0),
    };
  });
};

const Slider = ({ onChange, value, maxTrades }: Props) => {
  const [localValue, setLocalValue] = React.useState(value);
  const debouncedValue = useDebounce<number>(localValue, 200);
  const translations = useTwapTranslations();

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setLocalValue(newValue);
    }
  };

  return (
    <Tooltip text={translations.totalTradesSliderTooltip}>
      <StyledSlider
        value={localValue}
        min={1}
        step={1}
        marks={getMarks(maxTrades)}
        max={maxTrades}
        scale={calculateValue}
        getAriaValueText={valueLabelFormat}
        valueLabelFormat={valueLabelFormat}
        onChange={handleChange}
        valueLabelDisplay="auto"
      />
    </Tooltip>
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
