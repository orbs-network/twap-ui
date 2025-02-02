import React, { FC } from "react";
import styled from "styled-components";
import { useWidgetContext } from "../..";
import { StyledRowFlex } from "../../styles";

export const LimitPriceSwitch = ({ className = "" }: { className?: string }) => {
  const { twap, translations } = useWidgetContext();
  const {
    values: { isMarketOrder },
    actionHandlers: { setIsMarketPrice },
  } = twap;

  return (
    <StyledLimitSwitch className={className}>
      <button className={`${!!isMarketOrder ? "twap-limit-switch-selected" : "twap-limit-switch-not-selected"}`} onClick={() => setIsMarketPrice(true)}>
        {translations.market}
      </button>
      <button className={`${!isMarketOrder ? "twap-limit-switch-selected" : "twap-limit-switch-not-selected"}`} onClick={() => setIsMarketPrice(false)}>
        {translations.limit}
      </button>
    </StyledLimitSwitch>
  );
};

const StyledLimitSwitch = styled(StyledRowFlex)({
  padding: 3,
  overflow: "hidden",
  width: "auto",
  borderRadius: 20,
});
