import { styled } from "@mui/system";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import OrderPreview from "./OrderPreview";
import OrderExpanded from "./OrderExpanded";
import { OrderSeparator } from "./Components";
import { OrderUI } from "../../types";
import { Card } from "../../components";
import { AccordionSummary } from "@mui/material";
import { StyledSpace } from "./styles";

export interface Props {
  order: OrderUI;
  onExpand: () => void;
  expanded: boolean;
}

function OrderComponent({ order, onExpand, expanded }: Props) {
  return (
    <StyledContainer className="twap-order">
      <StyledAccordion expanded={expanded}>
        <StyledAccordionSummary onClick={onExpand}>
          <OrderPreview order={order} expanded={expanded} />
        </StyledAccordionSummary>
        <StyledSpace />
        <AccordionDetails style={{ padding: 0, paddingTop: 10 }}>
          <OrderSeparator style={{ marginBottom: 10 }} />
          <OrderExpanded order={order} />
        </AccordionDetails>
      </StyledAccordion>
    </StyledContainer>
  );
}

export default OrderComponent;

export const StyledAccordionSummary = styled(AccordionSummary)({
  flexDirection: "column",
  display: "flex",
  width: "100%",
  padding: 0,
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
  "& *": {
    color: "white",
  },
});
