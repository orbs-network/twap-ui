import { styled } from "styled-components";
import BN from "bignumber.js";
import React, { useCallback, useMemo } from "react";
import { SwapFlow } from "@orbs-network/swap-ui";
import { Switch, Button, Message } from "../../../components/base";
import { OrderDisplay } from "../../../components/OrderDisplay";

import { useFormatNumber } from "../../../hooks/useFormatNumber";
import { useTwapContext } from "../../../context";
import { useConfirmationModalButton, useFee, useMarketPriceMessage } from "../../../hooks/ui-hooks";
import { useChunks, useDestTokenMinAmount, useFillDelay, useOrderDeadline, useSrcTokenChunkAmount, useUsdAmount } from "../../../hooks/logic-hooks";

export const MarketPriceWarning = ({ className = "" }: { className?: string }) => {
  const { translations: t } = useTwapContext();
  const marketWarning = useMarketPriceMessage();

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

const Price = () => {
  const {
    state: { isMarketOrder, trade },
    srcToken,
    dstToken,
  } = useTwapContext();

  const price = useMemo(
    () =>
      BN(trade?.dstAmount || 0)
        .dividedBy(trade?.srcAmount || 0)
        .toString(),
    [trade?.dstAmount, trade?.srcAmount],
  );

  const priceF = useFormatNumber({ value: price, decimalScale: 4 });

  return (
    <OrderDisplay.DetailRow title={isMarketOrder ? "Market Price" : "Limit Price"}>
      1 {srcToken?.symbol} = {priceF} {dstToken?.symbol}
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
  const chunks = useChunks().chunks;
  const fillDelayMillis = useFillDelay().milliseconds;
  return <OrderDisplay.FillDelaySummary chunks={chunks} fillDelayMillis={fillDelayMillis} />;
};

export const Main = () => {
  const {
    translations,
    components,
    state: { trade, swapStatus },
    srcUsd1Token,
    dstUsd1Token,
  } = useTwapContext();
  const srcAmountUsd = useUsdAmount(trade?.srcAmount, srcUsd1Token);
  const dstAmountUsd = useUsdAmount(trade?.dstAmount, dstUsd1Token);

  const inUsd = useFormatNumber({ value: srcAmountUsd, decimalScale: 2 });
  const outUsd = useFormatNumber({ value: dstAmountUsd, decimalScale: 2 });

  return (
    <>
      <SwapFlow.Main
        fromTitle={translations.from}
        toTitle={translations.to}
        inUsd={components.USD ? <components.USD value={srcAmountUsd} isLoading={false} /> : `$${inUsd}`}
        outUsd={components.USD ? <components.USD value={dstAmountUsd} isLoading={false} /> : `$${outUsd}`}
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

  const fee = useFee();
  const srcChunkAmount = useSrcTokenChunkAmount().amountUI;
  const deadline = useOrderDeadline();
  const dstMinAmountOut = useDestTokenMinAmount().amountUI;
  const fillDelayMillis = useFillDelay().milliseconds;
  const chunks = useChunks().chunks;
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
