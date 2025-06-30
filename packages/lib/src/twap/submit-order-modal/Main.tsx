import { SwapFlow } from "@orbs-network/swap-ui";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { useTwapContext } from "../../context";
import { useFee } from "../../hooks/ui-hooks";
import { useChunks, useDestTokenMinAmount, useFillDelay, useOrderDeadline, useSrcTokenChunkAmount, useUsdAmount } from "../../hooks/logic-hooks";
import { OrderDetails } from "../../components/order-details";
import { useTwapStore } from "../../useTwapStore";
import { useTradePrice } from "./usePrice";

const Price = () => {
  const { srcToken, dstToken } = useTwapContext();

  const price = useTradePrice();

  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);

  const priceF = useFormatNumber({ value: price, decimalScale: 4 });

  return (
    <OrderDetails.DetailRow title={isMarketOrder ? "Market Price" : "Limit Price"}>
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

export const Main = () => {
  const { translations, components, srcUsd1Token, dstUsd1Token } = useTwapContext();
  const trade = useTwapStore((s) => s.state.trade);
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const srcAmountUsd = useUsdAmount(trade?.srcAmount, srcUsd1Token);
  const dstAmountUsd = useUsdAmount(trade?.dstAmount, dstUsd1Token);

  const inUsd = useFormatNumber({ value: srcAmountUsd, decimalScale: 2 });
  const outUsd = useFormatNumber({ value: dstAmountUsd, decimalScale: 2 });

  return (
    <>
      <SwapFlow.Main
        fromTitle={translations.from}
        toTitle={translations.to}
        inUsd={components.TransactionModal?.USD ? <components.TransactionModal.USD value={srcAmountUsd} isLoading={false} /> : `$${inUsd}`}
        outUsd={components.TransactionModal?.USD ? <components.TransactionModal.USD value={dstAmountUsd} isLoading={false} /> : `$${outUsd}`}
      />
      {!swapStatus && (
        <div className="twap-create-order-bottom">
          <FillDelaySummary />
          <Details />
        </div>
      )}
    </>
  );
};

const Details = () => {
  const { isLimitPanel, srcToken, dstToken } = useTwapContext();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const fee = useFee();
  const srcChunkAmount = useSrcTokenChunkAmount().amountUI;
  const deadline = useOrderDeadline();

  const dstMinAmountOut = useDestTokenMinAmount().amountUI;
  const { fillDelay } = useFillDelay();
  const fillDelayMillis = fillDelay.unit * fillDelay.value;
  const chunks = useChunks().chunks;
  const feeAmountF = useFormatNumber({ value: fee.amountUI, decimalScale: 2 });
  return (
    <div className="twap-create-order-details">
      <Price />
      {isLimitPanel ? (
        <>
          <OrderDetails.Expiry deadline={deadline} />
          <OrderDetails.Recipient />
        </>
      ) : (
        <>
          <OrderDetails.Expiry deadline={deadline} />
          <OrderDetails.ChunkSize srcChunkAmount={srcChunkAmount} chunks={chunks} srcToken={srcToken} />
          <OrderDetails.ChunksAmount chunks={chunks} />
          <OrderDetails.MinDestAmount totalChunks={chunks} dstToken={dstToken} isMarketOrder={isMarketOrder} dstMinAmountOut={dstMinAmountOut} />
          <OrderDetails.TradeInterval chunks={chunks} fillDelayMillis={fillDelayMillis} />
          <OrderDetails.Recipient />
        </>
      )}
      {fee.percent && <OrderDetails.DetailRow title={`Fee (${fee.percent}%)`}>{feeAmountF ? `${feeAmountF} ${dstToken?.symbol}` : ""}</OrderDetails.DetailRow>}
    </div>
  );
};
