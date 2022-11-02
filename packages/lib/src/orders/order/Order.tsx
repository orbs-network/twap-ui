import { Box, styled } from "@mui/system";
import React, { ReactNode, useMemo, useState } from "react";
import Text from "../../base-components/Text";
import LinearProgress from "@mui/material/LinearProgress";
import TokenName from "../../base-components/TokenName";
import TokenLogo from "../../base-components/TokenLogo";
import NumberDisplay from "../../base-components/NumberDisplay";
import { HiOutlineArrowNarrowRight } from "react-icons/hi";
import Icon from "../../base-components/Icon";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Label from "../../base-components/Label";
import Tooltip from "../../base-components/Tooltip";
import SmallLabel from "../../base-components/SmallLabel";
import Button from "../../base-components/Button";
import { useCancelCallback } from "../../store/orders";
import Card from "../../base-components/Card";
import { Order, OrderStatus, TokenInfo } from "../../types";
import { Typography } from "@mui/material";
import text from "../../text.json";
import { StyledColumnGap } from "../../styles";
export interface Props {
  order: Order;
  onExpand: () => void;
  expanded: boolean;
  type?: OrderStatus;
}

function OrderComponent({ order, onExpand, expanded, type }: Props) {
  const { id, createdAtUi, progress, prefix, srcTokenInfo, dstTokenInfo, srcTokenAmountUi, dstTokenAmountUi, srcUsdValueUi, dstUsdValueUi } = order;

  return (
    <StyledContainer className="twap-order">
      <StyledAccordion expanded={expanded}>
        <StyledSummary onClick={onExpand}>
          <StyledColumnFlex gap={0}>
            <StyledHeader>
              <Text>#{id}</Text>
              <Text>{createdAtUi}</Text>
            </StyledHeader>

            {expanded ? <StyledSeperator /> : <PreviewProgressBar progress={progress} />}
            <StyledPreview>
              <TokenDisplay token={srcTokenInfo} amount={srcTokenAmountUi} usdValue={srcUsdValueUi} />
              <Icon className="icon" icon={<HiOutlineArrowNarrowRight style={{ width: 30, height: 30 }} />} />
              <TokenDisplay token={dstTokenInfo} prefix={prefix} amount={dstTokenAmountUi} usdValue={dstUsdValueUi} />
            </StyledPreview>
          </StyledColumnFlex>
          <StyledSpace />
        </StyledSummary>
        <AccordionDetails style={{ padding: 0, paddingTop: 10 }}>
          <StyledSeperator style={{ marginBottom: 10 }} />
          <OrderDetails order={order} type={type} />
        </AccordionDetails>
      </StyledAccordion>
    </StyledContainer>
  );
}

const OrderDetails = ({ order, type }: { order: Order; type?: OrderStatus }) => {
  const {
    deadlineUi,
    tradeIntervalUi,
    srcFilledUsdValueUi,
    srcRemainingUsdValueUi,
    progress,
    tradeSizeAmountUi,
    tradeSizeUsdValueUi,
    id,
    srcTokenInfo,
    srcRemainingAmountUi,
    srcFilledAmountUi,
  } = order;

  return (
    <StyledOrderDetails>
      {/* <OrderPriceCompare fromTokenSymbol={"WBTC"} toTokenSymbol={"WETH"} /> */}
      <StyledProgress>
        <StyledProgressContent gap={20}>
          <StyledFlex>
            <StyledTokenDisplayWithTitle>
              <Typography className="title">Filled</Typography>
              <TokenDisplay usdValue={srcFilledUsdValueUi} token={srcTokenInfo} amount={srcFilledAmountUi} />
            </StyledTokenDisplayWithTitle>
            <StyledTokenDisplayWithTitle>
              <Typography className="title">Remaining</Typography>
              <TokenDisplay usdValue={srcRemainingUsdValueUi} token={srcTokenInfo} amount={srcRemainingAmountUi} />
            </StyledTokenDisplayWithTitle>
          </StyledFlex>
          <Tooltip text={`${progress}%`}>
            <MainProgressBar progress={progress} />
          </Tooltip>
        </StyledProgressContent>
      </StyledProgress>
      <StyledColumnFlex>
        <DetailRow label="Trades Size:" tooltip={text.tradeSizeTooltip}>
          <NumberDisplay value={tradeSizeAmountUi} /> {srcTokenInfo.symbol} ≈$ {tradeSizeUsdValueUi}
        </DetailRow>
        <DetailRow label="Trades interval:" tooltip={text.tradeIntervalTooltip}>
          {tradeIntervalUi}
        </DetailRow>
        <DetailRow label="Deadline:" tooltip={text.deadlineTooltip}>
          {deadlineUi}
        </DetailRow>
      </StyledColumnFlex>
      {type === OrderStatus.Open && <CancelOrderButton orderId={id} />}
    </StyledOrderDetails>
  );
};

const StyledTokenDisplayWithTitle = styled(StyledColumnGap)({
  gap: 10,
});

const CancelOrderButton = ({ orderId }: { orderId: string }) => {
  const { isLoading, mutate } = useCancelCallback();
  return (
    <StyledCancelOrderButton loading={isLoading} onClick={() => mutate(orderId)}>
      Cancel Order
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
  "& p": {
    color: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
  },
});

const PreviewProgressBar = ({ progress, emptyBarColor }: { progress: number; emptyBarColor?: string }) => {
  return <StyledPreviewLinearProgress variant="determinate" value={progress} emptybarcolor={emptyBarColor} className="twap-order-progress-line-preview" />;
};

const TokenDisplay = ({ token, amount, prefix = "", usdValue }: { token: TokenInfo; amount?: string; usdValue: string; prefix?: string }) => {
  return (
    <StyledTokenDisplay className="token-display">
      <StyledTokenLogo logo={token.logoUrl} />
      <StyledTokenDisplayRight>
        <StyledTokenDisplayRightTop>
          <StyledTokenDisplayAmount className="amount">
            {prefix ? `${prefix} ` : ""}
            <NumberDisplay value={amount} />
          </StyledTokenDisplayAmount>
          <TokenName name={token.symbol} />
        </StyledTokenDisplayRightTop>
        <StyledTokenDisplayUsd loading={false} className="usd">
          ≈$ <NumberDisplay value={usdValue} />
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

const StyledTokenLogo = styled(TokenLogo)({
  width: 28,
  height: 28,
  top: -2,
  position: "relative",
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

const OrderPriceCompare = () => {
  // const srcToken = useTokenFromTokensList(fromTokenSymbol);
  // const dstToken = useTokenFromTokensList(toTokenSymbol);

  // if (!srcToken || !dstToken) return null;
  // return <TokenPriceCompare srcToken={srcToken} dstToken={dstToken} srcTokenPrice="3000" dstTokenPrice="500" />;
  return null;
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
      <Text className="text">{children}</Text>
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
});

const StyledProgress = styled(Box)({
  width: "100%",
  padding: 20,
  background: "#3C404E",
  borderRadius: 6,
  marginBottom: 20,
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

const MainProgressBar = ({ progress, emptyBarColor }: { progress: number; emptyBarColor?: string }) => {
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
  gap: 0,
});
