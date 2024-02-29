import { Box, styled } from "@mui/material";
import { ReactNode } from "react";
import { ORDERS_CONTAINER_ID } from "..";
import { Odnp, Portal } from "../components/base";
import { OrdersLabel } from "../components/Labels";
import { OrdersSelectTabs, SelectedOrders } from "../components/OrdersComponents";
import { StyledColumnFlex, StyledRowFlex } from "../styles";

export function OrdersContainer({ className = "", children }: { className?: string; children?: ReactNode }) {
  return <StyledContainer className={`twap-orders twap-orders-wrapper ${className}`}>{children}</StyledContainer>;
}

export const OrdersHeader = () => {
  return (
    <StyledHeaderTop className="twap-orders-header">
      <StyledRowFlex justifyContent="flex-start" gap={5} style={{ width: "auto" }}>
        <OrdersLabel />
      </StyledRowFlex>
      <Odnp />
    </StyledHeaderTop>
  );
};

function Orders({ className = "" }: { className?: string }) {
  return (
    <OrdersContainer className={className}>
      <StyledColumnFlex gap={20}>
        <OrdersHeader />
        <OrdersSelectTabs />
      </StyledColumnFlex>
      <SelectedOrders />
    </OrdersContainer>
  );
}

export const OrdersPortal = ({ children, className }: { children?: ReactNode; className?: string }) => {
  return <Portal id={ORDERS_CONTAINER_ID}>{children ? <>{children}</> : <Orders className={className} />}</Portal>;
};

export function OrdersPanel({ className, noPortal, children }: { className?: string; noPortal?: boolean; children?: ReactNode }) {
  if (noPortal) {
    return <>{children}</> || <Orders className={className} />;
  }

  return <OrdersPortal className={className}>{children}</OrdersPortal>;
}

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
