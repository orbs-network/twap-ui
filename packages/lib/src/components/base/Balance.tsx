import { styled } from "@mui/system";
import React from "react";
import { useTwapContext } from "../../context";
import NumberDisplay from "./NumberDisplay";
import SmallLabel from "./SmallLabel";

interface Props {
  isLoading: boolean;
  value?: string;
  className?: string;
  label?: string;
}

function Balance({ isLoading, value, className = "", label }: Props) {
  const translations = useTwapContext().translations;
  if (value == null) {
    return null;
  }
  return (
    <StyledLabel loading={isLoading} className={`twap-balance ${className}`}>
      {label ? <span className="twap-balance-title">{label}</span> : <span className="twap-balance-title">{translations.balance}:</span>}
      {" "}<NumberDisplay value={value} />
    </StyledLabel>
  );
}

export default Balance;

const StyledLabel = styled(SmallLabel)({
  maxWidth: "50%",
});
