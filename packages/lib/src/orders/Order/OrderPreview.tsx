import { LinearProgress, Typography, Box, styled, Fade } from "@mui/material";
import { OrderUI, useTwapContext } from "../..";
import { StyledColumnFlex, StyledRowFlex, StyledText, textOverflow } from "../../styles";
import { useFormatNumberV2 } from "../../hooks";
import { Icon, Loader, SmallLabel, TokenLogo, Tooltip } from "../../components/base";
import { TokenData } from "@orbs-network/twap";
import { ReactNode } from "react";
import { HiArrowRight } from "@react-icons/all-files/hi/HiArrowRight";
import { FiChevronDown } from "@react-icons/all-files/fi/FiChevronDown";

function OrderPreview({ order, onExpand }: { order: OrderUI; onExpand: () => void }) {
  const srcFilledAmountUi = useFormatNumberV2({ value: order?.srcFilledAmountUi });
  const progress = useFormatNumberV2({ value: order?.progress, decimalScale: 1, suffix: "%" });
  const translations = useTwapContext().translations;

  return (
    <StyledColumnFlex gap={0} className="twap-order-preview">
      <StyledHeader className="twap-order-preview-header">
        <StyledRowFlex className="twap-order-preview-info" gap={6} justifyContent="flex-start" style={{ width: "auto" }}>
          <StyledHeaderText>#{order?.id}</StyledHeaderText>
          <StyledHeaderText>{order?.isMarketOrder ? translations.marketOrder : translations.limitOrder}</StyledHeaderText>
        </StyledRowFlex>
        <StyledHeaderText className="twap-order-preview-date">{order?.createdAtUi}</StyledHeaderText>
      </StyledHeader>
      <Tooltip
        childrenStyles={{ width: "100%" }}
        placement="top"
        text={
          <Box>
            {srcFilledAmountUi}
            {" " + order?.srcToken?.symbol + " "}
            {`(${progress ? progress : "0%"})`}
          </Box>
        }
      >
        <StyledPreviewLinearProgress variant="determinate" value={order?.progress || 1} className="twap-order-progress twap-order-preview-progress" />
      </Tooltip>
      <StyledOrderTokensDisplay className="twap-order-preview-tokens" justifyContent="space-between">
        <OrderTokenDisplay isMain={true} token={order?.srcToken} amount={order?.srcAmountUi} usdValue={order?.srcAmountUsdUi || "0"} isLoading={!order?.srcAmountUsdUi} />
        <Icon className="twap-order-preview-icon" icon={<HiArrowRight style={{ width: 22, height: 22 }} />} />
        <OrderTokenDisplay isLoading={false} token={order?.dstToken} amount={order?.dstAmount} usdValue={order?.dstAmountUsd} icon={<FiChevronDown onClick={onExpand} />} />
      </StyledOrderTokensDisplay>
    </StyledColumnFlex>
  );
}

const StyledOrderTokensDisplay = styled(StyledRowFlex)({
  paddingTop: 18,
  paddingRight: 10,
  alignItems: "flex-start",
  gap: 16,
  "@media(max-width: 600px)": {
    flexDirection: "column",
    alignItems: "center",
    ".twap-order-preview-icon": {
      transform: "rotate(90deg)",
    },
  },
});

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

const StyledHeader = styled(StyledRowFlex)({
  justifyContent: "space-between",
  fontSize: 13,
  fontWeight: 300,
  marginBottom: 12,
});

const StyledHeaderText = styled(StyledText)({
  fontSize: "inherit",
  fontWeight: "inherit",
  color: "#9CA3AF",
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
  const tokenAmount = useFormatNumberV2({ value: amount });

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
  const formattedValue = useFormatNumberV2({ value: usdValue });

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
