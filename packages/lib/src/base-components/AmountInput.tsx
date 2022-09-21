import { Box, styled } from "@mui/system";
import { useEffect, useRef, useState } from "react";
import { NumericFormat } from "react-number-format";
import { NumberFormatValues } from "react-number-format/types/types";

interface Props {
  value: string | number;
  onChange?: (value: NumberFormatValues) => void;
  placeholder?: string;
  disabled?: boolean;
  isAllowed?: boolean;
}

function AmountInput({ onChange, value, placeholder = "Enter amount", disabled = false, isAllowed = false }: Props) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue("");
    setLocalValue(value);
  }, [value]);

  return (
    <StyledContainer>
      <NumericFormat
        disabled={disabled}
        placeholder={placeholder}
        value={localValue}
        defaultValue={value}
      
        onValueChange={(values) => {
          onChange?.(values);
        }}
        customInput={StyledInput}
        // displayType="input"
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
