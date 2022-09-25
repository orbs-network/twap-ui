import { Box, styled } from "@mui/system";
import { BigNumber, parsebn } from "@defi.org/web3-candies";
import { useEffect, useState } from "react";

export type Props = {
  onChange: (value: BigNumber) => void;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  isAllowed?: boolean;
};

function AmountInput({ onChange, value, disabled = false, isAllowed = false, placeholder = "Enter amount" }: Props) {
  const [localValue, setValue] = useState(value);

  useEffect(() => {
    setValue("");
    setValue(value);
  }, [value]);

  const onInput = (e: any) => {
    const v = e.target.value;
    setValue(v);
    onChange(parsebn(v));
  };

  return (
    <StyledContainer>
      <input placeholder={placeholder} value={localValue} disabled={disabled} type="text" onInput={onInput} />
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
