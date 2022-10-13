import { Box, Fade } from "@mui/material";
import { styled } from "@mui/system";
import Loader from "./Loader";
import { NumericFormat } from "react-number-format";

function NumericInput({
  onChange,
  value,
  disabled = false,
  placeholder = "Enter amount",
  onFocus,
  onBlur,
  loading = false,
}: {
  onChange: (value: string) => void;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  isAllowed?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  loading?: boolean;
}) {
  return (
    <StyledContainer>
      <Fade in={loading} style={{ transition: "0s" }}>
        <StyledLoader>
          <Loader width="100%" height="100%" />
        </StyledLoader>
      </Fade>
      <Fade in={!loading} style={{ transition: "0s" }}>
        <div>
          <NumericFormat
            disabled={disabled}
            onBlur={onBlur}
            onFocus={onFocus}
            thousandsGroupStyle="thousand"
            placeholder={placeholder}
            value={value}
            thousandSeparator=","
            decimalSeparator="."
            customInput={StyledInput}
            className="twap-input"
            onValueChange={(values, _sourceInfo) => {
              onChange(values.value);
            }}
          />
        </div>
      </Fade>
    </StyledContainer>
  );
}

export default NumericInput;

const StyledLoader = styled(Box)({
  position: "absolute",
  left: 0,
  top: "50%",
  transform: "translate(0, -50%)",
  width: "70%",
  height: "80%",
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
  textIndent: 10,
  fontSize: 16,
  border: "unset",
  background: "transparent",
  outline: "unset",
  fontWeight: 500,
  paddingRight: 10,
  "& ::-webkit-outer-spin-button": {
    "-webkit-appearance": "none",
    margin: 0,
  },
  "::-webkit-inner-spin-button": {
    "-webkit-appearance": "none",
    margin: 0,
  },
  "& input[type=number]": {
    "-moz-appearance": "textfield",
  },
}));
