import React, { useCallback, useMemo } from "react";
import { OrdersFilter, useOrderHistoryContext } from "./context";
import { SelectMeuItem } from "../../../types";
import { SelectMenu } from "../../../components/base";

export function OrderHistoryMenu() {
  const { setStatus, status } = useOrderHistoryContext();

  const onSelect = useCallback((item: SelectMeuItem) => setStatus(item?.value as OrdersFilter), [setStatus]);

  const items = useMemo(() => {
    return Object.keys(OrdersFilter).map((it) => {
      return {
        text: it,
        value: it.toLowerCase(),
      };
    });
  }, []);

  return <SelectMenu onSelect={onSelect} selected={status} items={items} />;
}
