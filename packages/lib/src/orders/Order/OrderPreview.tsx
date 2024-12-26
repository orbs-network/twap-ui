import { LinearProgress, Typography, Box, styled } from "@mui/material";
import { Components, OrderUI } from "../..";
import { StyledColumnFlex, StyledRowFlex, StyledText, textOverflow } from "../../styles";
import { useFormatNumber } from "../../hooks";
import { Icon, Loader, SmallLabel, TokenLogo, Tooltip } from "../../components/base";
import { Status, TokenData } from "@orbs-network/twap";
import { ReactNode, useMemo, useState } from "react";
import { ArrowsIcon, CheckIcon, ChevronDown } from "./icons";
import BN from "bignumber.js";
import { OrderStatus } from "./Components";

const Tokens = ({ order }: { order: OrderUI }) => {
  return (
    <SyledTokens className="twap-order-preview-tokens">
      <TokensToken className="twap-order-preview-tokens-in-token" token={order?.ui.srcToken} amount={order?.ui.srcAmountUi} />
      <TokensToken className="twap-order-preview-tokens-out-token" token={order?.ui.dstToken} amount={order?.ui.dstMinAmountOut} />
    </SyledTokens>
  );
};

const SyledTokens = styled(StyledColumnFlex)({
  width: "auto",
  alignItems: "flex-start",
  gap: 5,
});

const TokensToken = ({ token, amount, className }: { token?: TokenData; amount?: string; className: string }) => {
  const amountF = useFormatNumber({ value: amount, decimalScale: 3 });
  return (
    <StyledToken className={className}>
      <Components.Base.TokenLogo logo={token?.logoUrl} />
      {amount && <StyledTokenAmount>{amountF}</StyledTokenAmount>}
      <StyledTokenSymbol>{token?.symbol}</StyledTokenSymbol>
    </StyledToken>
  );
};
const StyledTokenSymbol = styled(StyledText)({
  fontSize: 16,
  fontWeight: 600,
});
const StyledTokenAmount = styled(StyledText)({
  fontSize: 16,
  fontWeight: 600,
});
const StyledToken = styled(StyledRowFlex)({
  width: "auto",
  ".twap-token-logo ": {
    width: 24,
    height: 24,
  },
});

const Price = ({ order }: { order: OrderUI }) => {
  const priceSrcForDstToken = order?.ui.priceSrcForDstToken;
  const [inverted, setInverted] = useState(false);

  const value = useMemo(() => {
    if (!priceSrcForDstToken) return;
    return inverted ? BN(1).dividedBy(priceSrcForDstToken).toString() : priceSrcForDstToken;
  }, [priceSrcForDstToken, inverted]);

  const priceF = useFormatNumber({ value, decimalScale: 3 });

  const leftToken = inverted ? order?.ui.dstToken : order?.ui.srcToken;
  const rightToken = inverted ? order?.ui.srcToken : order?.ui.dstToken;

  console.log({ value });

  if (!value) return null;
  return (
    <StyledPrice>
      <StyledPriceText>1 {leftToken?.symbol}</StyledPriceText>
      <StyledPriceToggle onClick={() => setInverted(!inverted)}>
        <ArrowsIcon />
      </StyledPriceToggle>
      <StyledPriceText>
        {priceF} {rightToken?.symbol}
      </StyledPriceText>
    </StyledPrice>
  );
};
const StyledPriceToggle = styled("button")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  svg: {
    width: 18,
    height: 18,
  },
});

const StyledPrice = styled(StyledRowFlex)({
  width: "auto",
  gap: 0,
});
const StyledPriceText = styled(StyledText)({
  fontSize: 14,
});


export interface Props {
  order: OrderUI;
  onExpand: () => void;
  expanded: boolean;
}


function OrderPreview({ order, expanded, onExpand }: Props) {
  return (
    <StyledOrderPreview gap={0} className="twap-order-preview">
      <Tokens order={order} />
      <Price order={order} />
      <StyledRowFlex style={{width:'auto'}}>
      <OrderStatus order={order} />
      <ToggleExpanded expanded={expanded} onExpand={onExpand} />
      </StyledRowFlex>
    </StyledOrderPreview>
  );
}

const ToggleExpanded = ({ expanded, onExpand }: { expanded: boolean; onExpand: () => void }) => {

  return (
    <StyledExpandToggle expanded={expanded ? 1 : 0} onClick={onExpand}>
      <ChevronDown />
    </StyledExpandToggle>
  );
}

const StyledOrderPreview = styled(StyledRowFlex)({
  justifyContent: "space-between",
  cursor:'auto!important',
});





