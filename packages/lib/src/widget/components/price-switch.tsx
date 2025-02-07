import React from "react";
import { useWidgetContext } from "../..";
import { Switch } from "../../components/base";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/useShouldWrapOrUnwrap";
import { StyledText } from "../../styles";

export const PriceSwitch = ({ className = "" }: { className?: string }) => {
  const { twap, isLimitPanel } = useWidgetContext();
  const {
    values: { isMarketOrder },
    actionHandlers: { setIsMarketPrice },
  } = twap;
  const hide = useShouldWrapOrUnwrapOnly();

  if (hide || isLimitPanel) return null;

  return (
    <div className="twap-price-switch">
      <StyledText>Limit price</StyledText>
      <Switch checked={!isMarketOrder} onChange={() => setIsMarketPrice(!isMarketOrder)} />
    </div>
  );
};
