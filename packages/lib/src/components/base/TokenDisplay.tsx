import { styled } from "styled-components";
import { StyledRowFlex, StyledText } from "../../styles";
import TokenLogo from "./TokenLogo";
import TokenName from "./TokenName";
import React from "react";

export interface Props {
  symbol?: string;
  logo?: string;
  className?: string;
  reverse?: boolean;
  singleToken?: boolean;
  hideSymbol?: boolean;
  onClick?: () => void;
}

function TokenDisplay({ symbol, logo, className = "", reverse, singleToken, hideSymbol, onClick }: Props) {
  return (
    <StyledContainer className={`twap-token-display ${className}`} onClick={onClick}>
      {reverse ? (
        <>
          {singleToken && <StyledText>1</StyledText>}
          {!hideSymbol && <TokenName name={symbol} />}
          <TokenLogo logo={logo} />
        </>
      ) : (
        <>
          <TokenLogo logo={logo} />
          {singleToken && <StyledText>1</StyledText>}
          {!hideSymbol && <TokenName name={symbol} />}
        </>
      )}
    </StyledContainer>
  );
}

export default TokenDisplay;

const StyledContainer = styled(StyledRowFlex)({
  gap: 8,
  width: "fit-content",
});
