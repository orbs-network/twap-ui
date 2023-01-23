import { styled } from "@mui/system";
import React, { ReactElement, ReactNode } from "react";
import { Label, Switch, TokenPriceCompare, Tooltip } from "../components";
import SwipeContainer from "../components/SwipeContainer";
import { useTwapContext } from "../context";
import { useLimitPrice } from "../hooks";
import { useTwapStore } from "../store";
import { StyledColumnFlex, StyledOneLineText, StyledRowFlex, StyledText } from "../styles";
import { ChunksAmount, Deadline, DstTokenAmount, DstTokenUSD, MinDstAmountOut, OrderType, SrcTokenAmount, SrcTokenUSD, TotalChunks, TradeIntervalAsText } from "./Amounts";
import {
  OrderSummaryChunkSizeLabel,
  OrderSummaryDeadlineLabel,
  OrderSummaryMinDstAmountOutLabel,
  OrderSummaryOrderTypeLabel,
  OrderSummaryTotalChunksLabel,
  OrderSummaryTradeIntervalLabel,
} from "./Lables";
import TokenLogoAndSymbol from "./TokenLogoAndSymbol";

const orderSummaryDetailsComponent = [
  {
    label: <OrderSummaryDeadlineLabel />,
    component: <Deadline />,
  },
  {
    label: <OrderSummaryOrderTypeLabel />,
    component: <OrderType />,
  },
  {
    label: <OrderSummaryChunkSizeLabel />,
    component: (
      <>
        <TokenLogoAndSymbol isSrc={true} />
        <ChunksAmount />
      </>
    ),
  },
  {
    label: <OrderSummaryTotalChunksLabel />,
    component: <TotalChunks />,
  },
  {
    label: <OrderSummaryTradeIntervalLabel />,
    component: <TradeIntervalAsText />,
  },
  {
    label: <OrderSummaryMinDstAmountOutLabel />,
    component: (
      <>
        <TokenLogoAndSymbol isSrc={false} />
        <MinDstAmountOut />
      </>
    ),
  },
];

export const OrderSummaryDetails = ({ className = "" }: { className?: string }) => {
  return (
    <StyledSummaryDetails className={`twap-order-summary-details ${className}`}>
      {orderSummaryDetailsComponent.map((details, index) => {
        return (
          <StyledSummaryRow key={index} className="twap-order-summary-details-item">
            {details.label}
            <StyledSummaryRowRight>{details.component}</StyledSummaryRowRight>
          </StyledSummaryRow>
        );
      })}
    </StyledSummaryDetails>
  );
};

const StyledSummaryRow = styled(StyledRowFlex)({
  justifyContent: "space-between",
  width: "100%",
});

const StyledSummaryRowRight = styled(StyledRowFlex)({
  flex: 1,
  width: "unset",
  justifyContent: "flex-end",
  ".twap-token-logo": {
    width: 22,
    height: 22,
  },
});
const StyledSummaryDetails = styled(StyledColumnFlex)({});

interface Props {
  children: ReactNode;
}

export function OrderSummarySwipeContainer({ children }: Props) {
    const showConfirmation = useTwapStore((store) => store.showConfirmation);
  const setShowConfirmation = useTwapStore((store) => store.setShowConfirmation);
  return (
    <SwipeContainer show={showConfirmation} close={() => setShowConfirmation(false)}>
      {children}
    </SwipeContainer>
  );
}

const OrderSummaryTokenDisplay = ({ label, usd, logoAndSymbol, amount }: { label: string; usd: ReactElement; logoAndSymbol: ReactElement; amount: ReactElement }) => {
  return (
    <StyledOrderSummaryTokenDisplay className="twap-orders-summary-token-display">
      <StyledRowFlex className="twap-orders-summary-token-display-flex">
        <StyledText>{label}</StyledText>
        {usd}
      </StyledRowFlex>
      <StyledRowFlex className="twap-orders-summary-token-display-flex">
        {logoAndSymbol}
        {amount}
      </StyledRowFlex>
    </StyledOrderSummaryTokenDisplay>
  );
};

export const OrderSummarySrcTokenDisplay = () => {
  const translations = useTwapContext().translations;

  return <OrderSummaryTokenDisplay amount={<SrcTokenAmount />} label={translations.from} usd={<SrcTokenUSD />} logoAndSymbol={<TokenLogoAndSymbol isSrc={true} />} />;
};

export const OrderSummaryDstTokenDisplay = () => {
  const translations = useTwapContext().translations;

  return <OrderSummaryTokenDisplay amount={<DstTokenAmount />} label={translations.to} usd={<DstTokenUSD />} logoAndSymbol={<TokenLogoAndSymbol isSrc={false} />} />;
};

const StyledOrderSummaryTokenDisplay = styled(StyledColumnFlex)({
  ".twap-orders-summary-token-display-flex": {
    justifyContent: "space-between",
  },
});

export const AcceptDisclaimer = () => {
  const translations = useTwapContext().translations;

  const setDisclaimerAccepted = useTwapStore((store) => store.setDisclaimerAccepted);
  const disclaimerAccepted = useTwapStore((store) => store.disclaimerAccepted);

  return (
    <StyledRowFlex gap={5} justifyContent="flex-start" className="twap-disclaimer-switch">
      <StyledText>{translations.acceptDisclaimer}</StyledText>
      <Switch value={disclaimerAccepted} onChange={() => setDisclaimerAccepted(!disclaimerAccepted)} />
    </StyledRowFlex>
  );
};

export const OutputAddress = () => {
  const maker = useTwapStore((store) => store.lib?.maker);
  const translations = useTwapContext().translations;

  return (
    <StyledOutputAddress className="twap-order-summary-output-address">
      <StyledText style={{ textAlign: "center", width: "100%" }}>{translations.outputWillBeSentTo}</StyledText>
      <Tooltip childrenStyles={{ width: "100%" }} text={maker}>
        <StyledOneLineText style={{ textAlign: "center", width: "100%" }}>{maker}</StyledOneLineText>
      </Tooltip>
    </StyledOutputAddress>
  );
};

const StyledOutputAddress = styled(StyledColumnFlex)({});

export const OrderSummaryLimitPriceToggle = () => {
  const { isLimitOrder, toggleInverted, limitPrice, leftToken, rightToken } = useLimitPrice();
  const translations = useTwapContext().translations;

  return isLimitOrder ? (
    <TokenPriceCompare leftToken={leftToken} rightToken={rightToken} price={limitPrice} toggleInverted={toggleInverted} />
  ) : (
    <StyledText>{translations.none}</StyledText>
  );
};

export const OrderSummaryLimitPrice = () => {
  const translations = useTwapContext().translations;

  return (
    <StyledRowFlex className="twap-order-summary-limit-price" justifyContent="space-between">
      <Label tooltipText={translations.confirmationLimitPriceTooltip}>{translations.limitPrice}</Label>
      <OrderSummaryLimitPriceToggle />
    </StyledRowFlex>
  );
};
