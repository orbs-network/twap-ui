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
  prefix = `${SQUIGLE} $ `,
  suffix = "",
  emptyUi,
  onlyValue,
  tooltipPrefix = `${SQUIGLE} $ `,
}: {
  isLoading?: boolean;
  value?: string | number;
  className?: string;
  emptyUi?: React.ReactNode;
  onlyValue?: boolean;
  suffix?: string;
  prefix?: string;
  tooltipPrefix?: string;
}) => {
  const formattedValue = useFormatNumber({ value });
  const formattedValueTooltip = useFormatNumber({ value, decimalScale: 18 });

  if (value == null) return null;
  return (
    <Tooltip text={`${tooltipPrefix}${formattedValueTooltip}${suffix}`} placement="bottom">
      <StyledLabel loading={isLoading} className={`twap-usd ${className} ${value === "0" ? "twap-usd-zero" : ""} `}>
        {value == 0 && emptyUi ? (
          <>{emptyUi}</>
        ) : onlyValue ? (
          <>{formattedValue}</>
        ) : (
          <>
            {prefix}
            <>{formattedValue}</>
            {suffix}
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
  minWidth: "0px",
});
