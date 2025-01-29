import React, { FC } from "react";
import styled from "styled-components";
import { useWidgetContext } from "..";
import { StyledRowFlex } from "../styles";
import { LimitSwitchArgs } from "../types";

export const LimitSwitch = ({ className = "", Component }: { className?: string; Component?: FC<LimitSwitchArgs> }) => {
  const { isLimitPanel, twap } = useWidgetContext();
  const {
    values: { isMarketOrder },
    actionHandlers: { setIsMarketPrice },
  } = twap;

  if (isLimitPanel) return null;

  if (Component) {
    return (
      <Component
        onClick={setIsMarketPrice}
        options={[
          { label: "Market", value: true },
          { label: "Limit", value: false },
        ]}
        selected={!!isMarketOrder}
      />
    );
  }

  return (
    <StyledLimitSwitch className={className}>
      <button className={`${!!isMarketOrder ? "twap-limit-switch-selected" : "twap-limit-switch-not-selected"}`} onClick={() => setIsMarketPrice(true)}>
        Market
      </button>
      <button className={`${!isMarketOrder ? "twap-limit-switch-selected" : "twap-limit-switch-not-selected"}`} onClick={() => setIsMarketPrice(false)}>
        Limit
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
