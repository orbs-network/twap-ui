import React, { useCallback, useMemo } from "react";
import { useOrderHistoryContext } from "./context";
import { OrderStatus, SelectMeuItem } from "../../types";
import { useTwapContext } from "../../context";

const ALL_STATUS = { text: "All", value: "" };

export function OrderHistoryMenu() {
  const { setStatus, status } = useOrderHistoryContext();
  const context = useTwapContext();
  const onSelect = useCallback((item: SelectMeuItem) => setStatus(item?.value as OrderStatus), [setStatus]);

  const items = useMemo(() => {
    const result = Object.keys(OrderStatus).map((it) => {
      return {
        text: it,
        value: it,
      };
    });
    return [ALL_STATUS, ...result];
  }, []);

  const selected = items.find((it) => it.value === status) || ALL_STATUS;

  if (context?.OrderHistory?.SelectMenu) {
    return <context.OrderHistory.SelectMenu onSelect={onSelect} selected={selected} items={items} />;
  }

  return null;
}
