import { FC, useCallback } from "react";
import styled from "styled-components";
import { useTwapContext } from "../../context/context";
import { useSetIsMarket } from "../../hooks/lib";
import { StyledRowFlex } from "../../styles";
import { LimitSwitchArgs } from "../../types";

export const LimitSwitch = ({ className = "", Component }: { className?: string; Component?: FC<LimitSwitchArgs> }) => {
  const { isLimitPanel, state } = useTwapContext();

  const { isMarketOrder } = state;
  const onChange = useSetIsMarket();

  const onSelect = useCallback(
    (value: boolean) => {
      onChange(value);
    },
    [onChange],
  );

  if (isLimitPanel) return null;

  if (Component) {
    return (
      <Component
        onClick={onSelect}
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
      <StyledLimitSwitchButton
        className={`${!!isMarketOrder ? "twap-limit-switch-selected" : "twap-limit-switch-not-selected"}`}
        $selected={!!isMarketOrder}
        onClick={() => onSelect(true)}
      >
        Market
      </StyledLimitSwitchButton>
      <StyledLimitSwitchButton
        className={`${!isMarketOrder ? "twap-limit-switch-selected" : "twap-limit-switch-not-selected"}`}
        $selected={!isMarketOrder}
        onClick={() => onSelect(false)}
      >
        Limit
      </StyledLimitSwitchButton>
    </StyledLimitSwitch>
  );
};

const StyledLimitSwitch = styled(StyledRowFlex)({
  padding: 3,
  overflow: "hidden",
  width: "auto",
  borderRadius: 20,
});

const StyledLimitSwitchButton = styled("button")<{ $selected: boolean }>(($selected) => {
  return {};
});
