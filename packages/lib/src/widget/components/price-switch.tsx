import React from "react";
import { useWidgetContext } from "../..";
import { Switch } from "../../components/base";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/useShouldWrapOrUnwrap";
import { StyledText } from "../../styles";
import { usePriceMode } from "../hooks";

export const PriceSwitch = ({ className = "" }: { className?: string }) => {
  const { isLimitPanel } = useWidgetContext();
  const { isMarketOrder, setIsMarketOrder } = usePriceMode();
  const hide = useShouldWrapOrUnwrapOnly();

  if (hide || isLimitPanel) return null;

  return (
    <div className={`twap-price-switch ${className}`}>
      <StyledText>Limit price</StyledText>
      <Switch checked={!isMarketOrder} onChange={() => setIsMarketOrder(!isMarketOrder)} />
    </div>
  );
};
