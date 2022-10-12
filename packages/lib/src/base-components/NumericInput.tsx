import { Box, Fade } from "@mui/material";
import { styled } from "@mui/system";
import Loader from "./Loader";

function NumericInput({
  onChange,
  value = "",
  disabled = false,
  placeholder = "Enter amount",
  onFocus,
  onBlur,
  loading = false,
}: {
  onChange: (value: string) => void;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  isAllowed?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  loading?: boolean;
}) {
  const handleChange = (value: any) => {
    onChange(value);
  };
  return (
    <StyledContainer>
      <Fade in={loading} style={{ transition: "0s" }}>
        <StyledLoader>
          <Loader width="100%" height="100%" />
        </StyledLoader>
      </Fade>
      <Fade in={!loading} style={{ transition: "0s" }}>
        <StyledInput
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          type="number"
          onChange={(e) => handleChange(e.target.value)}
          className="twap-input"
        />
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
