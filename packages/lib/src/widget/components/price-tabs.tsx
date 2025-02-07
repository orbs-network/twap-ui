import React, { FC } from "react";
import styled from "styled-components";
import { useWidgetContext } from "../..";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/useShouldWrapOrUnwrap";
import { StyledRowFlex } from "../../styles";

export const PriceTabs = ({ className = "" }: { className?: string }) => {
  const { twap, translations } = useWidgetContext();
  const {
    values: { isMarketOrder },
    actionHandlers: { setIsMarketPrice },
  } = twap;

  const hide = useShouldWrapOrUnwrapOnly();

  if (hide) return null;

  return (
    <Container className={`twap-price-tabs ${className}`}>
      <button className={`twap-price-tabs-tab ${!!isMarketOrder ? "twap-price-tabs-tab-selected" : ""}`} onClick={() => setIsMarketPrice(true)}>
        {translations.market}
      </button>
      <button className={`twap-price-tabs-tab ${!isMarketOrder ? "twap-price-tabs-tab-selected" : ""}`} onClick={() => setIsMarketPrice(false)}>
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
