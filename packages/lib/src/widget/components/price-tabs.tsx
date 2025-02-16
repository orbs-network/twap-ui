import React from "react";
import styled from "styled-components";
import { useWidgetContext } from "../..";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/useShouldWrapOrUnwrap";
import { StyledRowFlex } from "../../styles";
import { usePriceMode } from "../hooks";

export const PriceTabs = ({ className = "" }: { className?: string }) => {
  const { translations } = useWidgetContext();
  const { isMarketOrder, setIsMarketOrder } = usePriceMode();

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
