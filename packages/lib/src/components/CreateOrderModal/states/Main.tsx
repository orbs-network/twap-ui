import { styled } from "styled-components";
import { useTwapContext } from "../../../context/context";
import { useFormatNumberV2 } from "../../../hooks/hooks";
import { useSubmitOrderButton } from "../../../hooks/useSubmitOrderButton";
import { Button, Spinner, Switch } from "../../base";
import { MarketPriceWarning, Separator } from "../../Components";
import { BottomContent, SmallTokens } from "../Components";
import { StyledColumnFlex, StyledText } from "../../../styles";
import { Steps } from "../Steps";
import { useOrderType } from "../hooks";
import { stateActions } from "../../../context/actions";
import { OrderDisplay } from "../../OrderDisplay";
import { size } from "../../../utils";
import {
  useChunks,
  useDeadline,
  useDstMinAmountOut,
  useFillDelay,
  useOutAmount,
  useSrcAmount,
  useSrcChunkAmount,
  useSwapPrice,
  useUsdAmount,
} from "../../../hooks/lib";
import { useIsMarketOrder } from "@orbs-network/twap-ui-sdk";

const Price = () => {
  const { srcToken, dstToken } = useTwapContext();
  const swapPrice = useSwapPrice();
  const isMarketOrder = useIsMarketOrder();
  const usd = useFormatNumberV2({ value: swapPrice.usd, decimalScale: 2 });
  const price = useFormatNumberV2({ value: swapPrice.price, decimalScale: 4 });
  return (
    <OrderDisplay.DetailRow title={isMarketOrder ? "Market Price" : "Limit Price"}>
      <StyledPrice>
        1 {srcToken?.symbol} = {price} {dstToken?.symbol} <span>{`($${usd})`}</span>
      </StyledPrice>
    </OrderDisplay.DetailRow>
  );
};

const StyledPrice = styled(StyledText)({
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
  const { translations: t, state } = useTwapContext();
  const handleDisclaimer = stateActions.useHandleDisclaimer();
  const { disclaimerAccepted } = state;

  return (
    <OrderDisplay.DetailRow
      className={`twap-order-modal-disclaimer ${className}`}
      title={
        <>
          {`${t.accept} `}
          <a href="https://www.orbs.com/dtwap-dlimit-disclaimer" target="_blank">
            {t.disclaimer}
          </a>
        </>
      }
    >
      <Switch checked={!!disclaimerAccepted} onChange={handleDisclaimer} />
    </OrderDisplay.DetailRow>
  );
};

export const Main = ({ onSubmit, className = "" }: { onSubmit: () => void; className?: string }) => {
  const { swapState, swapSteps } = useTwapContext().state;

  const shouldOnlyConfirm = swapState === "loading" && size(swapSteps) === 1;

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
        <StyledColumnFlex gap={15}>
          <Details />
          <AcceptDisclaimer />
          <SubmitButton onClick={onSubmit} />
        </StyledColumnFlex>
      )}
    </StyledReview>
  );
};

const Tokens = () => {
  const { srcToken, dstToken } = useTwapContext();

  const { srcUsd, dstUsd } = useUsdAmount();
  const srcAmount = useSrcAmount().amountUi;
  const outAmount = useOutAmount().amountUi;
  const fillDelayMillis = useFillDelay().millis;
  const isMarketOrder = useIsMarketOrder();
  const chunks = useChunks();

  return (
    <OrderDisplay.Tokens>
      <OrderDisplay.SrcToken token={srcToken} amount={srcAmount} usd={srcUsd} />
      <OrderDisplay.DstToken token={dstToken} amount={outAmount} usd={dstUsd} fillDelayMillis={fillDelayMillis} isMarketOrder={isMarketOrder} chunks={chunks} />
    </OrderDisplay.Tokens>
  );
};

const Details = () => {
  const chunks = useChunks();
  const { isLimitPanel, srcToken, dstToken } = useTwapContext();
  const deadline = useDeadline().millis;
  const srcChunkAmount = useSrcChunkAmount().amountUi;
  const isMarketOrder = useIsMarketOrder();
  const dstMinAmountOut = useDstMinAmountOut().amountUi;
  const fillDelayMillis = useFillDelay().millis;

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
    <Button className="twap-order-modal-submit-btn twap-submit-button" onClick={button.onClick} loading={button.loading} disabled={button.disabled}>
      {button.text}
    </Button>
  );
};

const StyledReview = styled(OrderDisplay)({});
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
