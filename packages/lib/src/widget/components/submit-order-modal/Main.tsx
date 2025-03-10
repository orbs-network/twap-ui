import { styled } from "styled-components";
import BN from "bignumber.js";
import React, { useCallback, useMemo } from "react";
import { SwapFlow } from "@orbs-network/swap-ui";
import { Switch, Button, Message } from "../../../components/base";
import { OrderDisplay } from "../../../components/OrderDisplay";

import { useFormatNumber } from "../../../hooks/useFormatNumber";
import { useTwapContext } from "../../../context";
import { useConfirmationModal, useConfirmationModalButton, useConfirmationModalOrderDetails } from "../../../hooks/ui-hooks";

export const MarketPriceWarning = ({ className = "" }: { className?: string }) => {
  const { translations: t } = useTwapContext();
  const { marketWarning } = useConfirmationModalOrderDetails();

  if (!marketWarning) return null;

  return (
    <Message
      className={`twap-market-price-warning ${className}`}
      title={
        <>
          {`${marketWarning.text} `}
          <a href={marketWarning.url} target="_blank">{`${t.learnMore}`}</a>
        </>
      }
      variant="warning"
    />
  );
};

export const useSwapPrice = () => {
  const {
    state: { swapData },
  } = useTwapContext();

  const price = useMemo(
    () =>
      BN(swapData?.dstAmount || 0)
        .dividedBy(swapData?.srcAmount || 0)
        .toString(),
    [swapData?.dstAmount, swapData?.srcAmount],
  );

  const srcUsd1Token = useMemo(() => {
    if (!swapData?.srcAmountusd || !swapData?.srcAmount) return;
    return BN(swapData?.srcAmountusd).dividedBy(swapData?.srcAmount).toString();
  }, [swapData?.srcAmountusd, swapData?.srcAmount]);

  const dstUsd1Token = useMemo(() => {
    if (!swapData?.dstAmountusd || !swapData?.dstAmount) return;
    return BN(swapData?.dstAmountusd).dividedBy(swapData?.dstAmount).toString();
  }, [swapData?.dstAmountusd, swapData?.dstAmount]);

  const usd = useMemo(() => {
    if (!dstUsd1Token || !srcUsd1Token) return "0";
    return BN(dstUsd1Token).multipliedBy(price).toString();
  }, [price, srcUsd1Token, dstUsd1Token]);

  return {
    price,
    usd,
  };
};

const Price = () => {
  const {
    state: { isMarketOrder },
    srcToken,
    dstToken,
  } = useTwapContext();

  const swapPrice = useSwapPrice();
  const price = useFormatNumber({ value: swapPrice.price, decimalScale: 4 });

  return (
    <OrderDisplay.DetailRow title={isMarketOrder ? "Market Price" : "Limit Price"}>
      1 {srcToken?.symbol} = {price} {dstToken?.symbol}
    </OrderDisplay.DetailRow>
  );
};

export const AcceptDisclaimer = ({ className }: { className?: string }) => {
  const {
    translations: t,
    state: { disclaimerAccepted },
    updateState,
  } = useTwapContext();

  const onChange = useCallback(() => {
    updateState({ disclaimerAccepted: !disclaimerAccepted });
  }, [disclaimerAccepted, updateState]);

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

const FillDelaySummary = () => {
  const { chunks, fillDelayMillis } = useConfirmationModalOrderDetails();
  return <OrderDisplay.FillDelaySummary chunks={chunks} fillDelayMillis={fillDelayMillis} />;
};

export const Main = () => {
  const { translations, components } = useTwapContext();
  const { srcAmountusd, dstAmountusd } = useConfirmationModalOrderDetails();
  const { swapStatus } = useConfirmationModal();

  const inUsd = useFormatNumber({ value: srcAmountusd, decimalScale: 2 });
  const outUsd = useFormatNumber({ value: dstAmountusd, decimalScale: 2 });

  return (
    <>
      <SwapFlow.Main
        fromTitle={translations.from}
        toTitle={translations.to}
        inUsd={components.USD ? <components.USD value={srcAmountusd || ""} isLoading={false} /> : `$${inUsd}`}
        outUsd={components.USD ? <components.USD value={dstAmountusd || ""} isLoading={false} /> : `$${outUsd}`}
      />
      {!swapStatus && (
        <StyledBottom className="twap-create-order-bottom">
          <FillDelaySummary />
          <Details />
          <AcceptDisclaimer />
          <SubmitButton />
        </StyledBottom>
      )}
    </>
  );
};

const StyledBottom = styled("div")({
  width: "100%",
});

const Details = () => {
  const {
    isLimitPanel,
    srcToken,
    dstToken,
    state: { isMarketOrder },
  } = useTwapContext();

  const { fillDelayMillis, dstMinAmountOut, deadline, chunks, srcChunkAmount, fee } = useConfirmationModalOrderDetails();
  const feeAmountF = useFormatNumber({ value: fee.amountUI, decimalScale: 2 });
  return (
    <div className="twap-create-order-details">
      <Price />
      {isLimitPanel ? (
        <>
          <OrderDisplay.Expiry deadline={deadline} />
          <OrderDisplay.Recipient />
        </>
      ) : (
        <>
          <MarketPriceWarning />
          <OrderDisplay.Expiry deadline={deadline} />
          <OrderDisplay.ChunkSize srcChunkAmount={srcChunkAmount} chunks={chunks} srcToken={srcToken} />
          <OrderDisplay.ChunksAmount chunks={chunks} />
          <OrderDisplay.MinDestAmount totalChunks={chunks} dstToken={dstToken} isMarketOrder={isMarketOrder} dstMinAmountOut={dstMinAmountOut} />
          <OrderDisplay.TradeInterval chunks={chunks} fillDelayMillis={fillDelayMillis} />
          <OrderDisplay.Recipient />
        </>
      )}
      {fee.percent && <OrderDisplay.DetailRow title={`Fee (${fee.percent}%)`}>{feeAmountF ? `${feeAmountF} ${dstToken?.symbol}` : ""}</OrderDisplay.DetailRow>}
    </div>
  );
};

export const SubmitButton = () => {
  const { text, onSubmit, isLoading, disabled } = useConfirmationModalButton();

  return (
    <Button className="twap-create-order-submit-btn twap-submit-button" onClick={onSubmit} loading={isLoading} disabled={disabled}>
      {text}
    </Button>
  );
};
