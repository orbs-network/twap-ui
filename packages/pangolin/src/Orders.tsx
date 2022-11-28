import { Orders, TwapProps } from "@orbs-network/twap-ui";
import { StyledOrdersContainer } from "./styles";
import { ProviderWrapper } from ".";
import { memo } from "react";

function OrderHistory(props: TwapProps) {
  return (
    <ProviderWrapper {...props}>
      <StyledOrdersContainer>
        <Orders />
      </StyledOrdersContainer>
    </ProviderWrapper>
  );
}

export default memo(OrderHistory);
