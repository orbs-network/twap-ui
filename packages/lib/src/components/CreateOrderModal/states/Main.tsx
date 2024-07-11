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
} from "../../../hooks/hooks";
import { useSubmitOrderButton } from "../../../hooks/useSubmitOrderButton";
import { Button, Spinner, Switch } from "../../base";
import { MarketPriceWarning, Separator } from "../../Components";
import { BottomContent, SmallTokens } from "../Components";
import BN from "bignumber.js";
import { StyledColumnFlex, StyledText } from "../../../styles";
import { Steps } from "../Steps";
import _ from "lodash";
import { useOrderType } from "../hooks";
import { stateActions } from "../../../context/actions";
import { OrderDisplay } from "../../OrderDisplay";

const Price = () => {
  const srcUsd = useSrcUsd().value;
  const dstUsd = useDstUsd().value;
  const [inverted, setInverted] = useState(false);
  const srcAmount = useSrcAmount().srcAmountUi;
  const { state } = useTwapContext();
  const { srcToken, dstToken } = state;
  const outAmount = useOutAmount().outAmountUi;

  const isMarketOrder = useIsMarketOrder();

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
    <OrderDisplay.DetailRow title={title}>
      <StyledPrice onClick={toggle}>
        1 {leftToken?.symbol} = {price} {rightToken?.symbol} <span>{`($${usd})`}</span>
      </StyledPrice>
    </OrderDisplay.DetailRow>
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
    top: 3,
    position: "relative",
  },
});

const MarketWarning = ({ isMarketOrder }: { isMarketOrder?: boolean }) => {
  if (!isMarketOrder) return null;

  return <StyledWarning className="twap-order-modal-market-warning" />;
};

export const AcceptDisclaimer = ({ className }: { className?: string }) => {
  const { translations: t, uiPreferences, state } = useTwapContext();
  const handleDisclaimer = stateActions.useHandleDisclaimer();
  const { disclaimerAccepted } = state;

  return (
    <OrderDisplay.DetailRow
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
    </OrderDisplay.DetailRow>
  );
};

export const Main = ({ onSubmit, className = "" }: { onSubmit: () => void; className?: string }) => {
  const { swapState, swapSteps } = useTwapContext().state;

  const shouldOnlyConfirm = swapState === "loading" && _.size(swapSteps) === 1;

  if (shouldOnlyConfirm) {
    return <ConfirmOrder />;
  }

  return (
    <StyledReview className={className}>
      <Tokens />
      {swapState === "loading" ? (
        <>
          <StyledSwapPendingBorder />
          <Steps />
        </>
      ) : (
        <>
          <Details />
          <AcceptDisclaimer />
          <SubmitButton onClick={onSubmit} />
        </>
      )}
    </StyledReview>
  );
};

const Tokens = () => {
  const { state } = useTwapContext();

  const { srcToken, dstToken } = state;
  const srcUsd = useSrcAmountUsdUi();
  const dstUsd = useDstAmountUsdUi();
  const srcAmount = useSrcAmount().srcAmountUi;
  const outAmount = useOutAmount().outAmountUi;

  return (
    <OrderDisplay.Tokens>
      <OrderDisplay.SrcToken token={srcToken} amount={srcAmount} usd={srcUsd} />
      <OrderDisplay.SrcToken token={dstToken} amount={outAmount} usd={dstUsd} />
    </OrderDisplay.Tokens>
  );
};

const Details = () => {
  const chunks = useChunks();
  const { dappProps, state } = useTwapContext();
  const { isLimitPanel } = dappProps;
  const { srcToken, dstToken } = state;
  const deadline = useDeadline().millis;
  const srcChunkAmount = useSrcChunkAmountUi();
  const isMarketOrder = useIsMarketOrder();
  const dstMinAmountOut = useDstMinAmountOutUi();
  const fillDelayMillis = useFillDelayMillis();

  return (
    <>
      <Separator />
      <OrderDisplay.DetailsContainer>
        <Price />
        {isLimitPanel ? (
          <>
            <OrderDisplay.Expiry deadline={deadline} />
            <OrderDisplay.Recipient />
          </>
        ) : (
          <>
            <MarketWarning isMarketOrder={isMarketOrder} />
            <OrderDisplay.Expiry deadline={deadline} />
            <OrderDisplay.ChunkSize srcChunkAmount={srcChunkAmount} srcToken={srcToken} />
            <OrderDisplay.ChunksAmount chunks={chunks} />
            <OrderDisplay.MinDestAmount dstToken={dstToken} isMarketOrder={isMarketOrder} dstMinAmountOut={dstMinAmountOut} />
            <OrderDisplay.TradeInterval fillDelayMillis={fillDelayMillis} />
            <OrderDisplay.Recipient />
          </>
        )}
      </OrderDisplay.DetailsContainer>
    </>
  );
};

export const SubmitButton = ({ onClick }: { onClick: () => void }) => {
  const button = useSubmitOrderButton(onClick);

  return (
    <Button className="twap-order-modal-submit-btn" onClick={button.onClick} loading={button.loading} disabled={button.disabled}>
      {button.text}
    </Button>
  );
};

const StyledReview = styled(OrderDisplay)({
  ".twap-order-modal-disclaimer": { marginTop: 20 },
  ".twap-order-modal-submit-btn": { marginTop: 20 },
});
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
