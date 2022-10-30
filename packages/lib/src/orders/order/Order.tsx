import { Box, styled } from "@mui/system";
import React, { ReactNode, useMemo, useState } from "react";
import Text from "../../base-components/Text";
import LinearProgress from "@mui/material/LinearProgress";
import TokenName from "../../base-components/TokenName";
import TokenLogo from "../../base-components/TokenLogo";
import NumberDisplay from "../../base-components/NumberDisplay";
import { BsArrowRight } from "react-icons/bs";
import Icon from "../../base-components/Icon";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Label from "../../base-components/Label";
import Tooltip from "../../base-components/Tooltip";
import SmallLabel from "../../base-components/SmallLabel";
import Button from "../../base-components/Button";
import { useOrdersUsdValueToUi, useTokenFromTokensList } from "../../store/orders";
import Card from "../../base-components/Card";
import { Order, OrderStatus } from "../../types";
import { BigNumber, Token } from "@defi.org/web3-candies";
import { useGetBigNumberToUiAmount } from "../../store/store";

export interface Props {
  order: Order;
  onExpand: () => void;
  expanded: boolean;
  type?: OrderStatus;
}
function OrderComponent({ order, onExpand, expanded, type }: Props) {
  const { id, createdAtUi, srcToken, dstToken, srcTokenAmount } = order;
  console.log({ order });

  return (
    <StyledContainer className="twap-order">
      <StyledAccordion expanded={expanded}>
        <StyledSummary onClick={onExpand}>
          <StyledColumnFlex>
            <StyledHeader>
              <Text>#{id}</Text>
              <Text>{createdAtUi}</Text>
            </StyledHeader>

            {expanded ? <StyledSeperator /> : <PreviewProgressBar progress={80} />}
            <StyledFlexStart>
              <TokenDetails token={srcToken} amount={srcTokenAmount} />
              <Icon className="icon" icon={<BsArrowRight style={{ width: 30, height: 30 }} />} />
              <TokenDetails token={dstToken} />
            </StyledFlexStart>
            <StyledSeperator />
          </StyledColumnFlex>
          <StyledSpace />
        </StyledSummary>
        <AccordionDetails style={{ padding: 0 }}>
          <OrderDetails order={order} type={type} />
        </AccordionDetails>
      </StyledAccordion>
    </StyledContainer>
  );
}

const OrderDetails = ({ order, type }: { order: Order; type?: OrderStatus }) => {
  const [fullInfo, setFullInfo] = useState(false);

  const { deadlineUi, tradeIntervalUi, srcToken, dstToken, srcTokenAmount, tradeSizeUi, srcFilledAmount } = order;

  return (
    <StyledOrderDetails>
      {/* <OrderPriceCompare fromTokenSymbol={"WBTC"} toTokenSymbol={"WETH"} /> */}
      <StyledProgress>
        <Label className="label">Progress</Label>
        <StyledProgressContent gap={20}>
          <StyledFlex>
            <TokenDetails hideUSD={!fullInfo} token={srcToken} amount={srcFilledAmount} />
            <TokenDetails hideUSD={!fullInfo} token={dstToken} />
          </StyledFlex>
          <MainProgressBar progress={60} />
          {fullInfo && (
            <StyledFlex>
              <TokenDetails token={srcToken} />
              <TokenDetails token={dstToken} />
            </StyledFlex>
          )}
          <StyledInformationButton className="more-btn" onClick={() => setFullInfo(!fullInfo)}>
            {fullInfo ? "View Less information" : "View full information"}
          </StyledInformationButton>
        </StyledProgressContent>
      </StyledProgress>
      <StyledColumnFlex>
        <DetailRow label="Trades Size:" tooltip="some text">
          0.25 WBTC≈$4,750
        </DetailRow>
        <DetailRow label="Trades interval:" tooltip="some text">
          {tradeIntervalUi}
        </DetailRow>
        <DetailRow label="Deadline:" tooltip="some text">
          {deadlineUi}
        </DetailRow>
      </StyledColumnFlex>
      {type === OrderStatus.Open && <CancelOrderButton />}
    </StyledOrderDetails>
  );
};

const StyledSeperator = styled(Box)({
  width: "100%",
  height: 1,
  background: "#373E55",
});

const StyledSpace = styled(Box)({
  height: 10,
});

const StyledFlexStart = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  width: "100%",
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
    margin: 0,
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
  "& p": {
    color: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
  },
});

const PreviewProgressBar = ({ progress, emptyBarColor }: { progress: number; emptyBarColor?: string }) => {
  return <StyledPreviewLinearProgress variant="determinate" value={progress} emptybarcolor={emptyBarColor} className="twap-order-progress-line-preview" />;
};

const TokenDetails = ({ hideUSD, token, amount }: { hideUSD?: boolean; token: Token; amount?: BigNumber }) => {
  const tokenInfo = useTokenFromTokensList(token.address);
  const { data: usdValueUi, isLoading } = useOrdersUsdValueToUi(token, amount);
  const uiAmount = useGetBigNumberToUiAmount(token, amount);

  return (
    <StyledTokenDetails>
      <Box className="top">
        <TokenLogo logo={tokenInfo.logoUrl} />
        <Text>
          <NumberDisplay value={uiAmount} />
        </Text>
        <TokenName name={tokenInfo.symbol} />
      </Box>
      {!hideUSD && (
        <SmallLabel loading={isLoading}>
          ≈$
          <NumberDisplay value={usdValueUi} />
        </SmallLabel>
      )}
    </StyledTokenDetails>
  );
};

const StyledTokenDetails = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,

  "& .top": {
    display: "flex",
    alignItems: "center",
    gap: 5,
    "& *": {
      fontSize: 18,
    },
  },
  "& .twap-token-logo": {
    width: 28,
    height: 28,
  },
  "& .twap-token-name": {},
  "& .twap-text": {},
  "& .usd": { fontSize: 14 },
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

const CancelOrderButton = () => {
  return <StyledCancelOrderButton onClick={() => {}}>Cancel Order</StyledCancelOrderButton>;
};

const StyledCancelOrderButton = styled(Button)({
  background: "transparent",
  border: "unset",
  width: "fit-content",
  marginTop: 30,
  fontSize: 14,
  fontFamily: "inherit",
  marginLeft: "auto",
  marginRight: "auto",
  fontWeight: 300,
});

const DetailRow = ({ label, tooltip, children }: { label: string; tooltip: string; children: ReactNode }) => {
  return (
    <StyledDetailRow>
      <Tooltip text={tooltip}>
        <SmallLabel className="label">{label}</SmallLabel>
      </Tooltip>
      <Text className="text">{children}</Text>
    </StyledDetailRow>
  );
};

const StyledFlex = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
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

const StyledInformationButton = styled("button")({
  background: "transparent",
  border: "unset",
  cursor: "pointer",
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
  paddingTop: 20,
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
