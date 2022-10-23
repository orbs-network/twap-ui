import React from "react";
import TWAPLib from "@orbs-network/twap-ui";
import { StyledCard, StyledColumnGap } from "./styles";

const { LimitOrder } = TWAPLib.baseComponents;
const { OrderHistoryProvider, OrderHistoryContext } = TWAPLib;

function OrderHistory({ tokensList }: { tokensList: any[] }) {
  return (
    <OrderHistoryProvider tokensList={tokensList}>
      <StyledColumnGap gap={6}>
        <StyledCard>
          <LimitOrder />
        </StyledCard>
        <StyledCard>
          <LimitOrder />
        </StyledCard>
      </StyledColumnGap>
    </OrderHistoryProvider>
  );
}

export default OrderHistory;
