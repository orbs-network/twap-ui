import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import OrderPreview from "./OrderPreview";
import OrderExpanded from "./OrderExpanded";
import { AccordionSummary, Box, styled } from "@mui/material";
import { Card, Loader } from "../../components/base";
import { StyledColumnFlex, StyledRowFlex } from "../../styles";
import { Order } from "../../order";
import { ListOrderProvider, useListOrderContext } from "./context";

export interface Props {
  order: Order;
  expanded: boolean;
  onExpand: (value: number) => void;
}

export function ListOrder({ order, expanded, onExpand }: Props) {
  return (
    <ListOrderProvider order={order} expanded={expanded} onExpand={onExpand}>
      <ListOrderContent />
    </ListOrderProvider>
  );
}

const ListOrderContent = () => {
  const { expanded, onExpand } = useListOrderContext();
  return (
    <StyledContainer className={`twap-order ${expanded ? "twap-order-expanded-wrapper" : ""}`}>
      <StyledAccordion expanded={expanded}>
        <StyledAccordionSummary onClick={onExpand}>
          <OrderPreview />
        </StyledAccordionSummary>
        <StyledAccordionDetails className="twap-order-accordion">
          <OrderExpanded />
        </StyledAccordionDetails>
      </StyledAccordion>
    </StyledContainer>
  );
};

export const OrderLoader = ({ className = "" }: { className?: string }) => {
  return (
    <StyledOrdersLoader className={`${className} twap-order`}>
      <StyledColumnFlex style={{ width: "auto", gap: 5 }}>
        <StyledRowFlex style={{ width: "auto" }}>
          <StyledLoaderLogo />
          <StyledLoaderSymbol />
        </StyledRowFlex>
        <StyledRowFlex style={{ width: "auto" }}>
          <StyledLoaderLogo />
          <StyledLoaderSymbol />
        </StyledRowFlex>
      </StyledColumnFlex>
      <StyledLoaderRight />
    </StyledOrdersLoader>
  );
};

const StyledOrdersLoader = styled(StyledRowFlex)((theme) => {
  return {
    width: "100%",

    justifyContent: "space-between",
    marginTop: 5,
  };
});

const StyledLoaderLogo = styled(Loader)({
  width: 24,
  height: 24,
  transform: "unset",
  borderRadius: "50%",
});

const StyledLoaderRight = styled(Loader)({
  width: 70,
  height: 30,
});

const StyledLoaderSymbol = styled(Loader)({
  width: 70,
  height: 20,
});

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

const StyledContainer = styled(Card)({
  ".MuiCollapse-root": {},
});

const StyledAccordion = styled(Accordion)({
  width: "100%",
  fontFamily: "inherit",
  padding: 0,
  margin: 0,
  background: "transparent",
  boxShadow: "unset",
  ".MuiCollapse-root": {
    transition: "unset!important",
  },
  "& .MuiAccordionSummary-content": {
    margin: "0!important",
    width: "100%",
    transition: "unset",
  },
  ".Mui-expanded": {
    minHeight: "unset",
  },
});
