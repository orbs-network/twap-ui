import { Orders, TWAPProps } from "@orbs-network/twap-ui";
import { StyledOrdersContainer } from "./styles";
import { memo } from "react";
import { SpiritSwapAdapter } from ".";

function OrderHistory(props: TWAPProps) {
  return (
    <SpiritSwapAdapter twapProps={props}>
      <StyledOrdersContainer>
        <Orders />
      </StyledOrdersContainer>
    </SpiritSwapAdapter>
  );
}

export default memo(OrderHistory);
