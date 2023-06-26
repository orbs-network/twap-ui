import MuiSlider from "@mui/material/Slider";
import { styled } from "@mui/system";

function valueLabelFormat(value: number) {
  return value.toLocaleString();
}

function calculateValue(value: number) {
  return value;
}

export interface Props {
  onChange: (value: number) => void;
  value: number;
  maxTrades: number;
  className?: string;
}

const Slider = ({ onChange, value, maxTrades, className = "" }: Props) => {
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
