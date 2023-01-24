import { styled } from "@mui/system";
import React, { ReactNode } from "react";
import { Label, Switch, TokenPriceCompare, Tooltip } from "../components";
import SwipeContainer from "../components/SwipeContainer";
import { useTwapContext } from "../context";
import { useLimitPrice } from "../hooks";
import { useTwapStore } from "../store";
import { StyledColumnFlex, StyledOneLineText, StyledOverflowContainer, StyledRowFlex, StyledText } from "../styles";
import {
  OrderSummaryChunkSizeLabel,
  OrderSummaryDeadlineLabel,
  OrderSummaryMinDstAmountOutLabel,
  OrderSummaryOrderTypeLabel,
  OrderSummaryTotalChunksLabel,
  OrderSummaryTradeIntervalLabel,
} from "./Lables";
import {
  Deadline,
  OrderType,
  ChunksAmount,
  TotalChunks,
  TradeIntervalAsText,
  MinDstAmountOut,
  SrcTokenAmount,
  SrcTokenUSD,
  DstTokenAmount,
  DstTokenUSD,
  TokenLogoAndSymbol,
} from "./StateComponents";

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
        <TokenLogoAndSymbol isSrc={true} reverse={true} />
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
        <TokenLogoAndSymbol isSrc={false} reverse={true} />
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
  ".twap-label": {
    minWidth: 150,
    flex: 1,
  },
});

const StyledSummaryRowRight = styled(StyledOverflowContainer)({
  flex: 1,
  width: "unset",
  justifyContent: "flex-end",
  ".twap-token-logo": {
    width: 22,
    height: 22,
    minWidth: 22,
    minHeight: 22,
  },
});
const StyledSummaryDetails = styled(StyledColumnFlex)({
  gap: 15,
});

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

export const OrderSummaryTokenDisplay = ({ isSrc }: { isSrc?: boolean }) => {
  const translations = useTwapContext().translations;
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  return (
    <StyledOrderSummaryTokenDisplay className="twap-orders-summary-token-display">
      <StyledRowFlex className="twap-orders-summary-token-display-flex">
        <StyledText>{isSrc ? translations.from : translations.to}</StyledText>
        {isSrc ? <SrcTokenUSD /> : <DstTokenUSD />}
      </StyledRowFlex>
      <StyledRowFlex className="twap-orders-summary-token-display-flex">
        <TokenLogoAndSymbol isSrc={isSrc} />
        <StyledRowFlex className="twap-orders-summary-token-display-amount">
          {!isSrc && <StyledText> {isLimitOrder ? "≥ " : "~ "}</StyledText>}
          {isSrc ? <SrcTokenAmount /> : <DstTokenAmount />}
        </StyledRowFlex>
      </StyledRowFlex>
    </StyledOrderSummaryTokenDisplay>
  );
};

const StyledOrderSummaryTokenDisplay = styled(StyledColumnFlex)({
  ".twap-token-logo": {
    width: 38,
    height: 38,
  },
  ".twap-token-name": {
    fontSize: 16,
  },
  ".twap-orders-summary-token-display-amount": {
    fontSize: 19,
    justifyContent: "flex-end",
    width: "fit-content",
  },
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

export const DisclaimerText = () => {
  const translations = useTwapContext().translations;
  const lib = useTwapStore((state) => state.lib);
  return (
    <StyledTradeInfoExplanation className="twap-disclaimer-text">
      <StyledText>{translations.disclaimer1}</StyledText>
      <StyledText>{translations.disclaimer2}</StyledText>
      <StyledText>{translations.disclaimer3}</StyledText>
      <StyledText>{translations.disclaimer4}</StyledText>
      <StyledText>{translations.disclaimer5.replace("{{dex}}", lib?.config.partner || "DEX")}</StyledText>

      <StyledText>
        {translations.disclaimer6}{" "}
        <a href="https://github.com/orbs-network/twap" target="_blank">
          {translations.link}
        </a>
        . {translations.disclaimer7}{" "}
        <a href="https://github.com/orbs-network/twap/blob/master/TOS.md" target="_blank">
          {translations.link}
        </a>
        .
      </StyledText>
    </StyledTradeInfoExplanation>
  );
};

const StyledTradeInfoExplanation = styled(StyledColumnFlex)({
  maxHeight: 140,
  overflow: "auto",
  gap: 10,
  fontSize: 14,
});
