import { Box, styled } from "@mui/system";
import { ReactNode, useContext } from "react";
import Text from "../components/Text";
import LinearProgress from "@mui/material/LinearProgress";
import TokenName from "../components/TokenName";
import TokenLogo from "../components/TokenLogo";
import NumberDisplay from "../components/NumberDisplay";
import { HiOutlineArrowNarrowRight } from "react-icons/hi";
import Icon from "../components/Icon";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Label from "../components/Label";
import Tooltip from "../components/Tooltip";
import SmallLabel from "../components/SmallLabel";
import Button from "../components/Button";
import Card from "../components/Card";
import { Typography } from "@mui/material";
import { StyledColumnGap } from "../styles";
import { Status, TokenData } from "@orbs-network/twap";
import { fillDelayUi, useCancelOrder, useHistoryPrice, useTokenImage, useTwapTranslations } from "../hooks";
import { OrderUI } from "../state";
import TokenPriceCompare from "../components/TokenPriceCompare";
import { TwapContext } from "../context";

export interface Props {
  order: OrderUI;
  onExpand: () => void;
  expanded: boolean;
}

function OrderComponent({ order, onExpand, expanded }: Props) {
  const translations = useTwapTranslations();
  return (
    <StyledContainer className="twap-order">
      <StyledAccordion expanded={expanded}>
        <StyledSummary onClick={onExpand}>
          <StyledColumnFlex gap={0}>
            <StyledHeader>
              <Box className="flex">
                <Text>#{order.order.id}</Text>
                <Text>{order.ui.isMarketOrder ? translations.marketOrder : translations.limitOrder}</Text>
              </Box>
              <Text>{order.ui.createdAtUi}</Text>
            </StyledHeader>

            {expanded ? <StyledSeperator /> : <PreviewProgressBar progress={order.ui.progress || 1} />}
            <StyledPreview>
              <TokenDisplay token={order.ui.srcToken} amount={order.ui.srcAmountUi} usdValue={order.ui.srcAmountUsdUi} />
              <Icon className="icon" icon={<HiOutlineArrowNarrowRight style={{ width: 30, height: 30 }} />} />
              <TokenDisplay token={order.ui.dstToken} prefix={order.ui.prefix} amount={order.ui.dstAmountUi} usdValue={order.ui.dstAmountUsdUi} />
            </StyledPreview>
          </StyledColumnFlex>
          <StyledSpace />
        </StyledSummary>
        <AccordionDetails style={{ padding: 0, paddingTop: 10 }}>
          <StyledSeperator style={{ marginBottom: 10 }} />
          <OrderDetails order={order} />
        </AccordionDetails>
      </StyledAccordion>
    </StyledContainer>
  );
}

const OrderDetails = ({ order }: { order: OrderUI }) => {
  const translations = useTwapTranslations();

  return (
    <StyledOrderDetails>
      {order.ui.srcToken && order.ui.dstToken && <OrderPrice order={order} />}
      <StyledProgress>
        <StyledProgressContent gap={20}>
          <StyledFlex>
            <StyledTokenDisplayWithTitle>
              <Typography className="title">{translations.filled}</Typography>
              <TokenDisplay usdValue={order.ui.srcFilledAmountUsdUi} token={order.ui.srcToken} amount={order.ui.srcFilledAmountUi} />
            </StyledTokenDisplayWithTitle>
            <StyledTokenDisplayWithTitle>
              <Typography className="title">{translations.remaining}</Typography>
              <TokenDisplay usdValue={order.ui.srcRemainingAmountUsdUi} token={order.ui.srcToken} amount={order.ui.srcRemainingAmountUi} />
            </StyledTokenDisplayWithTitle>
          </StyledFlex>
          <Tooltip text={<NumberDisplay value={order.ui.progress} decimalScale={1} suffix="%" />}>
            <MainProgressBar progress={order.ui.progress || 1} />
          </Tooltip>
        </StyledProgressContent>
      </StyledProgress>
      <StyledColumnFlex>
        <DetailRow label={`${translations.totalTrades}:`} tooltip={translations.totalTradesTooltip}>
          <NumberDisplay value={order.ui.totalChunks} />
        </DetailRow>
        <DetailRow label={`${translations.tradeSize}:`} tooltip={translations.tradeSizeTooltip}>
          <OrderTokenLogo token={order.ui.srcToken} />
          <NumberDisplay value={order.ui.srcChunkAmountUi} />
          {order.ui.srcToken?.symbol} ≈ $ <NumberDisplay value={order.ui.srcChunkAmountUsdUi} />
        </DetailRow>
        {order.ui.isMarketOrder ? (
          <DetailRow label={`${translations.minReceivedPerTrade}:`} tooltip={translations.confirmationMinDstAmountTootipMarket}>
            <OrderTokenLogo token={order.ui.dstToken} />
            {translations.none} {order.ui.dstToken?.symbol}
          </DetailRow>
        ) : (
          <DetailRow label={`${translations.minReceivedPerTrade}:`} tooltip={translations.confirmationMinDstAmountTootipLimit}>
            <OrderTokenLogo token={order.ui.dstToken} />
            <NumberDisplay value={order.ui.dstMinAmountOutUi} />
            {order.ui.dstToken?.symbol} ≈ $ <NumberDisplay value={order.ui.dstMinAmountOutUsdUi} />
          </DetailRow>
        )}

        <DetailRow label={`${translations.tradeInterval}:`} tooltip={translations.tradeIntervalTootlip}>
          {fillDelayUi(order.ui.fillDelay, translations)}
        </DetailRow>
        <DetailRow label={`${translations.deadline}:`} tooltip={translations.maxDurationTooltip}>
          {order.ui.deadlineUi}
        </DetailRow>
      </StyledColumnFlex>
      {order.ui.status === Status.Open && <CancelOrderButton orderId={order.order.id} />}
    </StyledOrderDetails>
  );
};

