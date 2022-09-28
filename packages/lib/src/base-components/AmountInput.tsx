import { Box, styled } from "@mui/system";
import { BigNumber, parsebn } from "@defi.org/web3-candies";

export type Props = {
  onChange: (value: BigNumber) => void;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  isAllowed?: boolean;
};

function AmountInput({ onChange, value, disabled = false, placeholder = "Enter amount" }: Props) {
  const onInput = (value: any) => {
    onChange(parsebn(value));
  };

  return (
    <StyledContainer>
      <StyledInput placeholder={placeholder} value={value} disabled={disabled} type="number" onChange={(e) => onInput(e.target.value)} />
    </StyledContainer>
  );
}

export default AmountInput;

const StyledContainer = styled(Box)({
  height: "100%",
  width: "100%",
});

const StyledInput = styled("input")({
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
});
