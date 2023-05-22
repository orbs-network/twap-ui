import { styled } from "@mui/system";
import React, { ReactNode } from "react";
import { useTwapContext } from "../../context";
import NumberDisplay from "./NumberDisplay";
import SmallLabel from "./SmallLabel";

interface Props {
  isLoading: boolean;
  value?: string;
  className?: string;
  label?: string;
  suffix?: string;
  hideLabel?: boolean;
  emptyUi?: ReactNode;
}

function Balance({ isLoading, value, className = "", label, suffix, hideLabel, emptyUi }: Props) {
  const translations = useTwapContext().translations;
  if (value == null) {
    return null;
  }
  return (
    <StyledLabel loading={isLoading} className={`twap-balance ${className}`}>
      {hideLabel ? null : label ? <span className="twap-balance-title">{label}</span> : <span className="twap-balance-title">{translations.balance}:</span>}{" "}
      {!value && emptyUi ? emptyUi : <NumberDisplay value={value} suffix={suffix ? ` ${suffix}` : undefined} />}
    </StyledLabel>
  );
}

export default Balance;

const StyledLabel = styled(SmallLabel)({
  maxWidth: "50%",
});
