import React from "react";
import { useWidgetContext } from "../..";
import { Switch } from "../../components/base";
import { StyledText } from "../../styles";

export const PriceSwitch = ({ className = "" }: { className?: string }) => {
  const { twap } = useWidgetContext();
  const {
    values: { isMarketOrder },
    actionHandlers: { setIsMarketPrice },
  } = twap;

  return (
    <div className="twap-price-switch">
      <StyledText>Limit price</StyledText>
      <Switch checked={!isMarketOrder} onChange={() => setIsMarketPrice(!isMarketOrder)} />
    </div>
  );
};