const StyledTokenDisplayWithTitle = styled(StyledColumnGap)({
  gap: 10,
});

const CancelOrderButton = ({ orderId }: { orderId: number }) => {
  const { isLoading, mutate } = useCancelOrder();
  const translations = useTwapTranslations();
  return (
    <StyledCancelOrderButton loading={isLoading} onClick={() => mutate(orderId)}>
      {translations.cancelOrder}
    </StyledCancelOrderButton>
  );
};

const StyledSeperator = styled(Box)({
  width: "100%",
  height: 1,
  background: "#373E55",
});

const StyledSpace = styled(Box)({
  height: 20,
});

const StyledPreview = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  width: "100%",
  marginTop: 18,
  fontSize: 18,

  "& .usd": {
    fontSize: 14,
  },
  "@media(max-width: 600px)": {
    zoom: 0.85,
  },
});

export default OrderComponent;

const StyledSummary = styled(AccordionSummary)({
  flexDirection: "column",
  display: "flex",
  width: "100%",
  padding: 0,
});

const StyledContainer = styled(Card)({});

const StyledAccordion = styled(Accordion)({
  width: "100%",
  fontFamily: "inherit",
  padding: 0,
  margin: 0,
  background: "transparent",
  boxShadow: "unset",
  "& .MuiAccordionSummary-content": {
    margin: "0!important",
    width: "100%",
  },
  "& *": {
    color: "white",
  },
});
const StyledHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: "#9CA3AF",
  fontSize: 14,
  fontWeight: 300,
  marginBottom: 12,
  "& .flex": {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  "& p": {
    color: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
  },
});

const PreviewProgressBar = ({ progress, emptyBarColor }: { progress: number; emptyBarColor?: string }) => {
  return <StyledPreviewLinearProgress variant="determinate" value={progress} emptybarcolor={emptyBarColor} className="twap-order-progress-line-preview" />;
};

const OrderTokenLogo = ({ token, className = "" }: { token?: TokenData; className?: string }) => {
  const tokenLogo = useTokenImage(token);
  return <TokenLogo className={className} logo={tokenLogo} />;
};

const TokenDisplay = ({ token, amount, prefix = "", usdValue }: { token?: TokenData; amount?: string; usdValue: string; prefix?: string }) => {
  return (
    <StyledTokenDisplay className="token-display">
      <StyledTokenLogo token={token} />
      <StyledTokenDisplayRight>
        <StyledTokenDisplayRightTop>
          <StyledTokenDisplayAmount className="amount">
            {prefix ? `${prefix} ` : ""}
            <NumberDisplay value={amount} />
          </StyledTokenDisplayAmount>
          <TokenName name={token?.symbol} />
        </StyledTokenDisplayRightTop>
        <StyledTokenDisplayUsd loading={false} className="usd">
          ≈ $ <NumberDisplay value={usdValue} />
        </StyledTokenDisplayUsd>
      </StyledTokenDisplayRight>
    </StyledTokenDisplay>
  );
};

