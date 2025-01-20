import { styled } from "@mui/material";
import React from "react";
import { useTwapContext } from "../../context";
import { formatWithDecimals, useFormatNumber } from "../../hooks";
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
  decimalScale,
}: {
  isLoading?: boolean;
  value?: string | number;
  className?: string;
  emptyUi?: React.ReactNode;
  onlyValue?: boolean;
  suffix?: string;
  prefix?: string;
  decimalScale?: number;
}) => {
  const formattedValue = useFormatNumber({ value: formatWithDecimals(value?.toString(), 2), thousandSeparator: true });

  const context = useTwapContext()?.uiPreferences;

  const _prefix = prefix || context?.usdPrefix || `~ $ `;
  const _suffix = suffix || context?.usdSuffix;
  const _emptyUi = emptyUi || context?.usdEmptyUI;

  if (value == null) return null;
  return (
    <StyledLabel loading={isLoading} className={`twap-usd ${className} ${value === "0" ? "twap-usd-zero" : ""} `}>
      {value == 0 && emptyUi ? (
        <>{_emptyUi}</>
      ) : onlyValue ? (
        <>{formattedValue}</>
      ) : (
        <>
          {_prefix}
          <>{value && Number(value) < 0.01 ? "<0.01" : formattedValue || "0"}</>
          {_suffix}
        </>
      )}
    </StyledLabel>
  );
};

export default USD;

const StyledLabel = styled(SmallLabel)({
  overflow: "hidden",
  ...textOverflow,
  minWidth: "0px",
});
