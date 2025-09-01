import { useCallback, useMemo } from "react";
import { OrderStatus, SelectMeuItem } from "../../types";

import { useTwapStore } from "../../useTwapStore";
import { useOrderHistoryContext } from "./context";

const ALL_STATUS = { text: "All", value: "" };

export function OrderHistoryMenu() {
  const { SelectMenu } = useOrderHistoryContext();
  const status = useTwapStore((s) => s.state.orderHIstoryStatusFilter);
  const updateState = useTwapStore((s) => s.updateState);
  const setStatus = useCallback(
    (status: OrderStatus) => {
      updateState({ orderHIstoryStatusFilter: status });
    },
    [updateState],
  );

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

  const selected = useMemo(() => {
    return (
      items.find((it) => it.value === status) || {
        text: "Open",
        value: "Open",
      }
    );
  }, [items, status]);

  if (SelectMenu) {
    return <SelectMenu onSelect={onSelect} selected={selected} items={items} />;
  }

  return null;
}
