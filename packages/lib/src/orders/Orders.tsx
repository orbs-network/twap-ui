import { Box, styled } from "@mui/material";
import { Styles } from "..";
import { OdnpButton } from "../components";
import { OrdersLabel } from "../components/Labels";
import { OrdersSelectTabs, SelectedOrders } from "../components/OrdersComponents";

interface Props {
  disableAnimation?: boolean;
  className?: string;
  getLabel?: (label: string, amount: number) => string;
}

function Orders({ className = "", getLabel }: Props) {
  return (
    <StyledContainer className={`twap-orders twap-orders-wrapper ${className}`}>
      <StyledHeader className="twap-orders-header">
        <StyledHeaderTop>
          <Styles.StyledRowFlex justifyContent="flex-start" gap={5} style={{ width: "auto" }}>
            <OrdersLabel />
          </Styles.StyledRowFlex>
          <StyledOdnpButton />
        </StyledHeaderTop>
        <OrdersSelectTabs getLabel={getLabel} />
      </StyledHeader>
      <SelectedOrders />
    </StyledContainer>
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

export default Orders;
