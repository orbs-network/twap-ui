import React from "react";
import { Switch } from "../../components/base";
import { StyledText } from "../../styles";
import { useTwapContext } from "../../context";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/logic-hooks";
import { usePriceToggle } from "../../hooks/ui-hooks";

export const PriceSwitch = ({ className = "" }: { className?: string }) => {
  const { isLimitPanel } = useTwapContext();
  const { isMarketOrder, setIsMarketOrder } = usePriceToggle();
  const hide = useShouldWrapOrUnwrapOnly();

  if (hide || isLimitPanel) return null;

  return (
    <div className={`twap-price-switch ${className}`}>
      <StyledText>Limit price</StyledText>
      <Switch checked={!isMarketOrder} onChange={() => setIsMarketOrder(!isMarketOrder)} />
    </div>
  );
};
