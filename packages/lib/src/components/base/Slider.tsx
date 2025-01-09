import { Mark } from "@mui/base/useSlider";
import MuiSlider from "@mui/material/Slider";
import { styled } from "@mui/system";
import { forwardRef, useMemo } from "react";

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

const generateMarks = (max: number) => {
  if (max < 2) return []; // No marks if max is less than 2
  const steps = 4; // Fixed number of marks (e.g., 4 including min and max)

  const stepSize = max / (steps - 1); // Divide range into equal parts
  const marks = [];
  for (let i = 0; i < steps; i++) {
    const value = Math.round(i * stepSize); // Mark values
    marks.push({
      value,
    });
  }
  return marks;
};
const Slider = ({ onChange, value, maxTrades, className = "" }: Props) => {
  const handleChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      onChange(newValue);
    }
  };

  const _value = Math.max(1, value);

  const marks = useMemo(() => generateMarks(maxTrades), [maxTrades]);

  return (
    <StyledSlider
      value={_value}
      min={1}
      step={1}
      max={Math.max(maxTrades, 2)}
      scale={calculateValue}
      getAriaValueText={valueLabelFormat}
      valueLabelFormat={valueLabelFormat}
      onChange={handleChange}
      valueLabelDisplay="auto"
      className={`twap-slider ${className}`}
      slots={{
        thumb: Thumb,
      }}
    />
  );
};

export function FrontBody() {
  return (
    <svg width="33" height="50" viewBox="0 0 33 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 20H21V23.2489C22.0317 23.5694 23.0873 24.1899 23.9509 25.0535C25.9685 27.0711 26.6591 30.1368 25.2984 31.4974C24.1126 32.6833 22.316 31.6267 20.5384 30H19.7506C20.1795 31.3787 20.0726 32.715 19.2944 33.4933C17.9344 34.8532 15.7708 33.2624 13.7542 31.2458C13.3424 30.834 12.9483 30.416 12.5935 30H4V20Z"
        fill="#1FC7D4"
      />
      <g filter="url(#filter0_d_376_96946)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.7694 7.63421C15.8457 8.02664 15.9158 8.4375 15.9836 8.85716C15.6151 8.85766 15.2482 8.87522 14.8839 8.90895C14.6029 8.29464 14.2694 7.67199 13.8844 7.05277C11.3961 3.05079 9.06199 2.9011 6.98861 4.01265C4.91524 5.12421 4.81068 7.89597 7.28297 10.5919C7.57049 10.9054 7.86254 11.2384 8.15744 11.5804C5.66027 13.5156 4 16.291 4 19.2695C4 24.8292 9.78518 26 16 26C22.2148 26 28 24.8292 28 19.2695C28 15.8488 25.8101 12.6958 22.6776 10.776C22.8852 9.81022 23 8.74856 23 7.63421C23 3.17171 21.159 2 18.888 2C16.6171 2 15.1155 4.27116 15.7694 7.63421Z"
          fill="url(#paint0_linear_376_96946)"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 16.5C13 17.6046 12.5523 18 12 18C11.4477 18 11 17.6046 11 16.5C11 15.3954 11.4477 15 12 15C12.5523 15 13 15.3954 13 16.5ZM16.737 17.9444C16.7214 17.9441 16.7056 17.9446 16.6897 17.9458C16.4144 17.9672 16.2085 18.2077 16.2299 18.483C16.2582 18.8472 16.1945 19.3896 15.9385 19.8211C15.7032 20.2178 15.2896 20.5554 14.498 20.5554C14.2219 20.5554 13.998 20.7792 13.998 21.0554C13.998 21.3315 14.2219 21.5554 14.498 21.5554C15.5974 21.5554 16.3166 21.0727 16.737 20.4301C17.1574 21.0727 17.8767 21.5554 18.976 21.5554C19.2521 21.5554 19.476 21.3315 19.476 21.0554C19.476 20.7792 19.2521 20.5554 18.976 20.5554C18.1844 20.5554 17.7708 20.2178 17.5355 19.8211C17.2795 19.3896 17.2158 18.8472 17.2441 18.483C17.2655 18.2077 17.0596 17.9672 16.7843 17.9458C16.7684 17.9446 16.7526 17.9441 16.737 17.9444ZM21 18C21.5523 18 22 17.6046 22 16.5C22 15.3954 21.5523 15 21 15C20.4477 15 20 15.3954 20 16.5C20 17.6046 20.4477 18 21 18Z"
        fill="black"
      />
      <defs>
        <filter id="filter0_d_376_96946" x="2" y="0.5" width="28" height="28" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="0.5" />
          <feGaussianBlur stdDeviation="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_376_96946" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_376_96946" result="shape" />
        </filter>
        <linearGradient id="paint0_linear_376_96946" x1="16" y1="2" x2="16" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#53DEE9" />
          <stop offset="1" stopColor="#1FC7D4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const Thumb = forwardRef((props: any, ref: any) => {
  // Spread props to ensure Slider-specific props are applied correctly
  return (
    <StyledThumb
      {...props} // Pass all MUI-specific props
      ref={ref} // Forward the ref to make the element focusable
      dataIndex={props["data-index"]} // Ensure the element is focusable
      type="range"
      className={`twap-slider-thumb ${props.className}`}
    >
      <FrontBody />
    </StyledThumb>
  );
});

const StyledThumb = styled("div")({
  position: "relative",
  top: -23,
  marginLeft: -20,
  zIndex: 1,
});

export default Slider;

const StyledSlider = styled(MuiSlider)({
  "& .MuiSlider-markLabel": {
    maxWidth: 50,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
});
