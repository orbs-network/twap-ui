import { styled } from "@mui/material";
import { ReactNode } from "react";
import { StyledColumnFlex } from "../../styles";
import { OrderSummaryContext, OrderSummaryContextArgs, useOrderSummaryContext } from "./context";
import { Details } from "./Details";
import { TokenDisplay } from "./TokenDisplayBig";

interface Props extends OrderSummaryContextArgs {
  className?: string;
  children?: ReactNode;
}
export function OrderSummary({ children, className = "", ...rest }: Props) {
  return (
    <OrderSummaryContext.Provider value={rest}>
      <Container className={`${className} twap-order-summary`}>{children}</Container>
    </OrderSummaryContext.Provider>
  );
}

const SrcToken = () => {
  const { srcAmount, srcToken, srcUsd } = useOrderSummaryContext();
  return <TokenDisplay amount={srcAmount} token={srcToken} usd={srcUsd} title="From" />;
};

const DstToken = () => {
  const { dstUsd, dstToken, outAmount } = useOrderSummaryContext();
  return <TokenDisplay amount={outAmount} token={dstToken} usd={dstUsd} title="To" />;
};

const StyledTokens = styled(StyledColumnFlex)({
  gap: 24,
});

const Tokens = () => {
  return (
    <StyledTokens className="twap-order-summary-tokens">
      <SrcToken />
      <DstToken />
    </StyledTokens>
  );
};

const Container = styled(StyledColumnFlex)({
  gap: 0,
  ".twap-separator": {
    margin: "20px 0px",
  },
  ".twap-order-summary-details": {
    gap: 8,
  },
});

OrderSummary.Details = Details;
OrderSummary.Tokens = Tokens;