const StyledExpandToggle = styled("button")<{expanded: number}>(({expanded}) => ({
  background: "transparent",
  border: "none",
  cursor: "pointer",
 
  svg: {
    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
    width: 22,
    height: 22,
  },
}));


export default OrderPreview;

export const StyledPreviewLinearProgress = styled(LinearProgress)({
  marginLeft: "auto",
  marginRight: "auto",
  width: "100%",
  background: "transparent",
  height: 7,

  "&::after": {
    position: "absolute",
    top: "50%",
    left: 0,
    height: 1,
    content: '""',
    width: "100%",
    background: "#373E55",
  },
  "& .MuiLinearProgress-bar": {
    height: "100%",
    zIndex: 1,
    transition: "0.2s all",
  },
});

interface OrderTokenDisplayProps {
  token?: TokenData;
  amount?: string;
  prefix?: string;
  className?: string;
  alighLeft?: boolean;
  usdPrefix?: string;
  usdValue?: string;
  icon?: ReactNode;
  isLoading?: boolean;
  isMain?: boolean;
  usdLoading?: boolean;
}
export const OrderTokenDisplay = ({ token, amount, prefix = "", className = "", usdValue, alighLeft, usdPrefix, icon, isLoading, usdLoading }: OrderTokenDisplayProps) => {
  const tokenAmount = useFormatNumber({ value: amount, disableDynamicDecimals: true });

  return (
    <StyledTokenDisplay className={`twap-order-token-display ${className}`}>
      <StyledTokenDisplayFlex>
        <StyledTokenLogo logo={token?.logoUrl} />
        <StyledTokenDisplayAmount>
          {isLoading ? (
            <StyledLoader className="twap-small-label-loader">
              <Loader width="100%" height="100%" />
            </StyledLoader>
          ) : amount ? (
            <Typography className="twap-order-token-display-amount">
              {prefix ? `${prefix} ` : ""}
              {tokenAmount}
              {` ${token?.symbol}`}
            </Typography>
          ) : (
            <Typography>{` ${token?.symbol}`}</Typography>
          )}

          {!alighLeft && <OrderUsdValue isLoading={usdLoading} usdValue={usdValue} prefix={usdPrefix} />}
        </StyledTokenDisplayAmount>
        {icon && <StyledIcon>{icon}</StyledIcon>}
      </StyledTokenDisplayFlex>
      {alighLeft && <OrderUsdValue isLoading={usdLoading} usdValue={usdValue} prefix={usdPrefix} />}
    </StyledTokenDisplay>
  );
};

const StyledLoader = styled(Box)({
  width: 50,
  height: 20,
});

const StyledIcon = styled("div")({
  position: "relative",
  top: 2,
  svg: {
    width: 20,
    height: 20,
  },
});

interface OrderUsdValueProps {
  prefix?: string;
  usdValue?: string;
  isLoading?: boolean;
}

export function OrderUsdValue({ usdValue, prefix = "≈", isLoading }: OrderUsdValueProps) {
  const formattedValue = useFormatNumber({ value: usdValue, disableDynamicDecimals: true });

  if (isLoading) return <Loader width={30} height={20} />;
  if (!usdValue) return null;

  return (
    <StyledTokenDisplayUsd loading={false} className="twap-order-token-display-usd">
      {prefix} $ {formattedValue}
    </StyledTokenDisplayUsd>
  );
}

const StyledTokenDisplayUsd = styled(SmallLabel)({
  fontSize: 13,
});
const StyledTokenDisplayAmount = styled(StyledColumnFlex)({
  justifyContent: "flex-start",
  width: "auto",
  gap: 3,
  flex: 1,
  minWidth: 0,
  fontSize: "14px",
  ".twap-tooltip-children": {
    minWidth: 0,
    ...textOverflow,
    width: "100%",
  },
  p: {
    fontSize: "inherit",
    minWidth: 0,
    ...textOverflow,
  },
});

const StyledTokenDisplayFlex = styled(StyledRowFlex)({
  alignItems: "flex-start",
  flex: 1,
  gap: 8,
});
const StyledTokenDisplay = styled(StyledColumnFlex)({
  flex: 1,
  gap: 3,
  width: "auto",
  alignItems: "flex-start",

  fontSize: 16,
  minWidth: 0,
});

const StyledTokenLogo = styled(TokenLogo)({
  width: 28,
  height: 28,
  top: -2,
  position: "relative",
  "@media(max-width: 600px)": {
    width: 20,
    height: 20,
    top: 0,
  },
});
