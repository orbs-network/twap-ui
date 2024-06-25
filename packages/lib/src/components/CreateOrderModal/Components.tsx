import { Box, styled } from "@mui/material";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { TokenLogo } from "../base";
import { useTokenDisplay } from "./hooks";
import { TokenDisplay } from "./TokenDisplay";
import { FaArrowRight } from "@react-icons/all-files/fa/FaArrowRight";
import { ReactNode } from "react";
export const TokensPreview = () => {
  return (
    <StyledTokens>
      <TokenDisplay isSrc={true} />
      <TokenDisplay />
    </StyledTokens>
  );
};

const StyledTokens = styled(StyledColumnFlex)({
  gap: 24,
});

export const Separator = ({ className = "" }: { className?: string }) => {
  return <StyledSeparator className={`${className} twap-order-modal-separator`} />;
};

const StyledSeparator = styled("div")({
  width: "100%",
  height: "1px",
  background: "rgba(255, 255, 255, 0.07)",
});

export const TokenDispalySmall = ({ isSrc }: { isSrc?: boolean }) => {
  const { amount, token } = useTokenDisplay(isSrc);

  return (
    <StyledTokenDispalySmall className="twap-order-modal-token-small">
      <TokenLogo logo={token?.logoUrl} />
      <StyledText className="twap-order-modal-token-small-text">{`${amount} ${token?.symbol}`}</StyledText>
    </StyledTokenDispalySmall>
  );
};

const StyledTokenDispalySmall = styled(StyledRowFlex)({
  width: "auto",
  gap: 8,
  ".twap-token-logo": {
    width: 18,
    height: 18,
  },
  ".twap-order-modal-token-small-text": {
    fontSize: 14,
  },
});

export const SmallTokens = () => {
  return (
    <StyledSmallTokens>
      <TokenDispalySmall isSrc={true} />
      <StyledSmallTokensArrow>
        <FaArrowRight />
      </StyledSmallTokensArrow>
      <TokenDispalySmall />
    </StyledSmallTokens>
  );
};

const StyledSmallTokensArrow = styled(Box)({
  display: "flex",
  alignItems: "center",
  svg: {
    width: 12,
    height: 12,
  },
});

const StyledSmallTokens = styled(StyledRowFlex)({
  justifyContent: "center",
  alignItems: "center",
});

export const Link = ({ href, children }: { href: string; children: ReactNode }) => {
  return (
    <StyledLink href={href} target="_blank" className="twap-order-modal-link">
      {children}
    </StyledLink>
  );
};

const StyledLink = styled("a")({
  color: "rgb(252, 114, 255)",
  textDecoration: "none",
  fontSize: 14,
});
