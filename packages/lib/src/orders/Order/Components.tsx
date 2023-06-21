import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { TokenData } from "@orbs-network/twap";
import { CSSProperties, ReactNode } from "react";
import { Components, Styles as TwapStyles } from "../..";
import { Loader } from "../../components/base";
import { StyledRowFlex } from "../../styles";

interface OrderTokenDisplayProps {
  token?: TokenData;
  amount?: string;
  prefix?: string;
  className?: string;
  alighLeft?: boolean;
  usdPrefix?: string;
  usdValue: string;
  icon?: ReactNode;
  isLoading?: boolean;
}
export const OrderTokenDisplay = ({ token, amount, prefix = "", className = "", usdValue, alighLeft, usdPrefix, icon, isLoading }: OrderTokenDisplayProps) => {
  return (
    <StyledTokenDisplay className={`twap-order-token-display ${className}`}>
      <TwapStyles.StyledRowFlex style={{ alignItems: "flex-start" }}>
        <StyledTokenLogo logo={token?.logoUrl} />
        <TwapStyles.StyledColumnFlex gap={3} style={{ flex: 1, justifyContent: "flex-start" }}>
          <StyledRowFlex className="twap-token-display-amount-and-symbol">
            {isLoading && <Loader width={50} />}
            {amount ? (
              <Typography>
                {prefix ? `${prefix} ` : ""}
                <Components.Base.NumberDisplay value={amount} />
                {` ${token?.symbol}`}
              </Typography>
            ) : (
              <Typography>{` ${token?.symbol}`}</Typography>
            )}
          </StyledRowFlex>
          {!alighLeft && <OrderUsdValue isLoading={isLoading} usdValue={usdValue} prefix={usdPrefix} />}
        </TwapStyles.StyledColumnFlex>
        {icon && <StyledIcon>{icon}</StyledIcon>}
      </TwapStyles.StyledRowFlex>
      {alighLeft && <OrderUsdValue isLoading={isLoading} usdValue={usdValue} prefix={usdPrefix} />}
    </StyledTokenDisplay>
  );
};

const StyledIcon = styled("div")({
  marginTop: 2,
  svg: {
    width: 20,
    height: 20,
  },
});

interface OrderUsdValueProps {
  prefix?: string;
  usdValue: string;
  isLoading?: boolean;
}

export function OrderUsdValue({ usdValue, prefix = "≈", isLoading }: OrderUsdValueProps) {
  if (isLoading) return <Loader width={100} height={20} />;
  if (!usdValue) return null;

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
  fontSize: 16,
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