const StyledTokenDisplayAmount = styled(Typography)({});

const StyledTokenDisplayRightTop = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 5,
  "& *": {
    fontSize: "inherit",
  },
});

const StyledTokenDisplayRight = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 3,
});

const StyledTokenDisplay = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: 10,
  "& .top": {
    display: "flex",
    alignItems: "center",
    gap: 8,
    "& *": {
      fontSize: 18,
    },
  },

  "& .twap-token-name": {},
  "& .twap-text": {},
});

const StyledTokenLogo = styled(OrderTokenLogo)({
  width: 28,
  height: 28,
  top: -2,
  position: "relative",
  "@media(max-width: 600px)": {
    width: 20,
    height: 20,
  },
});

const StyledTokenDisplayUsd = styled(SmallLabel)({
  fontSize: 13,
});

const StyledPreviewLinearProgress = styled(LinearProgress)(({ emptybarcolor }: { emptybarcolor?: string }) => ({
  height: 5,
  marginLeft: "auto",
  marginRight: "auto",
  width: "100%",
  borderRadius: 50,
  background: "transparent",
  "&::after": {
    position: "absolute",
    background: emptybarcolor || "white",
    top: "50%",
    left: 0,
    transform: "translate(0, -50%)",
    height: 1,
    content: '""',
    width: "100%",
  },
  "& .MuiLinearProgress-bar": {
    height: 5,
    zIndex: 1,
    borderRadius: 50,
  },
}));

const OrderPrice = ({ order }: { order: OrderUI }) => {
  const { leftToken, rightToken, priceUi, toggleInverted } = useHistoryPrice(order);
  const translations = useTwapTranslations();
  return (
    <StyledFlex>
      <SmallLabel>{order.ui.isMarketOrder ? translations.marketPrice : translations.limitPrice}</SmallLabel>
      <TokenPriceCompare leftToken={leftToken} rightToken={rightToken} price={priceUi} toggleInverted={toggleInverted} />
    </StyledFlex>
  );
};

const StyledCancelOrderButton = styled(Button)({
  background: "transparent",
  border: "unset",
  width: "fit-content",
  marginTop: 30,
  fontSize: 15,
  fontFamily: "inherit",
  marginLeft: "auto",
  marginRight: "auto",
  fontWeight: 300,
  marginBottom: 20,
});

const DetailRow = ({ label, tooltip, children }: { label: string; tooltip: string; children: ReactNode }) => {
  return (
    <StyledDetailRow>
      <Label className="label" tooltipText={tooltip}>
        {label}
      </Label>
      <StyledDetailRowChildren>{children}</StyledDetailRowChildren>
    </StyledDetailRow>
  );
};

const StyledFlex = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 14,
});

const StyledDetailRow = styled(StyledFlex)({
  fontSize: 14,

  "& *": {
    fontSize: "inherit",
  },
  "& .label": {
    fontWeight: 400,
  },
  "& .text": {
    fontWeight: 300,
  },
  "@media(max-width: 600px)": {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 5,
  },
});

const StyledDetailRowChildren = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 5,
  "& .twap-token-logo": {
    width: 22,
    height: 22,
  },
});

const StyledProgress = styled(Box)({
  width: "100%",
  padding: 20,
  background: "#3C404E",
  borderRadius: 6,
  "& .more-btn": {
    marginTop: 10,
  },
  "& .label": {
    fontSize: 14,
  },
});

const StyledColumnFlex = styled(Box)(({ gap = 10 }: { gap?: number }) => ({
  display: "flex",
  flexDirection: "column",
  gap,
  width: "100%",
}));

const StyledProgressContent = styled(StyledColumnFlex)({
  display: "flex",
  flexDirection: "column",
});

const MainProgressBar = ({ progress }: { progress: number; emptyBarColor?: string }) => {
  return <StyledMainProgressBar variant="determinate" value={progress} className="twap-order-main-progress-bar" />;
};

const StyledMainProgressBar = styled(LinearProgress)({
  height: 21,
  background: "#22353C",
  borderRadius: 2,
  "& .MuiLinearProgress-bar": {
    borderRadius: "4px",
  },
});

const StyledOrderDetails = styled(StyledColumnFlex)({
  width: "100%",
  gap: 20,
  paddingTop: 10,
});
