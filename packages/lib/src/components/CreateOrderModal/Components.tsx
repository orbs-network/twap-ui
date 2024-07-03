import { Box, styled } from "@mui/material";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Button, TokenLogo } from "../base";
import { useTokenDisplay } from "./hooks";
import { FaArrowRight } from "@react-icons/all-files/fa/FaArrowRight";
import { ReactNode } from "react";
import { useSubmitOrderButton } from "../../hooks";

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
  fontWeight: 500,
});

export const BottomContent = ({ href, text }: { href?: string; text?: string }) => {
  let content;
  if (href) {
    content = (
      <StyledLink href={href} target="_blank" className="twap-order-modal-link">
        {text}
      </StyledLink>
    );
  } else {
    content = <StyledBottomContentText>{text}</StyledBottomContentText>;
  }

  return <StyledBottomContent className="twap-order-modal-bottom-content">{content}</StyledBottomContent>;
};

const StyledBottomContent = styled(StyledColumnFlex)({
  marginTop: 40,
  alignItems: "center",
});

const StyledBottomContentText = styled(StyledText)({
  textAlign: "center",
  color: "rgb(155, 155, 155)",
  fontSize: 14,
  fontWeight: 500,
});
