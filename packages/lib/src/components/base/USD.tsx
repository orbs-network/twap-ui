import { styled } from "@mui/system";
import React from "react";
import { SQUIGLE } from "../../config";
import { useFormatNumber } from "../../hooks";
import { textOverflow } from "../../styles";
import SmallLabel from "./SmallLabel";
import Tooltip from "./Tooltip";

const USD = ({
  isLoading = false,
  value,
  className = "",
  prefix = "",
  emptyUi,
  onlyValue,
  symbol,
}: {
  prefix?: string;
  isLoading?: boolean;
  value?: string | number;
  className?: string;
  emptyUi?: React.ReactNode;
  onlyValue?: boolean;
  symbol?: string;
}) => {
  const formattedValue = useFormatNumber({ value });
  const formattedValueTooltip = useFormatNumber({ value, decimalScale: 18 });

  if (value == null) return null;
  return (
    <Tooltip text={`${!symbol ? "$" : ""} ${formattedValueTooltip} ${symbol}`} placement="bottom">
      <StyledLabel loading={isLoading} className={`twap-usd ${className} ${value === "0" ? "twap-usd-zero" : ""} `}>
        {value == 0 && emptyUi ? (
          <>{emptyUi}</>
        ) : onlyValue ? (
          <>{formattedValue}</>
        ) : (
          <>
            {prefix} {SQUIGLE} {!symbol ? "$" : ""} <>{formattedValue}</> {symbol}
          </>
        )}
      </StyledLabel>
    </Tooltip>
  );
};

export default USD;

const StyledLabel = styled(SmallLabel)({
  overflow: "hidden",
  ...textOverflow,
});
