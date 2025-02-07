import { styled } from "styled-components";
import BN from "bignumber.js";
import React, { useCallback, useMemo } from "react";
import { SwapFlow, SwapStep } from "@orbs-network/swap-ui";
import { fillDelayText } from "@orbs-network/twap-sdk";
import { MarketPriceWarning } from "../../../components";
import { Switch, Button } from "../../../components/base";
import { OrderDisplay } from "../../../components/OrderDisplay";
import { StyledText, StyledColumnFlex } from "../../../styles";
import { SwapSteps } from "../../../types";
import { useWidgetContext } from "../../widget-context";
import { isNativeAddress } from "@defi.org/web3-candies";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import { useFormatNumber } from "../../../hooks/useFormatNumber";
import { useNetwork } from "../../../hooks/useNetwork";
import { useOrderName } from "../../../hooks/useOrderName";
import { useAmountUi } from "../../../hooks/useParseAmounts";
import { useSubmitOrderButton } from "../../../hooks/useSubmitOrderButton";
import { useUsdAmount } from "../../../hooks/useUsdAmounts";

export const useSwapPrice = () => {
  const { srcUsd1Token, dstUsd1Token, twap } = useWidgetContext();

  const srcAmount = twap.values.srcAmountUI;
  const outAmountUi = twap.values.destTokenAmountUI;

  const price = useMemo(() => {
    if (!outAmountUi || !srcAmount) return "0";
    return BN(outAmountUi).dividedBy(srcAmount).toString();
  }, [srcAmount, outAmountUi]);

  return {
    price,
    usd: useMemo(() => {
      if (!dstUsd1Token || !srcUsd1Token) return "0";
      return BN(dstUsd1Token).multipliedBy(price).toString();
    }, [price, srcUsd1Token, dstUsd1Token]),
  };
};

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
  const {
    state: { swapStatus, swapStep, confirmedData },
    uiPreferences,
    translations,
  } = useWidgetContext();
  const steps = useSteps();
  const { srcUsd } = useUsdAmount();

  const inUsd = useFormatNumber({ value: srcUsd, decimalScale: 2 });
  const outUsd = useFormatNumber({ value: confirmedData?.outAmountusd, decimalScale: 2 });

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
            <SubmitButton />
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

export const SubmitButton = () => {
  const button = useSubmitOrderButton();

  return (
    <Button className="twap-order-modal-submit-btn twap-submit-button" onClick={button.onClick ? button.onClick : () => null} loading={button.loading} disabled={button.disabled}>
      {button.text}
    </Button>
  );
};
