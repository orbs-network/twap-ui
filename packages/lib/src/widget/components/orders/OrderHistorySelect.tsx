import React, { useCallback, useMemo } from "react";
import { useOrderHistoryContext } from "./context";
import { OrderStatus, SelectMeuItem } from "../../../types";
import { SelectMenu } from "../../../components/base";

export function OrderHistoryMenu() {
  const { setStatus, status } = useOrderHistoryContext();

  const onSelect = useCallback((item: SelectMeuItem) => setStatus(item?.value as OrderStatus), [setStatus]);

  const items = useMemo(() => {
    const result = Object.keys(OrderStatus).map((it) => {
      return {
        text: it,
        value: it,
      };
    });
    return [{ text: "All", value: "" }, ...result];
  }, []);

  return <SelectMenu onSelect={onSelect} selected={status || ""} items={items} />;
}
