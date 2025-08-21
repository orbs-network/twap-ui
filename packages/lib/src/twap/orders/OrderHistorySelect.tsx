import React, { FC, useCallback, useMemo } from "react";
import { OrderStatus, SelectMeuItem, SelectMenuProps } from "../../types";
import { useTwapContext } from "../../context";
import { useTwapStore } from "../../useTwapStore";

const ALL_STATUS = { text: "All", value: "" };

export function OrderHistoryMenu({ SelectMenu }: { SelectMenu: FC<SelectMenuProps> }) {
  const status = useTwapStore((s) => s.state.orderHIstoryStatusFilter);
  const updateState = useTwapStore((s) => s.updateState);
  const setStatus = useCallback(
    (status: OrderStatus) => {
      updateState({ orderHIstoryStatusFilter: status });
    },
    [updateState],
  );

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

  if (SelectMenu) {
    return <SelectMenu onSelect={onSelect} selected={selected} items={items} />;
  }

  return null;
}
