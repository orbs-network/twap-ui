import { styled } from "@mui/system";
import React from "react";
import NumberDisplay from "./NumberDisplay";
import SmallLabel from "./SmallLabel";

const USD = ({ isLoading = false, value, className = "", prefix = "" }: { prefix?: string; isLoading?: boolean; value?: string | number; className?: string }) => {
  if (value == null) return null;
  return (
    <StyledLabel loading={isLoading} className={`twap-usd ${className}`}>
      {prefix} ~ $<NumberDisplay value={value} />
    </StyledLabel>
  );
};

export default USD;

const StyledLabel = styled(SmallLabel)({
  maxWidth: "50%",
});
