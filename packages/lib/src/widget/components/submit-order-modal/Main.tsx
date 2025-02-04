import { styled } from "styled-components";
import BN from "bignumber.js";
import React, { useMemo } from "react";
import { SwapFlow, SwapStep } from "@orbs-network/swap-ui";
import { fillDelayText } from "@orbs-network/twap-sdk";
import { LimitPriceWarning, MarketPriceWarning, Separator } from "../../../components";
import { Switch, Button } from "../../../components/base";
import { OrderDisplay } from "../../../components/OrderDisplay";
import { useSwapPrice, useFormatNumber, useToggleDisclaimer, useAmountUi, useSubmitOrderButton, useNetwork } from "../../../hooks";
import { StyledText, StyledColumnFlex } from "../../../styles";
import { SwapSteps } from "../../../types";
import { useWidgetContext } from "../../widget-context";
import { isNativeAddress } from "@defi.org/web3-candies";

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
    useToken,
  } = useWidgetContext();
  const wToken = useNetwork()?.wToken;
  const dappWToken = useToken?.(wToken?.address);
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
          title: `Approve ${isNativeIn ? wToken?.symbol : srcToken.symbol}`,
          image: isNativeIn ? dappWToken?.logoUrl : srcToken.logoUrl,
        };
      }
      return {
        id: SwapSteps.CREATE,
        title: `Create order`,
        image: srcToken?.logoUrl,
      };
    });
  }, [srcToken, swapSteps, wToken, dappWToken?.logoUrl, isNativeIn]);
};

export const Main = ({ onSubmit }: { onSubmit: () => void }) => {
  const {
    state: { swapStatus, swapStep, swapData },
    twap,
    uiPreferences,
    translations,
  } = useWidgetContext();
  const {} = twap;
  const steps = useSteps();

  const inUsd = useFormatNumber({ value: swapData?.srcAmountusd, decimalScale: 2 });
  const outUsd = useFormatNumber({ value: swapData?.outAmountusd, decimalScale: 2 });

  const usdPrefix = uiPreferences.usd?.prefix || "$";
  const usdSuffix = uiPreferences.usd?.suffix || "";
  return (
    <>
      <SwapFlow.Main
        fromTitle={translations.from}
        toTitle={translations.to}
        steps={steps}
        inUsd={`${usdPrefix}${inUsd}${usdSuffix}`}
        outUsd={`${usdPrefix}${outUsd}${usdSuffix}`}
        currentStep={swapStep}
        showSingleStep={true}
        bottomContent={<ChunksText />}
      />
      {!swapStatus && (
        <>
          <Details />
          <StyledColumnFlex gap={15}>
            <AcceptDisclaimer />
            <SubmitButton onClick={onSubmit} />
          </StyledColumnFlex>
        </>
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
          <MarketPriceWarning />
          <OrderDisplay.Expiry deadline={deadline} />
          <OrderDisplay.ChunkSize srcChunkAmount={srcChunksAmountUI} chunks={chunks} srcToken={srcToken} />
          <OrderDisplay.ChunksAmount chunks={chunks} />
          <OrderDisplay.MinDestAmount totalChunks={chunks} dstToken={dstToken} isMarketOrder={isMarketOrder} dstMinAmountOut={destTokenMinAmountOutUI} />
          <OrderDisplay.TradeInterval chunks={chunks} fillDelayMillis={fillDelayMilliseconds} />
          <OrderDisplay.Recipient />
          <Fee />
        </>
      )}
    </OrderDisplay.DetailsContainer>
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
