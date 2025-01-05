import { LinearProgress, Typography, Box, styled } from "@mui/material";
import { Components } from "../..";
import { StyledColumnFlex, StyledRowFlex, StyledText, textOverflow } from "../../styles";
import { useAmountUi, useFormatNumber, useGetToken } from "../../hooks";
import { Loader, SmallLabel, TokenLogo, Tooltip } from "../../components/base";
import { Status, TokenData } from "@orbs-network/twap";
import { ReactNode, useMemo, useState } from "react";
import { ArrowsIcon, ChevronDown } from "./icons";
import BN from "bignumber.js";
import { OrderProgress, OrderStatus, useOrderExcecutionPrice } from "./Components";
import { Order } from "../../order";
import { useListOrderContext } from "./context";
import { InvertPrice } from "../../components";

const Tokens = () => {
  const order = useListOrderContext().order;
  const srcToken = useGetToken(order.srcTokenAddress);
  const dstToken = useGetToken(order.dstTokenAddress);
  const srcAmountUi = useAmountUi(srcToken?.decimals, order.srcAmount);

  return (
    <SyledTokens className="twap-order-preview-tokens">
      <TokensToken isSrc={true} className="twap-order-preview-tokens-in-token" token={srcToken} amount={srcAmountUi} />
      <TokensToken className="twap-order-preview-tokens-out-token" token={dstToken} amount={""} />
    </SyledTokens>
  );
};

const StyledToken = styled(StyledRowFlex)({
  width: "auto",
  ".twap-token-logo ": {
    width: 24,
    height: 24,
  },
});

const TokensToken = ({ token, amount, className, isSrc }: { token?: TokenData; amount?: string; className: string; isSrc?: boolean }) => {
  const amountF = useFormatNumber({ value: amount, decimalScale: 3 });
  return (
    <StyledToken className={`twap-order-preview-token ${isSrc ? "twap-order-preview-token-src" : ""} ${className}`}>
      <Components.Base.TokenLogo logo={token?.logoUrl} />
      <StyledTokenSymbol>
        {amountF} {token?.symbol}{" "}
      </StyledTokenSymbol>
    </StyledToken>
  );
};
const StyledTokenSymbol = styled(StyledText)({
  fontSize: 16,
  fontWeight: 600,
});

function OrderPreview() {
  return (
    <StyledOrderPreview gap={0} className="twap-order-preview">
      <Tokens />
      <OrderExcecutionPrice />
      <OrderPreviewRight />
    </StyledOrderPreview>
  );
}

const OrderExcecutionPrice = () => {
  const { order, expanded } = useListOrderContext();
  const { price, srcToken, dstToken } = useOrderExcecutionPrice(order);

  if (expanded || !price) return null;
  return (
    <StyledPrice>
      <InvertPrice price={price} srcToken={srcToken} dstToken={dstToken} />
    </StyledPrice>
  );
};

const OrderPreviewRight = () => {
  const { order, expanded } = useListOrderContext();
  return (
    <StyledStatus>
      {expanded ? (
        <StyledStatusHide className="twap-order-hide">Hide</StyledStatusHide>
      ) : order.status === Status.Open ? (
        <OrderProgress order={order} />
      ) : (
        <OrderStatus order={order} />
      )}
      <ToggleExpanded />
    </StyledStatus>
  );
};

const StyledStatusHide = styled(StyledText)({
  textAlign: "right",
  flex: 1,
});

const StyledStatus = styled(StyledRowFlex)({
  justifyContent: "space-between",
  width: 135,
  gap: 8,
});

const StyledPrice = styled(StyledRowFlex)({
  gap: 5,
  width: "40%",
  maxWidth: 230,
  fontSize: 14,
  justifyContent: "flex-start",
  svg: {
    position: "relative",
    top: 1,
  },
});

const SyledTokens = styled(StyledColumnFlex)({
  width: 140,
  alignItems: "flex-start",
  gap: 5,
});

const ToggleExpanded = () => {
  const { expanded, onExpand } = useListOrderContext();
  return (
    <StyledExpandToggle expanded={expanded ? 1 : 0} onClick={onExpand}>
      <ChevronDown />
    </StyledExpandToggle>
  );
};

const StyledOrderPreview = styled(StyledRowFlex)({
  justifyContent: "space-between",
  cursor: "auto!important",
});

const StyledExpandToggle = styled("button")<{ expanded: number }>(({ expanded }) => ({
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 0,
  margin: 0,
  marginRight: 5,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

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
