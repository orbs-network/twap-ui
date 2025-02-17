import { styled } from "styled-components";
import BN from "bignumber.js";
import React, { useCallback, useMemo } from "react";
import { SwapFlow, SwapStep } from "@orbs-network/swap-ui";
import { fillDelayText } from "@orbs-network/twap-sdk";
import { Switch, Button, Message } from "../../../components/base";
import { OrderDisplay } from "../../../components/OrderDisplay";
import { StyledText } from "../../../styles";
import { SwapSteps } from "../../../types";
import { useWidgetContext } from "../../widget-context";
import { isNativeAddress } from "@defi.org/web3-candies";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import { useFormatNumber } from "../../../hooks/useFormatNumber";
import { useNetwork } from "../../../hooks/useNetwork";
import { useOrderName } from "../../../hooks/useOrderName";
import { useAmountUi } from "../../../hooks/useParseAmounts";
import { useSubmitOrderButton } from "../../../hooks/useSubmitOrderButton";
import { useConfirmation } from "../../../hooks/useConfirmation";
import { useShouldWrapOrUnwrapOnly } from "../../../hooks/useShouldWrapOrUnwrap";

export const MarketPriceWarning = ({ className = "" }: { className?: string }) => {
  const isMarketOrder = useWidgetContext().twap.values.isMarketOrder;
  const { translations: t } = useWidgetContext();
  const isWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  if (!isMarketOrder || isWrapOrUnwrapOnly) return null;

  return (
    <Message
      className={`twap-market-price-warning ${className}`}
      title={
        <>
          {`${t?.marketOrderWarning} `}
          <a href="https://www.orbs.com/dtwap-and-dlimit-faq/" target="_blank">{`${t.learnMore}`}</a>
        </>
      }
      variant="warning"
    />
  );
};

export const useSwapPrice = () => {
  const { swapData } = useConfirmation();

  const price = useMemo(() => {
    if (!swapData?.outAmount || !swapData?.srcAmount) return "0";
    return BN(swapData.outAmount).dividedBy(swapData.srcAmount).toString();
  }, [swapData?.outAmount, swapData?.srcAmount]);

  const srcUsd1Token = useMemo(() => {
    if (!swapData?.srcAmountusd || !swapData?.srcAmount) return;
    return BN(swapData?.srcAmountusd).dividedBy(swapData?.srcAmount).toString();
  }, [swapData?.srcAmountusd, swapData?.srcAmount]);

  const dstUsd1Token = useMemo(() => {
    if (!swapData?.outAmountusd || !swapData?.outAmount) return;
    return BN(swapData?.outAmountusd).dividedBy(swapData?.outAmount).toString();
  }, [swapData?.outAmountusd, swapData?.outAmount]);

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
  const { twap, srcToken, dstToken } = useWidgetContext();
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

export const AcceptDisclaimer = ({ className }: { className?: string }) => {
  const {
    translations: t,
    state: { disclaimerAccepted },
    updateState,
  } = useWidgetContext();

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
  const {
    state: { swapSteps },
    srcToken,
    useToken,
  } = useWidgetContext();
  const wToken = useNetwork()?.wToken;
  const dappWToken = useToken?.(wToken?.address);
  const orderType = useOrderName();

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
        title: `Create ${orderType} order`,
        icon: <RiArrowUpDownLine style={{ width: 20, height: 20 }} />,
      };
    });
  }, [srcToken, swapSteps, wToken, dappWToken?.logoUrl, isNativeIn]);
};

export const Main = () => {
  const { uiPreferences, translations } = useWidgetContext();
  const { swapStatus, swapStep, swapData } = useConfirmation();
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
          <div className="twap-devider" />
          <Details />
          <AcceptDisclaimer />
          <SubmitButton />
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
  const { twap, isLimitPanel, srcToken, dstToken } = useWidgetContext();

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

export const SubmitButton = () => {
  const button = useSubmitOrderButton();

  return (
    <Button className="twap-order-modal-submit-btn twap-submit-button" onClick={button.onClick ? button.onClick : () => null} loading={button.loading} disabled={button.disabled}>
      {button.text}
    </Button>
  );
};
