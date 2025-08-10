import { LinearProgress, Typography, Box, styled } from "@mui/material";
import { Components, useTwapContext } from "../..";
import { StyledColumnFlex, StyledRowFlex, StyledText, textOverflow } from "../../styles";
import { useAmountUi, useFormatNumber, useGetToken, useIsMobile } from "../../hooks";
import { Loader, SmallLabel, TokenLogo, Tooltip } from "../../components/base";
import { Status, TokenData } from "@orbs-network/twap";
import { ReactNode } from "react";
import { ChevronDown } from "./icons";
import { OrderProgress, OrderStatus } from "./Components";
import { useListOrderContext } from "./context";
import { InvertPrice } from "../../components";
import { useOrderPrice } from "./hooks";

const Tokens = () => {
  const order = useListOrderContext().order;
  const srcToken = useGetToken(order.srcTokenAddress);
  const dstToken = useGetToken(order.dstTokenAddress);
  const srcAmountUi = useAmountUi(srcToken?.decimals, order.srcAmount);
  const dstAmountUi = useAmountUi(dstToken?.decimals, order.dstFilledAmount);

  return (
    <SyledTokens className="twap-order-preview-tokens">
      <TokensToken className="twap-order-preview-tokens-in-token" token={srcToken} amount={srcAmountUi} />
      <TokensToken className="twap-order-preview-tokens-out-token" token={dstToken} amount={order.status === Status.Completed ? dstAmountUi : ""} />
    </SyledTokens>
  );
};

const StyledToken = styled(StyledRowFlex)({
  gap: 0,
  justifyContent: "flex-start",
  ".twap-token-logo ": {
    width: 24,
    height: 24,
  },
});

const TokensToken = ({ token, amount, className }: { token?: TokenData; amount?: string; className: string }) => {
  const amountF = useFormatNumber({ value: amount, decimalScale: 3 });
  return (
    <StyledToken className={`twap-order-preview-token ${className}`}>
      <Components.Base.TokenLogo logo={token?.logoUrl} token={token} />
      <StyledTokenSymbol>
        <StyledText>
          {amount ? amountF : ""} {token?.symbol}
        </StyledText>
      </StyledTokenSymbol>
    </StyledToken>
  );
};

const StyledTokenSymbol = styled(StyledRowFlex)({
  width: "calc(100% - 28px)",
  paddingLeft: 10,
  justifyContent: "flex-start",
  p: {
    fontSize: 16,
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    fontWeight: 600,
  },
});

const DesktopOrderPreview = () => {
  return (
    <StyledOrderPreview gap={0} className="twap-order-preview">
      <Tokens />
      <OrderExcecutionPrice />
      <StyledStatusAndToggle>
        <OrderPreviewRight />
        <ToggleExpanded />
      </StyledStatusAndToggle>
    </StyledOrderPreview>
  );
};

const MobileOrderPreview = () => {
  return (
    <StyledOrderPreview className="twap-order-preview">
      <StyledRowFlex style={{ justifyContent: "space-between" }}>
        <Tokens />
        <ToggleExpanded />
      </StyledRowFlex>
      <StyledRowFlex style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <OrderExcecutionPrice />
        <OrderPreviewRight />
      </StyledRowFlex>
    </StyledOrderPreview>
  );
};

function OrderPreview() {
  const isMobile = useIsMobile(1200);
  if (isMobile) {
    return <MobileOrderPreview />;
  }

  return <DesktopOrderPreview />;
}

const StyledStatusAndToggle = styled(StyledRowFlex)({
  width: 135,
  gap: 5,
  justifyContent: "space-between",
});

const OrderExcecutionPrice = () => {
  const { srcToken, dstToken, expanded } = useListOrderContext();
  const price = useOrderPrice();

  if (expanded || !price) return null;
  return <StyledPrice price={price} srcToken={srcToken} dstToken={dstToken} />;
};

const OrderPreviewRight = () => {
  const { order, expanded } = useListOrderContext();
  const { translations } = useTwapContext();

  return (
    <StyledStatus>
      {expanded ? (
        <StyledStatusHide className="twap-order-hide">{translations.hide}</StyledStatusHide>
      ) : order.status === Status.Open ? (
        <OrderProgress order={order} />
      ) : (
        <OrderStatus order={order} />
      )}
    </StyledStatus>
  );
};

const StyledStatusHide = styled(StyledText)({
  textAlign: "right",
  flex: 1,
  "@media (max-width: 1200px)": {
    display: "none",
  },
});

const StyledStatus = styled(StyledRowFlex)({
  flex: 1,
  justifyContent: "flex-start",
  "@media (max-width: 1200px)": {
    width: "auto",
    flex: "unset",
  },
});

const StyledPrice = styled(InvertPrice)({
  gap: 5,
  width: "40%",
  maxWidth: 230,
  fontSize: 14,
  justifyContent: "flex-start",
  svg: {
    cursor: "pointer",
  },
  "@media (max-width: 1200px)": {
    width: "auto",
    flex: 1,
  },
});

const SyledTokens = styled(StyledColumnFlex)({
  width: 160,
  alignItems: "flex-start",
  gap: 5,
  "@media (max-width: 1200px)": {
    width: "auto",
    flex: 1,
  },
});

const ToggleExpanded = () => {
  const { expanded } = useListOrderContext();
  return (
    <StyledExpandToggle expanded={expanded ? 1 : 0}>
      <ChevronDown />
    </StyledExpandToggle>
  );
};

const StyledOrderPreview = styled(StyledRowFlex)({
  justifyContent: "space-between",
  cursor: "pointer",
  "@media (max-width: 1200px)": {
    flexDirection: "column",
    gap: 11,
  },
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
