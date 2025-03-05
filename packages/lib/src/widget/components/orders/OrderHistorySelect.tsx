import React, { useCallback, useMemo } from "react";
import { useOrderHistoryContext } from "./context";
import { OrderStatus } from "@orbs-network/twap-sdk";
import { SelectMeuItem } from "../../../types";
import { SelectMenu } from "../../../components/base";

export function OrderHistoryMenu() {
  const { setStatus, status } = useOrderHistoryContext();

  const onSelect = useCallback((item: SelectMeuItem) => setStatus(item?.value as OrderStatus), [setStatus]);

  const items = useMemo(() => {
    return Object.keys(OrderStatus).map((it) => {
      return {
        text: it,
        value: it.toLowerCase(),
      };
    });
  }, []);

  return <SelectMenu onSelect={onSelect} selected={status} items={items} />;
}
