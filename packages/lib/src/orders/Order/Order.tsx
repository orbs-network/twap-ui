import { Box, styled } from "@mui/system";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import OrderPreview from "./OrderPreview";
import OrderExpanded from "./OrderExpanded";
import { OrderSeparator } from "./Components";
import { OrderUI } from "../../types";
import { AccordionSummary } from "@mui/material";
import { StyledSpace } from "./styles";
import { Components } from "../..";

export interface Props {
  order: OrderUI;
  onExpand: () => void;
  expanded: boolean;
}

function OrderComponent({ order, onExpand, expanded }: Props) {

  return (
    <StyledContainer className={`twap-order ${expanded ? "twap-order-expanded-wrapper" : ""}`}>
      <StyledAccordion expanded={expanded}>
        <StyledAccordionSummary onClick={onExpand}>
          <OrderPreview order={order} expanded={expanded} />
        </StyledAccordionSummary>
        <StyledSpace className="twap-order-separator" />
        <AccordionDetails className="twap-order-accordion" style={{ padding: 0, paddingTop: 10 }}>
          <OrderSeparator className="twap-order-separator" style={{ marginBottom: 10 }} />
          <Box>
            <OrderExpanded order={order} />
          </Box>
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

const StyledContainer = styled(Components.Base.Card)({
  "& *": {
    color: "inherit!important",
  },
});

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
    color: "inherit",
  },
});
