import { styled } from "@mui/material";
import { useTwapContext } from "../../context";
import { useFormatNumberV2 } from "../../hooks";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Token } from "../../types";
import { TokenLogo } from "../base";

export const TokenDisplay = ({ amount, token, usd, title }: { amount?: string; token?: Token; usd?: string; title?: string }) => {
  const _usd = useFormatNumberV2({ value: usd, decimalScale: 2 });
  const _amount = useFormatNumberV2({ value: amount });

  return (
    <StyledTokenDisplay className="twap-order-summary-token-usd">
      <StyledRight className="twap-order-summary-token-right">
        <StyledText className="twap-order-summary-token-title">{title}</StyledText>
        <StyledText className="twap-order-summary-token-amount">
          {amount ? _amount : ""} {token?.symbol}
        </StyledText>
        {usd && <USD usd={_usd} />}
      </StyledRight>
      <TokenLogo className="twap-order-summary-token-usd-logo" logo={token?.logoUrl} />
    </StyledTokenDisplay>
  );
};

const USD = ({ usd, className = "" }: { usd?: string; className?: string }) => {
  const { Components } = useTwapContext().uiPreferences;

  if (Components?.USD) {
    return <Components.USD usd={usd} />;
  }
  return <StyledText className={`twap-order-summary-token-usd ${className}`}>${usd}</StyledText>;
};

const StyledRight = styled(StyledColumnFlex)({
  width: "auto",
  flex: 1,
  justifyContent: "space-between",
  gap: 4,
});
const StyledTokenDisplay = styled(StyledRowFlex)({
  alignItems: "center",
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
