import { styled } from "@mui/material";
import { useState, useCallback, useMemo } from "react";
import { useTwapContext } from "../../../context/context";
import {
  useChunks,
  useDeadline,
  useDstAmountUsdUi,
  useDstMinAmountOutUi,
  useDstUsd,
  useFillDelayMillis,
  useFormatNumberV2,
  useInvertedPrice,
  useIsMarketOrder,
  useOutAmount,
  useSrcAmount,
  useSrcAmountUsdUi,
  useSrcChunkAmountUi,
  useSrcUsd,
  useSubmitOrderButton,
} from "../../../hooks";
import { Button, Spinner, Switch } from "../../base";
import { MarketPriceWarning, Separator } from "../../Components";
import { useOrderSummaryContext } from "../../OrderSummary/context";
import { OrderSummary } from "../../OrderSummary/OrderSummary";
import { BottomContent, SmallTokens } from "../Components";
import BN from "bignumber.js";
import { StyledColumnFlex, StyledText } from "../../../styles";
import { Steps } from "../Steps";
import _ from "lodash";
import { useOrderType } from "../hooks";
import { stateActions } from "../../../context/actions";

const Price = () => {
  const { srcAmount, outAmount, isMarketOrder, srcToken, dstToken } = useOrderSummaryContext();
  const srcUsd = useSrcUsd().value;
  const dstUsd = useDstUsd().value;
  const [inverted, setInverted] = useState(false);

  const toggle = useCallback(() => {
    setInverted((prev) => !prev);
  }, []);

  const amount = useMemo(() => {
    if (!outAmount || !srcAmount) return "0";
    return BN(outAmount).dividedBy(srcAmount).toString();
  }, [srcAmount, outAmount]);

  const invertedAmount = useInvertedPrice(amount, inverted);
  const price = useFormatNumberV2({ value: invertedAmount, decimalScale: 2 });

  const leftToken = inverted ? dstToken : srcToken;
  const rightToken = inverted ? srcToken : dstToken;

  const usdAmount = useMemo(() => {
    if (!dstUsd || !srcUsd) return "0";
    return BN(!inverted ? dstUsd : srcUsd)
      .multipliedBy(invertedAmount)
      .toString();
  }, [invertedAmount, srcUsd, dstUsd]);

  const usd = useFormatNumberV2({ value: usdAmount, decimalScale: 2 });
  const title = isMarketOrder ? "Market Price" : "Limit Price";
  return (
    <OrderSummary.Details.DetailRow title={title}>
      <StyledPrice onClick={toggle}>
        1 {leftToken?.symbol} = {price} {rightToken?.symbol} <span>{`($${usd})`}</span>
      </StyledPrice>
    </OrderSummary.Details.DetailRow>
  );
};

const StyledPrice = styled(StyledText)({
  cursor: "pointer",
  fontSize: 13,
  span: {
    opacity: 0.6,
    fontSize: 12,
  },
});

const StyledWarning = styled(MarketPriceWarning)({
  justifyContent: "flex-start",
  background: "rgb(27, 27, 27)",
  padding: 8,
  borderRadius: 12,

  ".twap-warning-message": {
    gap: 5,
    fontSize: 14,
  },
  ".twap-warning-message-icon": {
    width: 15,
    height: 15,
  },
});

const MarketWarning = () => {
  const isMarketOrder = useOrderSummaryContext().isMarketOrder;

  if (!isMarketOrder) return null;

  return <StyledWarning className="twap-order-modal-market-warning" />;
};

export const AcceptDisclaimer = ({ className }: { className?: string }) => {
  const { translations: t, uiPreferences, state } = useTwapContext();
  const handleDisclaimer = stateActions.useHandleDisclaimer();
  const { disclaimerAccepted } = state;

  return (
    <OrderSummary.Details.DetailRow
      className={`twap-order-modal-disclaimer ${className}`}
      title={
        <>
          {`${t.accept} `}
          <a href="/" target="_blank">
            {t.disclaimer}
          </a>
        </>
      }
    >
      <Switch variant={uiPreferences.switchVariant} value={disclaimerAccepted} onChange={handleDisclaimer} />
    </OrderSummary.Details.DetailRow>
  );
};

