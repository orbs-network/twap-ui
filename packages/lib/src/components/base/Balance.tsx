import { styled } from "styled-components";
import React, { ReactNode } from "react";
import { useWidgetContext } from "../../context/context";
import { useFormatNumberV2 } from "../../hooks/hooks";
import SmallLabel from "./SmallLabel";

interface Props {
  isLoading: boolean;
  value?: string;
  className?: string;
  label?: string;
  suffix?: string;
  hideLabel?: boolean;
  emptyUi?: ReactNode;
  decimalScale?: number;
  symbol: string;
}

function Balance({ isLoading, value, className = "", label, suffix, hideLabel, emptyUi, decimalScale }: Props) {
  const { translations, uiPreferences } = useWidgetContext();
  const _emptyUi = emptyUi || uiPreferences.balance?.emptyUI;

  const args = { value: value, suffix: suffix ? ` ${suffix}` : undefined };

  const formattedValue = useFormatNumberV2({ ...args, decimalScale });

  if (value == null) {
    return null;
  }

  return (
    <StyledLabel loading={isLoading} className={`twap-balance ${className}`}>
      {hideLabel ? null : label ? <span className="twap-balance-title">{label}</span> : <span className="twap-balance-title">{translations.balance}:</span>}{" "}
      {!value && _emptyUi ? _emptyUi : <>{formattedValue}</>}
    </StyledLabel>
  );
}

export default Balance;

const StyledLabel = styled(SmallLabel)({
  overflow: "hidden",
  minWidth: 0,
});
