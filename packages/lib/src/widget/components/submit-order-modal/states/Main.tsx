import { styled } from "styled-components";
import { useAmountUi, useFormatNumber } from "../../../../hooks/hooks";
import { Button, Switch } from "../../../../components/base";
import { MarketPriceWarning, Separator } from "../../../../components/Components";
import { StyledColumnFlex, StyledText } from "../../../../styles";
import { OrderDisplay } from "../../../../components/OrderDisplay";
import BN from "bignumber.js";
import { useDstMinAmountOut, useSwapPrice, useToggleDisclaimer } from "../../../../hooks/lib";
import React, { useMemo } from "react";
import { useWidgetContext } from "../../../../context/context";
import { SwapFlow, SwapStep } from "@orbs-network/swap-ui";
import { useSubmitOrderButton } from "../../../../hooks/useSubmitOrderButton";
import { fillDelayText } from "@orbs-network/twap-sdk";
import { SwapSteps } from "../../../../types";

const Price = () => {
  const { srcToken, dstToken, twap } = useWidgetContext();
  const {
    values: { isMarketOrder },
  } = twap;
  const swapPrice = useSwapPrice();
  const usd = useFormatNumber({ value: swapPrice.usd, decimalScale: 2 });
  const price = useFormatNumber({ value: swapPrice.price, decimalScale: 4 });
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
  } = useWidgetContext();
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
    srcToken,
  } = useWidgetContext();

  return useMemo((): SwapStep[] => {
    if (!swapSteps || !srcToken) return [];

    return swapSteps.map((step) => {
      if (step === SwapSteps.WRAP) {
        return {
          id: SwapSteps.WRAP,
          title: `Wrap ${srcToken.symbol}`,
          description: `Wrap ${srcToken.symbol}`,
          image: srcToken.logoUrl,
        };
      }
      if (step === SwapSteps.APPROVE) {
        return {
          id: SwapSteps.APPROVE,
          title: `Approve ${srcToken.symbol}`,
          description: `Approve ${srcToken.symbol}`,
          image: srcToken.logoUrl,
        };
      }
      return {
        id: SwapSteps.CREATE,
        title: `Create order`,
        image: srcToken?.logoUrl,
      };
    });
  }, [srcToken, swapSteps]);
};

export const Main = ({ onSubmit }: { onSubmit: () => void }) => {
  const {
    state: { swapStatus, swapStep, swapData },
    twap,
    isLimitPanel,
  } = useWidgetContext();
  const {
    values: { isMarketOrder },
  } = twap;
  const steps = useSteps();

  const inUsd = useFormatNumber({ value: swapData.srcAmountusd, decimalScale: 2 });
  const outUsd = useFormatNumber({ value: swapData.outAmountusd, decimalScale: 2 });

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
    values: { chunks, fillDelay },
  } = useWidgetContext().twap;
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
  const { twap, srcToken, dstToken, isLimitPanel } = useWidgetContext();
  const {
    values: { isMarketOrder, deadline, fillDelayMilliseconds, chunks, srcChunksAmountUI, destTokenMinAmountOutUI },
  } = twap;

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
            <OrderDisplay.ChunkSize srcChunkAmount={srcChunksAmountUI} srcToken={srcToken} />
            <OrderDisplay.ChunksAmount chunks={chunks} />
            <OrderDisplay.MinDestAmount dstToken={dstToken} isMarketOrder={isMarketOrder} dstMinAmountOut={destTokenMinAmountOutUI} />
            <OrderDisplay.TradeInterval fillDelayMillis={fillDelayMilliseconds} />
            <OrderDisplay.Recipient />
            <Fee />
          </>
        )}
      </OrderDisplay.DetailsContainer>
    </>
  );
};

const Fee = () => {
  const { fee, dstToken, twap } = useWidgetContext();
  const {
    values: { isMarketOrder, destTokenAmount },
  } = twap;

  const amount = useMemo(() => {
    if (!fee || !destTokenAmount || isMarketOrder) return "";
    return BN(destTokenAmount).multipliedBy(fee).dividedBy(100).toFixed().toString();
  }, [fee, destTokenAmount, isMarketOrder]);

  const amountUi = useFormatNumber({ value: useAmountUi(dstToken?.decimals, amount) });

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
