import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import OrderPreview from "./OrderPreview";
import OrderExpanded from "./OrderExpanded";
import { ParsedOrder } from "../../types";
import { AccordionSummary, Box, styled } from "@mui/material";
import { StyledSeperator } from "./styles";
import { CSSProperties } from "react";
import { Card, Loader } from "../../components/base";
import { useParseOrderUi } from "../../hooks";
import { StyledColumnFlex } from "../../styles";

export interface Props {
  order: ParsedOrder;
  onExpand: () => void;
  expanded: boolean;
}

function OrderComponent({ order, onExpand, expanded }: Props) {
  const orderUI = useParseOrderUi(order, expanded);

  return (
    <StyledContainer className={`twap-order ${expanded ? "twap-order-expanded-wrapper" : ""}`}>
      <StyledAccordion expanded={expanded}>
        <StyledAccordionSummary>
          <OrderPreview order={orderUI} expanded={expanded} onExpand={onExpand}  />
        </StyledAccordionSummary>
        <StyledAccordionDetails className="twap-order-accordion">
          <OrderSeparator className="twap-order-separator" style={{ marginBottom: 10 }} />
          <Box>
            <OrderExpanded order={orderUI} />
          </Box>
        </StyledAccordionDetails>
      </StyledAccordion>
    </StyledContainer>
  );
}

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
  cursor:"auto"
});

const StyledContainer = styled(Card)({

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
  ".Mui-expanded": {
    minHeight: 'unset',
  },
  "& *": {
    color: "inherit",
  },
});
