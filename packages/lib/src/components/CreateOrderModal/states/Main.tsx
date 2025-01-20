import { styled } from "styled-components";
import { useAmountUi, useFormatNumberV2 } from "../../../hooks/hooks";
import { Button, Spinner, Switch } from "../../base";
import { MarketPriceWarning, Separator } from "../../Components";
import { StyledColumnFlex, StyledText } from "../../../styles";
import { OrderDisplay } from "../../OrderDisplay";
import BN from "bignumber.js";
import { useChunks, useDeadline, useDstMinAmountOut, useFillDelay, useOutAmount, useSrcChunkAmount, useSwapPrice, useToggleDisclaimer } from "../../../hooks/lib";
import React, { useMemo } from "react";
import { useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";
import { useTwapContext } from "../../../context/context";
import { SwapFlow, SwapStep } from "@orbs-network/swap-ui";
import { useSubmitOrderButton } from "../../../hooks/useSubmitOrderButton";
import { fillDelayText } from "@orbs-network/twap-sdk";
import { SwapSteps } from "../../../types";

const Price = () => {
  const {
    parsedSrcToken: srcToken,
    parsedDstToken: dstToken,
    derivedValues: { isMarketOrder },
  } = useTwapContextUI();
  const swapPrice = useSwapPrice();
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
  const {
    translations: t,
    state: { disclaimerAccepted },
  } = useTwapContext();
  const onChange = useToggleDisclaimer();

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
      <Switch checked={Boolean(disclaimerAccepted)} onChange={onChange} />
    </OrderDisplay.DetailRow>
  );
};

const useSteps = () => {
  const {
    state: { swapSteps },
  } = useTwapContext();
  const { parsedSrcToken } = useTwapContextUI();
  return useMemo((): SwapStep[] => {
    if (!swapSteps || !parsedSrcToken) return [];

    return swapSteps.map((step) => {
      if (step === SwapSteps.WRAP) {
        return {
          id: SwapSteps.WRAP,
          title: `Wrap ${parsedSrcToken.symbol}`,
          description: `Wrap ${parsedSrcToken.symbol}`,
          image: parsedSrcToken.logoUrl,
        };
      }
      if (step === SwapSteps.APPROVE) {
        return {
          id: SwapSteps.APPROVE,
          title: `Approve ${parsedSrcToken.symbol}`,
          description: `Approve ${parsedSrcToken.symbol}`,
          image: parsedSrcToken.logoUrl,
        };
      }
      return {
        id: SwapSteps.CREATE,
        title: `Create order`,
        image: parsedSrcToken?.logoUrl,
      };
    });
  }, [parsedSrcToken, swapSteps]);
};

export const Main = ({ onSubmit }: { onSubmit: () => void }) => {
  const {
    state: { swapStatus, swapStep, swapData },
    translations: t,
  } = useTwapContext();
  const {
    isLimitPanel,
    derivedValues: { isMarketOrder },
  } = useTwapContextUI();
  const steps = useSteps();

  const inUsd = useFormatNumberV2({ value: swapData.srcAmountusd, decimalScale: 2 });
  const outUsd = useFormatNumberV2({ value: swapData.outAmountusd, decimalScale: 2 });

  return (
    <>
      <SwapFlow.Main
        fromTitle={isLimitPanel ? "From" : "Allocate"}
        toTitle={!isMarketOrder ? "To" : "Buy"}
        steps={steps}
        inUsd={`$${inUsd}`}
        outUsd={`$${outUsd}`}
        currentStep={swapStep}
        showSingleStep={true}
        bottomContent={<ChunksText />}
      />
      {!swapStatus && (
        <StyledColumnFlex gap={15}>
          <Details />
          <AcceptDisclaimer />
          <SubmitButton onClick={onSubmit} />
        </StyledColumnFlex>
      )}
    </>
  );
};

const ChunksText = () => {
  const {
    derivedValues: { chunks, fillDelay },
  } = useTwapContextUI();
  if (chunks <= 1) return null;

  return (
    <StyledChunksText className="twap-small-text">
      Every {fillDelayText(fillDelay.unit * fillDelay.value).toLowerCase()} Over {chunks} Orders
    </StyledChunksText>
  );
};

const StyledChunksText = styled(StyledText)({
  marginTop: 10,
  fontSize: 14,
});

const Details = () => {
  const chunks = useChunks();
  const {
    parsedSrcToken: srcToken,
    parsedDstToken: dstToken,
    derivedValues: { isMarketOrder },
    isLimitPanel,
  } = useTwapContextUI();

  const deadline = useDeadline().millis;
  const srcChunkAmount = useSrcChunkAmount().amountUi;
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
            <Fee />
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
            <Fee />
          </>
        )}
      </OrderDisplay.DetailsContainer>
    </>
  );
};

const Fee = () => {
  const { fee } = useTwapContext();
  const {
    parsedDstToken: dstToken,
    derivedValues: { isMarketOrder },
  } = useTwapContextUI();

  const outAmount = useOutAmount().amount;

  const amount = useMemo(() => {
    if (!fee || !outAmount || isMarketOrder) return "";
    return BN(outAmount).multipliedBy(fee).dividedBy(100).toFixed().toString();
  }, [fee, outAmount, isMarketOrder]);

  const amountUi = useFormatNumberV2({ value: useAmountUi(dstToken?.decimals, amount) });

  if (!fee) return null;
  return <OrderDisplay.DetailRow title={`Fee (${fee}%)`}>{amountUi ? `${amountUi} ${dstToken?.symbol}` : ""}</OrderDisplay.DetailRow>;
};

export const SubmitButton = ({ onClick }: { onClick: () => void }) => {
  const button = useSubmitOrderButton(onClick);

  return (
    <Button className="twap-order-modal-submit-btn twap-submit-button" onClick={button.onClick ? button.onClick : () => null} loading={button.loading} disabled={button.disabled}>
      {button.text}
    </Button>
  );
};
