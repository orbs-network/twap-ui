import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { TokenData } from "@orbs-network/twap";
import { CSSProperties } from "react";
import { Components, Styles as TwapStyles } from "../..";

interface OrderTokenDisplayProps {
  token?: TokenData;
  amount?: string;
  prefix?: string;
  className?: string;
  alighLeft?: boolean;
  usdPrefix?: string;
  usdValue: string;
}
export const OrderTokenDisplay = ({ token, amount, prefix = "", className = "", usdValue, alighLeft, usdPrefix }: OrderTokenDisplayProps) => {
  return (
    <StyledTokenDisplay className={`twap-order-token-display ${className}`}>
      <TwapStyles.StyledRowFlex style={{ alignItems: "flex-start" }}>
        <StyledTokenLogo logo={token?.logoUrl} />
        <TwapStyles.StyledColumnFlex gap={3} style={{ flex: 1, justifyContent: "flex-start" }}>
          <Typography className="twap-token-display-amount-and-symbol">
            {prefix ? `${prefix} ` : ""}
            <Components.Base.NumberDisplay value={amount} />
            {` ${token?.symbol}`}
          </Typography>
          {!alighLeft && <OrderUsdValue usdValue={usdValue} prefix={usdPrefix} />}
        </TwapStyles.StyledColumnFlex>
      </TwapStyles.StyledRowFlex>
      {alighLeft && <OrderUsdValue usdValue={usdValue} prefix={usdPrefix} />}
    </StyledTokenDisplay>
  );
};

interface OrderUsdValueProps {
  prefix?: string;
  usdValue: string;
}

export function OrderUsdValue({ usdValue, prefix = "≈" }: OrderUsdValueProps) {
  return (
    <StyledTokenDisplayUsd loading={false} className="twap-order-token-display-usd">
      {prefix} $ <Components.Base.NumberDisplay value={usdValue} />
    </StyledTokenDisplayUsd>
  );
}

const StyledTokenDisplayUsd = styled(Components.Base.SmallLabel)({
  fontSize: 14,
});

const StyledTokenDisplay = styled(TwapStyles.StyledColumnFlex)({
  gap: 3,
  alignItems: "flex-start",
  width: "fit-content",
  fontSize: 18,
  "& .twap-token-display-amount-and-symbol": {
    fontSize: "inherit",
  },
});

const StyledTokenLogo = styled(Components.Base.TokenLogo)({
  width: 28,
  height: 28,
  top: -2,
  position: "relative",
  "@media(max-width: 600px)": {
    width: 20,
    height: 20,
  },
});

export const OrderSeparator = ({ className = "", style }: { className?: string; style?: CSSProperties }) => {
  return <StyledSeperator className={`twap-order-separator ${className}`} style={style} />;
};

export const StyledSeperator = styled(Box)({
  width: "100%",
  height: 1,
  background: "#373E55",
});
