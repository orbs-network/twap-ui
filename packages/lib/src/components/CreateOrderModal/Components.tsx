import { Box, styled } from "@mui/material";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Button, TokenLogo } from "../base";
import { useTokenDisplay } from "./hooks";
import { FaArrowRight } from "@react-icons/all-files/fa/FaArrowRight";
import { ReactNode } from "react";
import { useSubmitOrderButton } from "../../hooks";
import { useCreateOrderModalContext } from "./context";

export const TokenDisplay = ({ isSrc }: { isSrc?: boolean }) => {
  const { amount, token, usd, title } = useTokenDisplay(isSrc);

  return (
    <StyledTokenDisplay  className="twap-order-modal-token">
      <StyledText className="twap-order-modal-token-title">{title}</StyledText>
      <StyledMiddle>
        <StyledText className="twap-order-modal-token-amount">
          {amount} {token?.symbol}
        </StyledText>
        <TokenLogo className="twap-order-modal-token-logo" logo={token?.logoUrl} />
      </StyledMiddle>
      <USD usd={usd} />
    </StyledTokenDisplay>
  );
};

const USD = ({ usd }: { usd?: string }) => {
  const { Components } = useCreateOrderModalContext();

  if (Components?.USD) {
    return <Components.USD usd={usd} />;
  }
  return <StyledText className="twap-order-modal-token-usd">${usd}</StyledText>;
};

export const TokensPreview = () => {
  return (
    <StyledTokens>
      <TokenDisplay isSrc={true} />
      <TokenDisplay />
    </StyledTokens>
  );
};

export const SubmitButton = ({ onClick }: { onClick: () => void }) => {
  const button = useSubmitOrderButton(onClick);

  return (
    <Button onClick={button.onClick} loading={button.loading} disabled={button.disabled}>
      {button.text}
    </Button>
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

const StyledMiddle = styled(StyledRowFlex)({
  width: "100%",
  justifyContent: "space-between",
});
const StyledTokenDisplay = styled(StyledColumnFlex)({
  alignItems: "flex-start",
  gap: 4,
  ".twap-order-modal-token-title": {
    opacity: 0.7,
    fontSize: 14,
  },
  ".twap-order-modal-token-amount": {
    fontSize: 29,
    lineHeight: "30px",
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  ".twap-token-logo": {
    width: 36,
    height: 36,
  },
  ".twap-order-modal-token-usd": {
    opacity: 0.7,
    fontSize: 14,
  },
});
