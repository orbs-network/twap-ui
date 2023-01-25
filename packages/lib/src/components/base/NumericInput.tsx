import { Box, Fade } from "@mui/material";
import { styled } from "@mui/system";
import Loader from "./Loader";
import { NumericFormat } from "react-number-format";

export interface Props {
  onChange: (value: string) => void;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  isAllowed?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  loading?: boolean;
  className?: string;
  maxValue?: string;
  prefix?: string;
  decimalScale?: number;
  minAmount?: number;
}

function NumericInput({
  prefix = "",
  onChange,
  value,
  disabled = false,
  placeholder = "Enter amount",
  onFocus,
  onBlur,
  loading = false,
  className = "",
  maxValue,
  decimalScale,
  minAmount,
}: Props) {
  const inputValue = value || minAmount || "";

  return (
    <StyledContainer className={`twap-input ${className}`}>
      <Fade in={loading} style={{ transition: "0s" }}>
        <span>
          <StyledLoader width="75%" height="60%" />
        </span>
      </Fade>
      <Fade in={!loading} style={{ transition: "0s" }}>
        <StyledFlex>
          <NumericFormat
            disabled={disabled}
            decimalScale={decimalScale}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            isAllowed={(values) => {
              const { floatValue = 0 } = values;
              return maxValue ? floatValue <= parseFloat(maxValue) : true;
            }}
            prefix={prefix ? `${prefix} ` : ""}
            value={disabled && value === "0" ? "" : inputValue}
            thousandSeparator=","
            decimalSeparator="."
            customInput={StyledInput}
            type="text"
            min={minAmount}
            onValueChange={(values, _sourceInfo) => {
              if (_sourceInfo.source !== "event") {
                return;
              }

              onChange(values.formattedValue);
            }}
          />
        </StyledFlex>
      </Fade>
    </StyledContainer>
  );
}

export default NumericInput;

const StyledLoader = styled(Loader)({
  position: "absolute",
  left: 0,
  top: "50%",
  transform: "translate(0, -50%)",
});

const StyledContainer = styled(Box)({
  flex: 1,
  height: "100%",
  position: "relative",
});

const StyledInput = styled("input")(({ disabled }: { disabled: boolean }) => ({
  pointerEvents: disabled ? "none" : "unset",
  height: "100%",
  width: "100%",
  fontSize: 16,
  border: "unset",
  background: "transparent",
  outline: "unset",
  fontWeight: 500,
}));

const StyledFlex = styled(Box)({
  display: "flex",
  alignItems: "center",
});
