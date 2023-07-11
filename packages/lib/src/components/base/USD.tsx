import { styled } from "@mui/system";
import React from "react";
import { SQUIGLE } from "../../config";
import { useTwapContext } from "../../context";
import { useFormatNumber } from "../../hooks";
import { textOverflow } from "../../styles";
import SmallLabel from "./SmallLabel";
import Tooltip from "./Tooltip";

const USD = ({
  isLoading = false,
  value,
  className = "",
  prefix,
  suffix = "",
  emptyUi,
  onlyValue,
}: {
  isLoading?: boolean;
  value?: string | number;
  className?: string;
  emptyUi?: React.ReactNode;
  onlyValue?: boolean;
  suffix?: string;
  prefix?: string;
}) => {
  const formattedValue = useFormatNumber({ value });
  const formattedValueTooltip = useFormatNumber({ value, decimalScale: 18 });

  const { usdSuffix, usdPrefix, usdEmptyUI } = useTwapContext().uiPreferences;

  const _prefix = prefix || usdPrefix || `${SQUIGLE} $ `;
  const _suffix = suffix || usdSuffix;
  const _emptyUi = emptyUi || usdEmptyUI;

  if (value == null) return null;
  return (
    <Tooltip text={`${_prefix}${formattedValueTooltip}${_suffix}`} placement="bottom">
      <StyledLabel loading={isLoading} className={`twap-usd ${className} ${value === "0" ? "twap-usd-zero" : ""} `}>
        {value == 0 && emptyUi ? (
          <>{_emptyUi}</>
        ) : onlyValue ? (
          <>{formattedValue}</>
        ) : (
          <>
            {_prefix}
            <>{formattedValue}</>
            {_suffix}
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
