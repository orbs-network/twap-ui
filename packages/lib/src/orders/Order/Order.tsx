import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import OrderPreview from "./OrderPreview";
import OrderExpanded from "./OrderExpanded";
import { OrderUI, ParsedOrder } from "../../types";
import { AccordionSummary, Box, styled } from "@mui/material";
import { StyledSeperator } from "./styles";
import { CSSProperties } from "react";
import { Card, Loader } from "../../components/base";
import { useParseOrderUi } from "../../hooks";
import ContentLoader from "../../components/base/ContentLoader";

const StyledLoader = styled(Loader)({
  width: "100%",
  height: "100%",
  position: "absolute",
  left: 0,
  top: 0,
  zIndex: 1,
});

export interface Props {
  order: ParsedOrder;
  onExpand: () => void;
  expanded: boolean;
}

function OrderComponent({ order, onExpand, expanded }: Props) {
  const orderUI = useParseOrderUi(order);

  return (
    <StyledContainer onClick={onExpand} className={`twap-order ${expanded ? "twap-order-expanded-wrapper" : ""}`}>
      <StyledAccordion expanded={expanded}>
        <StyledAccordionSummary>
          <OrderPreview order={orderUI} expanded={expanded} />
        </StyledAccordionSummary>
        <StyledAccordionDetails className="twap-order-accordion" style={{ padding: 0, paddingTop: 10 }}>
          <OrderSeparator className="twap-order-separator" style={{ marginBottom: 10 }} />
          <Box>
            <OrderExpanded order={orderUI} />
          </Box>
        </StyledAccordionDetails>
      </StyledAccordion>
    </StyledContainer>
  );
}

const OrderSeparator = ({ className = "", style }: { className?: string; style?: CSSProperties }) => {
  return <StyledSeperator className={`twap-order-separator ${className}`} style={style} />;
};

const StyledAccordionDetails = styled(AccordionDetails)({
  marginTop: 10,
});

export default OrderComponent;

export const StyledAccordionSummary = styled(AccordionSummary)({
  flexDirection: "column",
  display: "flex",
  width: "100%",
  padding: 0,
});

const StyledContainer = styled(Card)({
  cursor: "pointer",
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
