import React from "react";
import { TimeSelector } from "../components";
import { useCustomActions } from "../hooks";
import { useTwapStore } from "../store";

function TradeIntervalSelector() {
  const setFillDelay = useTwapStore((store) => store.setFillDelay);
  const fillDelay = useTwapStore((store) => store.getFillDelay());

  const { onFillDelayBlur, onFillDelayFocus } = useCustomActions();
  return <TimeSelector onFocus={onFillDelayFocus} onBlur={onFillDelayBlur} onChange={setFillDelay} value={fillDelay} />;
}

export default TradeIntervalSelector;
