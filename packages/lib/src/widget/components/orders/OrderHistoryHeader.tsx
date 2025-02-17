import styled from "styled-components";
import React, { useCallback, useMemo } from "react";
import { useOrderHistoryContext, useSelectedOrder } from "./context";

import { HiArrowLeft } from "@react-icons/all-files/hi/HiArrowLeft";

import { OrderStatus } from "@orbs-network/twap-sdk";
import { SelectMeuItem } from "../../../types";
import { SelectMenu } from "../../../components/base";
import { StyledRowFlex, StyledText } from "../../../styles";
import { useGetOrderNameCallback } from "../../../hooks/useOrderName";

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

export const OrderHistoryHeader = ({ className = "" }: { className?: string }) => {
  const { closePreview } = useOrderHistoryContext();
  const order = useSelectedOrder();
  const getName = useGetOrderNameCallback();
  const name = useMemo(() => getName(order?.isMarketOrder, order?.totalChunks), [order, getName]);
  return (
    <StyledHeader className={`twap-order-history-header ${className}`}>
      {!order ? (
        <OrderHistoryMenu />
      ) : (
        <StyledOrderDetails>
          <StyledBack onClick={closePreview} className="twap-order-history-header-back-icon">
            <HiArrowLeft />
          </StyledBack>
          <StyledTitle className="twap-order-history-header-title">
            #{order?.id} {name}
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
