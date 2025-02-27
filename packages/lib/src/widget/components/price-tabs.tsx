import React from "react";
import styled from "styled-components";
import { StyledRowFlex } from "../../styles";
import { useTwapContext } from "../../context";
import { usePriceToggle } from "../../hooks/ui-hooks";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/logic-hooks";

export const PriceTabs = ({ className = "" }: { className?: string }) => {
  const { translations } = useTwapContext();
  const { isMarketOrder, setIsMarketOrder } = usePriceToggle();

  const hide = useShouldWrapOrUnwrapOnly();

  if (hide) return null;

  return (
    <Container className={`twap-price-tabs ${className}`}>
      <button className={`twap-price-tabs-tab ${isMarketOrder ? "twap-price-tabs-tab-selected" : ""}`} onClick={() => setIsMarketOrder(true)}>
        {translations.market}
      </button>
      <button className={`twap-price-tabs-tab ${!isMarketOrder ? "twap-price-tabs-tab-selected" : ""}`} onClick={() => setIsMarketOrder(false)}>
        {translations.limit}
      </button>
    </Container>
  );
};

const Container = styled(StyledRowFlex)({
  padding: 3,
  overflow: "hidden",
  width: "auto",
  borderRadius: 20,
});
