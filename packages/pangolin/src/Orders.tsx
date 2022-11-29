import { Orders, TWAPProps } from "@orbs-network/twap-ui";
import { StyledOrdersContainer } from "./styles";
import { memo } from "react";
import { PangolinAdapter } from ".";

function OrderHistory(props: TWAPProps) {
  return (
    <PangolinAdapter twapProps={props}>
      <StyledOrdersContainer>
        <Orders />
      </StyledOrdersContainer>
    </PangolinAdapter>
  );
}

export default memo(OrderHistory);
