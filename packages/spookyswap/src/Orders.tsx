import { Orders, TWAPProps } from "@orbs-network/twap-ui";
import { StyledOrdersContainer } from "./styles";
import { memo } from "react";
import { SpookySwapAdapter } from ".";

function OrderHistory(props: TWAPProps) {
  return (
    <SpookySwapAdapter twapProps={props}>
      <StyledOrdersContainer>
        <Orders />
      </StyledOrdersContainer>
    </SpookySwapAdapter>
  );
}

export default memo(OrderHistory);
