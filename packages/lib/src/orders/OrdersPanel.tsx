import { Box, styled } from "@mui/material";
import { ReactNode } from "react";
import { ORDERS_CONTAINER_ID } from "..";
import { Odnp, Portal } from "../components/base";
import { OrdersLabel } from "../components/Labels";
import { OrdersSelectTabs, SelectedOrders } from "../components/OrdersComponents";
import { StyledRowFlex } from "../styles";

function Orders({ className = "" }: { className?: string }) {
  return (
    <StyledContainer className={`twap-orders twap-orders-wrapper ${className}`}>
      <StyledHeader className="twap-orders-header">
        <StyledHeaderTop>
          <StyledRowFlex justifyContent="flex-start" gap={5} style={{ width: "auto" }}>
            <OrdersLabel />
          </StyledRowFlex>
          <Odnp />
        </StyledHeaderTop>
        <OrdersSelectTabs />
      </StyledHeader>
      <SelectedOrders />
    </StyledContainer>
  );
}

export function OrdersPanel({ className, noPortal, children }: { className?: string; noPortal?: boolean; children?: ReactNode }) {
  if (noPortal) {
    return <>{children}</> || <Orders className={className} />;
  }

  return <Portal id={ORDERS_CONTAINER_ID}>{children ? <>{children}</> : <Orders className={className} />}</Portal>;
}

const StyledHeader = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 13,
});

const StyledContainer = styled("div")({
  width: "100%",
  margin: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 15,

  "& *": {
    fontFamily: "inherit",
    color: "inherit",
  },
});
const StyledHeaderTop = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  "& .twap-label": {
    fontSize: 18,
  },
});
