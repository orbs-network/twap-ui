import React from "react";
import { Switch } from "../../components/base";
import { useTwapContext } from "../../context";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/logic-hooks";
import { usePriceToggle } from "../../hooks/ui-hooks";

export const PriceMode = ({ className = "" }: { className?: string }) => {
  const { isLimitPanel } = useTwapContext();
  const { isMarketOrder, setIsMarketOrder } = usePriceToggle();
  const hide = useShouldWrapOrUnwrapOnly();

  if (hide || isLimitPanel) return null;

  return (
    <div className={`twap-price-switch ${className}`}>
      <Switch checked={!isMarketOrder} onChange={() => setIsMarketOrder(!isMarketOrder)} />
    </div>
  );
};

export const usePriceModePanel = () => {
  const { isMarketOrder, setIsMarketOrder } = usePriceToggle();
  return {
    isMarketOrder,
    setIsMarketOrder,
  };
};

PriceMode.usePanel = usePriceModePanel;
