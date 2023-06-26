import { styled } from "@mui/system";
import React from "react";
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
}: {
  prefix?: string;
  isLoading?: boolean;
  value?: string | number;
  className?: string;
  emptyUi?: React.ReactNode;
  onlyValue?: boolean;
}) => {
  const formattedValue = useFormatNumber({ value });
  if (value == null) return null;
  return (
    <Tooltip text={`$ ${formattedValue}`} placement="bottom">
      <StyledLabel loading={isLoading} className={`twap-usd ${className} ${value === "0" ? "twap-usd-zero" : ""} `}>
        {value == 0 && emptyUi ? (
          <>{emptyUi}</>
        ) : onlyValue ? (
          <>{formattedValue}</>
        ) : (
          <>
            {prefix} ~ $ <>{formattedValue}</>
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
