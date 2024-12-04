import { styled } from "styled-components";
import React from "react";
import { SQUIGLE } from "../../config";
import { useTwapContext } from "../../context/context";
import { useFormatNumberV2 } from "../../hooks/hooks";
import { textOverflow } from "../../styles";
import SmallLabel from "./SmallLabel";

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
  const formattedValue = useFormatNumberV2({ value, decimalScale });

  const context = useTwapContext()?.uiPreferences;

  const _prefix = prefix || context?.usdPrefix || `${SQUIGLE} $ `;
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
          <>{formattedValue || "0"}</>
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
