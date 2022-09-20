import { Box, styled } from "@mui/system";
import { NumericFormat } from "react-number-format";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function AmountInput({ onChange, value, placeholder = "Enter amount" }: Props) {
  return (
    <StyledContainer>
      <NumericFormat
        placeholder={placeholder}
        value={value}
        onValueChange={(values) => {
          onChange(values.value);
        }}
        customInput={StyledInput}
        displayType="input"
      />
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
});
