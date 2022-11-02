import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiSlider from "@mui/material/Slider";

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

export default function Slider({ onChange, value, maxTrades }: Props) {
  const handleChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      onChange(newValue);
    }
  };

  return (
    <MuiSlider
      value={value}
      min={1}
      step={1}
      max={maxTrades}
      scale={calculateValue}
      getAriaValueText={valueLabelFormat}
      valueLabelFormat={valueLabelFormat}
      onChange={handleChange}
      valueLabelDisplay="auto"
    />
  );
}
