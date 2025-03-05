import { styled } from "styled-components";
import BN from "bignumber.js";
import React, { useCallback, useMemo } from "react";
import { SwapFlow, SwapStep } from "@orbs-network/swap-ui";
import { fillDelayText, isNativeAddress } from "@orbs-network/twap-sdk";
import { Switch, Button, Message } from "../../../components/base";
import { OrderDisplay } from "../../../components/OrderDisplay";
import { StyledText } from "../../../styles";
import { SwapSteps } from "../../../types";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import { IoIosCheckmarkCircleOutline } from "@react-icons/all-files/io/IoIosCheckmarkCircleOutline";
import { useFormatNumber } from "../../../hooks/useFormatNumber";
import { useTwapContext } from "../../../context";
import { useConfirmationModalButton, useConfirmationModalPanel } from "../../../hooks/ui-hooks";
import { useNetwork } from "../../../hooks/logic-hooks";

export const MarketPriceWarning = ({ className = "" }: { className?: string }) => {
  const { translations: t } = useTwapContext();
  const { marketWarning } = useConfirmationModalPanel();

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

const useSteps = () => {
  const { orderName, srcToken, swapSteps } = useConfirmationModalPanel();
  const wTokenSymbol = useNetwork()?.wToken.symbol;

  const isNativeIn = isNativeAddress(srcToken?.address || "");
  return useMemo((): SwapStep[] => {
    if (!swapSteps || !srcToken) return [];

    return swapSteps.map((step) => {
      if (step === SwapSteps.WRAP) {
        return {
          id: SwapSteps.WRAP,
          title: `Wrap ${srcToken.symbol}`,
          image: srcToken.logoUrl,
        };
      }
      if (step === SwapSteps.APPROVE) {
        return {
          id: SwapSteps.APPROVE,
          title: `Approve ${isNativeIn ? wTokenSymbol : srcToken.symbol}`,
          icon: <IoIosCheckmarkCircleOutline style={{ width: 20, height: 20 }} />,
        };
      }
      return {
        id: SwapSteps.CREATE,
        title: `Create ${orderName} order`,
        icon: <RiArrowUpDownLine style={{ width: 20, height: 20 }} />,
      };
    });
  }, [srcToken, swapSteps, wTokenSymbol, orderName, isNativeIn]);
};

export const Main = () => {
  const { translations, components } = useTwapContext();
  const steps = useSteps();
  const { swapStatus, swapStep, srcAmountusd, dstAmountusd } = useConfirmationModalPanel();

  const inUsd = useFormatNumber({ value: srcAmountusd, decimalScale: 2 });
  const outUsd = useFormatNumber({ value: dstAmountusd, decimalScale: 2 });

  return (
    <>
      <SwapFlow.Main
        fromTitle={translations.from}
        toTitle={translations.to}
        steps={steps}
        inUsd={components.USD ? <components.USD value={srcAmountusd || ""} isLoading={false} /> : `$${inUsd}`}
        outUsd={components.USD ? <components.USD value={dstAmountusd || ""} isLoading={false} /> : `$${outUsd}`}
        currentStep={swapStep}
        showSingleStep={true}
        bottomContent={<ChunksText />}
      />
      {!swapStatus && (
        <div className="twap-order-modal-bottom">
          <Details />
          <AcceptDisclaimer />
          <SubmitButton />
        </div>
      )}
    </>
  );
};

const ChunksText = () => {
  const { orderDetails } = useConfirmationModalPanel();

  if (orderDetails.chunks <= 1) return null;

  return (
    <StyledChunksText className="twap-small-text">
      Every {fillDelayText(orderDetails.fillDelayMillis).toLowerCase()} Over {orderDetails.chunks} Orders
    </StyledChunksText>
  );
};

const StyledChunksText = styled(StyledText)({
  marginTop: 10,
  fontSize: 14,
});

const Details = () => {
  const {
    isLimitPanel,
    srcToken,
    dstToken,
    state: { isMarketOrder },
  } = useTwapContext();

  const { fillDelayMillis, dstMinAmountOut, deadline, chunks, srcChunkAmount, fee } = useConfirmationModalPanel().orderDetails;
  const feeAmountF = useFormatNumber({ value: fee.amount, decimalScale: 2 });
  return (
    <OrderDisplay.DetailsContainer>
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
      {fee && <OrderDisplay.DetailRow title={`Fee (${fee.percent}%)`}>{feeAmountF ? `${feeAmountF} ${dstToken?.symbol}` : ""}</OrderDisplay.DetailRow>}
    </OrderDisplay.DetailsContainer>
  );
};

export const SubmitButton = () => {
  const { text, onSubmit, isLoading, disabled } = useConfirmationModalButton();

  return (
    <Button className="twap-order-modal-submit-btn twap-submit-button" onClick={onSubmit} loading={isLoading} disabled={disabled}>
      {text}
    </Button>
  );
};
