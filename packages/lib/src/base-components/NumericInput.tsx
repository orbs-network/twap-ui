import { styled } from "@mui/system";

function NumericInput({
  onChange,
  value = "",
  disabled = false,
  placeholder = "Enter amount",
  onFocus,
  onBlur,
}: {
  onChange: (value: string) => void;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  isAllowed?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <StyledInput
      onBlur={onBlur}
      onFocus={onFocus}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      type="number"
      onChange={(e) => onChange(e.target.value)}
      className="twap-input"
    />
  );
}

export default NumericInput;

const StyledInput = styled("input")({
  height: "100%",
  flex: 1,
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
});
