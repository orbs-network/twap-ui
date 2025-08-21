import { SwapFlow } from "@orbs-network/swap-ui";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { useTwapContext } from "../../context";
import { OrderDetails } from "../../components/order-details";
import { useTwapStore } from "../../useTwapStore";
import { useChunks } from "../../hooks/use-chunks";
import { useFillDelay } from "../../hooks/use-fill-delay";
import { useAmountUi, useUsdAmount } from "../../hooks/helper-hooks";
import { useDstMinAmountPerChunk } from "../../hooks/use-dst-min-amount-out-per-chunk";
import { useDeadline } from "../../hooks/use-deadline";
import { useSrcChunkAmount } from "../../hooks/use-src-chunk-amount";
import { useFees } from "../../hooks/use-fees";
import { Module } from "@orbs-network/twap-sdk";
import { useTriggerPrice } from "../../hooks/use-trigger-price";
import { useTradePrice } from "../../hooks/use-trade-price";
import { useLimitPrice } from "../../hooks/use-limit-price";
import { FC, ReactNode } from "react";
import { LabelProps, USDProps } from "../../types";
import { useOrderExecutionFlow } from "../twap";

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

export const Main = ({
  component,
  USD,
  reviewDetails,
  onSubmitOrder,
  isLoading,
  Label,
}: {
  component?: ReactNode;
  USD?: FC<USDProps>;
  reviewDetails?: ReactNode;
  onSubmitOrder: () => void;
  isLoading: boolean;
  Label: FC<LabelProps>;
}) => {
  const { translations, srcUsd1Token, dstUsd1Token } = useTwapContext();
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const srcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const acceptedDstAmount = useTwapStore((s) => s.state.acceptedDstAmount);
  const srcAmountUsd = useUsdAmount(srcAmount, srcUsd1Token);
  const dstAmountUsd = useUsdAmount(acceptedDstAmount, dstUsd1Token);
  const Button = useTwapContext().components.Button;

  const inUsd = useFormatNumber({ value: srcAmountUsd, decimalScale: 2 });
  const outUsd = useFormatNumber({ value: dstAmountUsd, decimalScale: 2 });
  if (component) {
    return component;
  }

  return (
    <>
      <SwapFlow.Main
        fromTitle={translations.from}
        toTitle={translations.to}
        inUsd={USD ? <USD value={srcAmountUsd} isLoading={false} /> : `$${inUsd}`}
        outUsd={USD ? <USD value={dstAmountUsd} isLoading={false} /> : `$${outUsd}`}
      />
      {!swapStatus && (
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
  const fee = useFees();
  const { dstToken } = useTwapContext();

  const feeAmountF = useFormatNumber({ value: fee.amountUI, decimalScale: 2 });
  return (
    <OrderDetails.Container Label={Label}>
      <div className="twap-create-order-details">
        <Price />
        <LimitModuleDetails />
        <StopLossModuleDetails />
        <TwapModuleDetails />
        {fee.percent && <OrderDetails.DetailRow title={`Fee (${fee.percent}%)`}>{feeAmountF ? `${feeAmountF} ${dstToken?.symbol}` : ""}</OrderDetails.DetailRow>}
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
