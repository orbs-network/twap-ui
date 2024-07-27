import { FC, useCallback } from "react";
import styled from "styled-components";
import { useTwapContext } from "../../context/context";
import { stateActions } from "../../hooks";
import { StyledRowFlex } from "../../styles";
import { LimitSwitchArgs } from "../../types";

export const LimitSwitch = ({ className = "", Component }: { className?: string; Component?: FC<LimitSwitchArgs> }) => {
  const { state, isLimitPanel } = useTwapContext();

  const { isMarketOrder } = state;
  const onChange = stateActions.useOnLimitMarketSwitch();
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    onChange(newValue === "market" ? true : false);
  };

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
      <StyledLimitSwitchButton className={`${!!isMarketOrder ? "twap-limit-switch-selected" : ""}`} $selected={!!isMarketOrder} onClick={() => onSelect(true)}>
        Market
      </StyledLimitSwitchButton>
      <StyledLimitSwitchButton className={`${!isMarketOrder ? "twap-limit-switch-selected" : ""}`} $selected={!isMarketOrder} onClick={() => onSelect(false)}>
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
