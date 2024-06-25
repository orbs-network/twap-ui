import { styled } from "@mui/material";
import React, { useMemo } from "react";
import { useTwapContext } from "../../context";
import { useIsMarketOrder } from "../../hooks";
import { StyledColumnFlex, StyledText } from "../../styles";
import { Spinner } from "../base";
import { SmallTokens } from "./Components";

export function ConfirmOrder() {
  return (
    <StyledContainer>
            <Spinner size={55} />
      <Title />
      <SmallTokens />
   
      <StyledText className="twap-order-modal-confirm-bottom">Proceed in your wallet</StyledText>
    </StyledContainer>
  );
}


const Title = () => {
  const { isLimitOrder } = useTwapContext();
  const isMarketOrder = useIsMarketOrder();
  const title = useMemo(() => {
    if (isLimitOrder) {
      return "limit";
    }
    if (isMarketOrder) {
      return "market";
    }
    return "twap";
  }, [isLimitOrder, isMarketOrder]);
  return <StyledText className="twap-order-modal-confirm-title">Confirm {title}</StyledText>;
};

const StyledContainer = styled(StyledColumnFlex)({
    gap: 15,
  alignItems: "center",
  ".twap-order-modal-confirm-title": {
    fontSize: 16,
  },
  ".twap-order-modal-confirm-bottom": {
    marginTop: 30,
    color: "rgb(155, 155, 155)",
    fontSize: 14,
  },
});
