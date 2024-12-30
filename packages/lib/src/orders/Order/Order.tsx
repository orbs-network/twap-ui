import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import OrderPreview from "./OrderPreview";
import OrderExpanded from "./OrderExpanded";
import { AccordionSummary, Box, styled } from "@mui/material";
import { Card, Loader } from "../../components/base";
import { StyledColumnFlex } from "../../styles";
import { Order } from "../../order";
import { ListOrderProvider, useListOrderContext } from "./context";

export interface Props {
  order: Order;
}

export function ListOrder({ order }: Props) {
  return (
    <ListOrderProvider order={order}>
      <ListOrderContent />
    </ListOrderProvider>
  );
}

const ListOrderContent = () => {
  const { expanded } = useListOrderContext();
  return (
    <StyledContainer className={`twap-order ${expanded ? "twap-order-expanded-wrapper" : ""}`}>
      <StyledAccordion expanded={expanded}>
        <StyledAccordionSummary>
          <OrderPreview />
        </StyledAccordionSummary>
        <StyledAccordionDetails className="twap-order-accordion">
          <OrderExpanded />
        </StyledAccordionDetails>
      </StyledAccordion>
    </StyledContainer>
  );
};

export const OrderLoader = ({ status }: { status?: string }) => {
  if (status !== "Open") return null;
  return (
    <StyledOrderLoader className="twap-pending-order-loader twap-order">
      <StyledColumnFlex gap={10}>
        <Loader width="30%" height={20} />
        <Loader width="40%" height={20} />
        <Loader width="50%" height={20} />
      </StyledColumnFlex>
    </StyledOrderLoader>
  );
};

const StyledOrderLoader = styled(Card)({});

const StyledAccordionDetails = styled(AccordionDetails)({
  marginTop: 10,
});

export const StyledAccordionSummary = styled(AccordionSummary)({
  flexDirection: "column",
  display: "flex",
  width: "100%",
  padding: 0,
  cursor: "auto",
  minHeight: "unset!important",
});

const StyledContainer = styled(Card)({});

const StyledAccordion = styled(Accordion)({
  width: "100%",
  fontFamily: "inherit",
  padding: 0,
  margin: 0,
  background: "transparent",
  boxShadow: "unset",
  "& .MuiAccordionSummary-content": {
    margin: "0!important",
    width: "100%",
  },
  ".Mui-expanded": {
    minHeight: "unset",
  },
  "& *": {
    color: "inherit",
  },
});
