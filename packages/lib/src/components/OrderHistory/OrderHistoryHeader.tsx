import styled from "styled-components";

import React, { useCallback, useMemo, useState } from "react";
import { useOrderHistoryContext, useSelectedOrder } from "./context";
import { StyledRowFlex, StyledText } from "../../styles";
import { Button, SelectMenu } from "../base";
import { HiArrowLeft } from "@react-icons/all-files/hi/HiArrowLeft";
import { useWidgetContext } from "../../context/context";
import { SelectMeuItem } from "../../types";
import { OrderStatus } from "@orbs-network/twap-sdk";

export function OrderHistoryMenu() {
  const { setTab, selectedTab, tabs } = useOrderHistoryContext();

  const onSelect = useCallback(
    (item: SelectMeuItem) => {
      setTab(item?.value as OrderStatus);
    },
    [setTab, setTab],
  );

  const items = useMemo(() => {
    return tabs.map((it) => {
      return {
        text: it.name,
        value: it.key,
      };
    });
  }, [tabs]);

  return <SelectMenu onSelect={onSelect} selected={selectedTab?.key} items={items} />;
}

export const OrderHistoryHeader = ({ className = "" }: { className?: string }) => {
  const { closePreview, isLoading } = useOrderHistoryContext();
  const order = useSelectedOrder();
  const t = useWidgetContext().translations;

  return (
    <StyledHeader className={`twap-order-modal-header ${className}`}>
      {isLoading ? null : !order ? (
        <OrderHistoryMenu />
      ) : (
        <StyledOrderDetails>
          <StyledBack onClick={closePreview} className="twap-order-modal-header-back">
            <HiArrowLeft />
          </StyledBack>
          <StyledTitle className="twap-order-modal-header-title">
            #{order?.id} {order?.isMarketOrder ? t.twapMarketOrder : t.limitOrder}
          </StyledTitle>
        </StyledOrderDetails>
      )}
    </StyledHeader>
  );
};

const StyledOrderDetails = styled(StyledRowFlex)({
  justifyContent: "flex-start",
  gap: 5,
});

const StyledTitle = styled(StyledText)({
  fontSize: 14,
  span: {
    opacity: 0.7,
    fontSize: 13,
  },
});

const StyledHeader = styled(StyledRowFlex)({
  justifyContent: "flex-start",
  height: 40,
});
const StyledBack = styled("button")({
  background: "none",
  border: "none",
  cursor: "pointer",
  svg: {
    width: 18,
    height: 18,
  },
});
