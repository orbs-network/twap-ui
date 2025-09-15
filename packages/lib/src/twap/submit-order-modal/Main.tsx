import { SwapFlow } from "@orbs-network/swap-ui";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { useTwapContext } from "../../context";
import { OrderDetails } from "../../components/order-details";
import { useTwapStore } from "../../useTwapStore";
import { useChunks } from "../../hooks/use-chunks";
import { useFillDelay } from "../../hooks/use-fill-delay";
import { useAmountUi } from "../../hooks/helper-hooks";
import { useDstMinAmountPerChunk } from "../../hooks/use-dst-min-amount-out-per-chunk";
import { useDeadline } from "../../hooks/use-deadline";
import { useSrcChunkAmount } from "../../hooks/use-src-chunk-amount";
import { useFees } from "../../hooks/use-fees";
import { Module } from "@orbs-network/twap-sdk";
import { useTriggerPrice } from "../../hooks/use-trigger-price";
import { useTradePrice } from "../../hooks/use-trade-price";
import { useLimitPrice } from "../../hooks/use-limit-price";
import { FC } from "react";
import { LabelProps } from "../../types";
import { useSubmitOrderPanelContext } from "./context";
import { useSwap } from "../../hooks/use-swap";

const Price = () => {
  const { srcToken, dstToken, translations: t } = useTwapContext();

  const tradePrice = useTradePrice();

  const tradePriceUI = useAmountUi(dstToken?.decimals, tradePrice);

  const priceF = useFormatNumber({ value: tradePriceUI, decimalScale: 4 });

  return (
    <OrderDetails.DetailRow title={t.tradePrice}>
      1 {srcToken?.symbol} = {priceF} {dstToken?.symbol}
    </OrderDetails.DetailRow>
  );
};

const FillDelaySummary = () => {
  const chunks = useChunks().chunks;
  const { fillDelay } = useFillDelay();
  const fillDelayMillis = fillDelay.unit * fillDelay.value;
  return <OrderDetails.FillDelaySummary chunks={chunks} fillDelayMillis={fillDelayMillis} />;
};

export const Main = ({ onSubmitOrder, isLoading }: { onSubmitOrder: () => void; isLoading: boolean }) => {
  const { translations } = useTwapContext();
  const {
    swap: { srcUsdAmount, dstUsdAmount },
  } = useSwap();

  const inUsd = useFormatNumber({ value: srcUsdAmount, decimalScale: 2 });
  const outUsd = useFormatNumber({ value: dstUsdAmount, decimalScale: 2 });
  const { Label, USD, reviewDetails, Button, MainView } = useSubmitOrderPanelContext();
  if (MainView) {
    return MainView;
  }

  return (
    <>
      <SwapFlow.Main
        fromTitle={translations.from}
        toTitle={translations.to}
        inUsd={USD ? <USD value={srcUsdAmount || ""} isLoading={false} /> : `$${inUsd}`}
        outUsd={USD ? <USD value={dstUsdAmount || ""} isLoading={false} /> : `$${outUsd}`}
      />
      {!status && (
        <div className="twap-create-order-bottom">
          <FillDelaySummary />
          <Details Label={Label} />
          {reviewDetails}
          <Button loading={isLoading} disabled={isLoading} onClick={onSubmitOrder}>
            {translations.confirmOrder}
          </Button>
        </div>
      )}
    </>
  );
};

const Details = ({ Label }: { Label: FC<LabelProps> }) => {
  const { amount: feeAmount, percent: feePercent } = useFees();
  const { dstToken } = useTwapContext();

  const feeAmountF = useFormatNumber({ value: feeAmount, decimalScale: 2 });
  return (
    <OrderDetails.Container Label={Label}>
      <div className="twap-create-order-details">
        <Price />
        <LimitModuleDetails />
        <StopLossModuleDetails />
        <TwapModuleDetails />
        {feeAmount && <OrderDetails.DetailRow title={`Fee (${feePercent}%)`}>{feeAmountF ? `${feeAmountF} ${dstToken?.symbol}` : ""}</OrderDetails.DetailRow>}
      </div>
    </OrderDetails.Container>
  );
};

const LimitModuleDetails = () => {
  const deadline = useDeadline();
  const { module, dstToken } = useTwapContext();
  const minAmountOut = useDstMinAmountPerChunk().amountUI;
  if (module !== Module.LIMIT) return null;

  return (
    <>
      <OrderDetails.Expiry deadline={deadline} />
      <OrderDetails.MinDestAmount dstToken={dstToken} dstMinAmountOut={minAmountOut} />
      <OrderDetails.Recipient />
    </>
  );
};

const StopLossModuleDetails = () => {
  const { module, dstToken } = useTwapContext();
  const deadline = useDeadline();
  const { amountUI, percentDiffFromMarketPrice: triggerPricePercent } = useTriggerPrice();
  const { amountUI: limitPrice, percentDiffFromMarketPrice: limitPricePercent } = useLimitPrice();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  if (module !== Module.STOP_LOSS && module !== Module.TAKE_PROFIT) return null;
  return (
    <>
      <OrderDetails.TriggerPrice price={amountUI} dstToken={dstToken} percentage={triggerPricePercent} />
      <OrderDetails.LimitPrice isMarketOrder={isMarketOrder} price={limitPrice} dstToken={dstToken} percentage={limitPricePercent} />
      <OrderDetails.Expiry deadline={deadline} />
      <OrderDetails.Recipient />
    </>
  );
};

const TwapModuleDetails = () => {
  const { srcToken, dstToken, module } = useTwapContext();
  const srcChunkAmount = useSrcChunkAmount().amountUI;
  const deadline = useDeadline();

  const dstMinAmountOut = useDstMinAmountPerChunk().amountUI;
  const { fillDelay } = useFillDelay();
  const fillDelayMillis = fillDelay.unit * fillDelay.value;
  const chunks = useChunks().chunks;
  if (module !== Module.TWAP) return null;

  return (
    <>
      <OrderDetails.Expiry deadline={deadline} />
      <OrderDetails.ChunkSize srcChunkAmount={srcChunkAmount} chunks={chunks} srcToken={srcToken} />
      <OrderDetails.ChunksAmount chunks={chunks} />
      <OrderDetails.MinDestAmount totalChunks={chunks} dstToken={dstToken} dstMinAmountOut={dstMinAmountOut} />
      <OrderDetails.TradeInterval chunks={chunks} fillDelayMillis={fillDelayMillis} />
      <OrderDetails.Recipient />
    </>
  );
};