export const Main = ({ onSubmit, className = "" }: { onSubmit: () => void; className?: string }) => {
  const { swapState, swapSteps } = useTwapContext().state;

  if (swapState === "loading" && _.size(swapSteps) === 1) {
    return <ConfirmOrder />;
  }
  return (
    <>
      <ReviewOrder className={className} />
      {swapState === "loading" ? (
        <>
          <StyledSwapPendingBorder />
          <Steps />
        </>
      ) : (
        <SubmitButton onClick={onSubmit} />
      )}
    </>
  );
};

function ReviewOrder({ className = "" }: { className?: string }) {
  const chunks = useChunks();
  const srcAmount = useSrcAmount().srcAmountUi;
  const { dappProps, state } = useTwapContext();
  const { isLimitPanel } = dappProps;
  const { srcToken, dstToken } = state;
  const srcUsd = useSrcAmountUsdUi();
  const dstUsd = useDstAmountUsdUi();
  const outAmount = useOutAmount().outAmountUi;
  const deadline = useDeadline();
  const srcChunkAmount = useSrcChunkAmountUi();
  const isMarketOrder = useIsMarketOrder();
  const dstMinAmountOut = useDstMinAmountOutUi();
  const fillDelayMillis = useFillDelayMillis();

  return (
    <StyledReview
      className={className}
      deadline={deadline}
      srcAmount={srcAmount}
      outAmount={outAmount}
      srcUsd={srcUsd}
      dstUsd={dstUsd}
      chunks={chunks}
      srcChunkAmount={srcChunkAmount}
      srcToken={srcToken}
      dstToken={dstToken}
      isMarketOrder={isMarketOrder}
      dstMinAmountOut={dstMinAmountOut}
      fillDelayMillis={fillDelayMillis}
    >
      <OrderSummary.Tokens />
      <Separator />
      <OrderSummary.Details>
        <Price />
        {isLimitPanel ? <LimitPanelDetails /> : <TwapPanelDetails />}
      </OrderSummary.Details>
      <Separator />
      <AcceptDisclaimer />
    </StyledReview>
  );
}

export const SubmitButton = ({ onClick }: { onClick: () => void }) => {
  const button = useSubmitOrderButton(onClick);

  return (
    <StyledButton onClick={button.onClick} loading={button.loading} disabled={button.disabled}>
      {button.text}
    </StyledButton>
  );
};

const StyledButton = styled(Button)({
  marginTop: 20,
});

const TwapPanelDetails = () => {
  return (
    <>
      <OrderSummary.Details.Expiry />
      <MarketWarning />
      <OrderSummary.Details.ChunkSize />
      <OrderSummary.Details.ChunksAmount />
      <OrderSummary.Details.MinDestAmount />
      <OrderSummary.Details.TradeInterval />
      <OrderSummary.Details.Recipient />
    </>
  );
};

const LimitPanelDetails = () => {
  return (
    <>
      <OrderSummary.Details.Expiry />
      <OrderSummary.Details.Recipient />
    </>
  );
};

const StyledReview = styled(OrderSummary)({});
const StyledSwapPendingBorder = styled(Separator)({
  margin: "20px 0px",
});

export function ConfirmOrder() {
  return (
    <StyledContainer className="twap-create-order-confirm">
      <Spinner size={55} />
      <Title />
      <SmallTokens />
      <BottomContent text="Proceed in your wallet" />
    </StyledContainer>
  );
}

const Title = () => {
  const type = useOrderType();
  return <StyledText className="twap-order-modal-confirm-title">Confirm {type} order</StyledText>;
};

const StyledContainer = styled(StyledColumnFlex)({
  gap: 15,
  alignItems: "center",
  ".twap-order-modal-confirm-title": {
    fontSize: 16,
  },
  ".twap-order-modal-confirm-bottom": {
    marginTop: 30,
    color: "rgb(155, 155, 155)",
    fontSize: 14,
  },
});
