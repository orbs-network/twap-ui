import { Box, styled } from "@mui/material";
import { ORDERS_CONTAINER_ID, Styles } from "..";
import { OdnpButton } from "../components";
import { Portal } from "../components/base";
import { OrdersLabel } from "../components/Labels";
import { OrdersSelectTabs, SelectedOrders } from "../components/OrdersComponents";

interface Props {
  className?: string;
  getLabel?: (label: string, amount: number) => string;
  noPortal?: boolean;
}

function Orders(props: Props) {
  return (
    <StyledContainer className={`twap-orders twap-orders-wrapper ${props.className}`}>
      <StyledHeader className="twap-orders-header">
        <StyledHeaderTop>
          <Styles.StyledRowFlex justifyContent="flex-start" gap={5} style={{ width: "auto" }}>
            <OrdersLabel />
          </Styles.StyledRowFlex>
          <StyledOdnpButton />
        </StyledHeaderTop>
        <OrdersSelectTabs getLabel={props.getLabel} />
      </StyledHeader>
      <SelectedOrders />
    </StyledContainer>
  );
}

export function OrdersPanel(props: Props) {
  if (props.noPortal) {
    return <Orders {...props} />;
  }

  return (
    <Portal id={ORDERS_CONTAINER_ID}>
      <Orders {...props} />
    </Portal>
  );
}

const StyledHeader = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 13,
});

const StyledOdnpButton = styled(OdnpButton)({
  marginRight: 5,
});

const StyledContainer = styled(Box)({
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
