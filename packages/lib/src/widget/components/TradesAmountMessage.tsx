import React from "react";
import { useChunks, useSrcChunkAmountUSD, useSrcTokenChunkAmount } from "../../hooks/logic-hooks";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { useTwapContext } from "../../context";
import { useTwapStore } from "../../useTwapStore";

export const TradeAmountMessage = () => {
  const chunkSize = useSrcChunkAmountUSD();
  const { amountUI } = useSrcTokenChunkAmount();
  const { srcToken, isLimitPanel } = useTwapContext();
  const chunksError = useChunks().error;
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const chunkSizeError = useSrcTokenChunkAmount().error;
  const error = !typedSrcAmount ? false : chunksError || chunkSizeError;
  const { translations: t } = useTwapContext();
  const amountUIF = useFormatNumber({ value: amountUI, decimalScale: 3 });
  const chunkSizeF = useFormatNumber({ value: chunkSize, decimalScale: 2 });

  if (!chunkSizeF || isLimitPanel || !srcToken) return null;

  return (
    <p className={`twap-trade-amount-message ${error ? "twap-trade-amount-message-error" : ""}`}>
      <span className="twap-trade-amount-message-amount"> {`${amountUIF} ${srcToken?.symbol}`}</span>
      <span className="twap-trade-amount-message-chunk-size"> {`($${chunkSizeF}) `}</span>
      <span className="twap-trade-amount-message-per-trade"> {`${t.perTrade}`}</span>
    </p>
  );
};
