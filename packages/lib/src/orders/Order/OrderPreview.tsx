import { LinearProgress, Typography, Box, styled } from "@mui/material";
import { OrderUI, useTwapContext } from "../..";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { HiOutlineArrowLongRight } from "react-icons/hi2";
import { FiChevronDown } from "react-icons/fi";
import { useFormatNumber, useOrderPastEvents } from "../../hooks";
import { Icon, Loader, SmallLabel, TokenLogo, Tooltip } from "../../components/base";
import { TokenData } from "@orbs-network/twap";
import { ReactNode } from "react";

function OrderPreview({ order, expanded }: { order: OrderUI; expanded: boolean }) {
  const { data, isFetching } = useOrderPastEvents(order, expanded);

  const srcFilledAmountUi = useFormatNumber({ value: order.ui.srcFilledAmountUi });
  const progress = useFormatNumber({ value: order.ui.progress, decimalScale: 1, suffix: "%" });

  const translations = useTwapContext().translations;
  return (
    <StyledColumnFlex gap={0} className="twap-order-preview">
      <StyledHeader className="twap-order-preview-header">
        <StyledRowFlex className="twap-order-preview-info" gap={6} justifyContent="flex-start" style={{ width: "auto" }}>
          <StyledHeaderText>#{order.order.id}</StyledHeaderText>
          <StyledHeaderText>{order.ui.isMarketOrder ? translations.marketOrder : translations.limitOrder}</StyledHeaderText>
        </StyledRowFlex>
        <StyledHeaderText className="twap-order-preview-date">{order.ui.createdAtUi}</StyledHeaderText>
      </StyledHeader>
      <Tooltip
        childrenStyles={{ width: "100%" }}
        placement="top"
        text={
          <Box>
            {srcFilledAmountUi}
            {" " + order.ui.srcToken?.symbol + " "}
            {`(${progress ? progress : "0%"})`}
          </Box>
        }
      >
        <StyledPreviewLinearProgress variant="determinate" value={order.ui.progress || 1} className="twap-order-progress twap-order-preview-progress" />
      </Tooltip>
      <StyledRowFlex style={{ paddingTop: 18, paddingRight: 10, alignItems: "flex-start" }} className="twap-order-preview-tokens" justifyContent="space-between">
        <OrderTokenDisplay token={order.ui.srcToken} amount={order.ui.srcAmountUi} usdValue={order.ui.srcAmountUsdUi} />
        <Icon className="twap-order-preview-icon" icon={<HiOutlineArrowLongRight style={{ width: 30, height: 30 }} />} />
        <OrderTokenDisplay isLoading={isFetching} token={order.ui.dstToken} amount={data?.dstAmountOut} usdValue={data?.dstAmountOutUsdPrice || ""} icon={<FiChevronDown />} />
      </StyledRowFlex>
    </StyledColumnFlex>
  );
}

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
  usdValue: string;
  icon?: ReactNode;
  isLoading?: boolean;
}
export const OrderTokenDisplay = ({ token, amount, prefix = "", className = "", usdValue, alighLeft, usdPrefix, icon, isLoading }: OrderTokenDisplayProps) => {
  const tokenAmount = useFormatNumber({ value: amount });
  const tokenAmountTooltip = useFormatNumber({ value: amount, decimalScale: 18 });

  return (
    <StyledTokenDisplay className={`twap-order-token-display ${className}`}>
      <StyledRowFlex style={{ alignItems: "flex-start" }}>
        <StyledTokenLogo logo={token?.logoUrl} />
        <StyledColumnFlex gap={3} style={{ flex: 1, justifyContent: "flex-start" }}>
          <StyledRowFlex className="twap-token-display-amount-and-symbol">
            {isLoading && <Loader width={50} />}
            {amount ? (
              <Typography>
                <Tooltip text={`${tokenAmountTooltip} ${token?.symbol}`}>
                  {prefix ? `${prefix} ` : ""}
                  {tokenAmount}
                  {` ${token?.symbol}`}
                </Tooltip>
              </Typography>
            ) : (
              <Typography>{` ${token?.symbol}`}</Typography>
            )}
          </StyledRowFlex>
          {!alighLeft && <OrderUsdValue isLoading={isLoading} usdValue={usdValue} prefix={usdPrefix} />}
        </StyledColumnFlex>
        {icon && <StyledIcon>{icon}</StyledIcon>}
      </StyledRowFlex>
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
  const formattedValue = useFormatNumber({ value: usdValue });
  const formattedValueTooltip = useFormatNumber({ value: usdValue, decimalScale: 18 });

  if (isLoading) return <Loader width={100} height={20} />;
  if (!usdValue) return null;

  return (
    <StyledTokenDisplayUsd loading={false} className="twap-order-token-display-usd">
      <Tooltip text={`$ ${formattedValueTooltip}`}>
        {prefix} $ {formattedValue}
      </Tooltip>
    </StyledTokenDisplayUsd>
  );
}

const StyledTokenDisplayUsd = styled(SmallLabel)({
  fontSize: 14,
});

const StyledTokenDisplay = styled(StyledColumnFlex)({
  gap: 3,
  alignItems: "flex-start",
  width: "fit-content",
  fontSize: 16,
  "& .twap-token-display-amount-and-symbol": {
    fontSize: "inherit",
  },
});

const StyledTokenLogo = styled(TokenLogo)({
  width: 28,
  height: 28,
  top: -2,
  position: "relative",
  "@media(max-width: 600px)": {
    width: 20,
    height: 20,
  },
});
