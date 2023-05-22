import { styled } from "@mui/system";
import React from "react";
import NumberDisplay from "./NumberDisplay";
import SmallLabel from "./SmallLabel";

const USD = ({
  isLoading = false,
  value,
  className = "",
  prefix = "",
  emptyUi,
}: {
  prefix?: string;
  isLoading?: boolean;
  value?: string | number;
  className?: string;
  emptyUi?: React.ReactNode;
}) => {
  if (value == null) return null;
  return (
    <StyledLabel loading={isLoading} className={`twap-usd ${className}`}>
      {value == 0 && emptyUi ? (
        <>{emptyUi}</>
      ) : (
        <>
          {prefix} ~ $ <NumberDisplay value={value} />
        </>
      )}
    </StyledLabel>
  );
};

export default USD;

const StyledLabel = styled(SmallLabel)({
  maxWidth: "50%",
});
