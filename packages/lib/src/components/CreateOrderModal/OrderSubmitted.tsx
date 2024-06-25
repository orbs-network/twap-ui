import { styled } from "@mui/material";
import React, { useMemo } from "react";
import { useTwapContext } from "../../context";
import { useIsMarketOrder } from "../../hooks";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Spinner } from "../base";
import { Link, SmallTokens } from "./Components";
import { HiArrowCircleUp } from "@react-icons/all-files/hi/HiArrowCircleUp";

export function OrderSubmitted() {
  return (
    <StyledContainer>
      <Logo>
        <HiArrowCircleUp />
      </Logo>
      <Title />
      <SmallTokens />
      <Link href="/" >Learn more</Link>
    </StyledContainer>
  );
}

const Logo = styled(StyledRowFlex)({
  svg: {
    width: 70,
    height: 70,
  },
});

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
  return <StyledText className="twap-order-modal-submitted-title">{title} submitted</StyledText>;
};

const StyledContainer = styled(StyledColumnFlex)({
  gap: 15,
  alignItems: "center",
  ".twap-order-modal-submitted-title": {
    fontSize: 16,
  },
  ".twap-order-modal-link": {
    marginTop: 30,

  },
});
