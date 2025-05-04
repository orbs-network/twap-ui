import React from "react";
import { StyledText } from "../../styles";
import { useChunks, useSrcChunkAmountUSD, useSrcTokenChunkAmount } from "../../hooks/widget-hooks";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { useTwapContext } from "../../context";

export const TradeAmountMessage = () => {
  const chunkSize = useSrcChunkAmountUSD();
  const { amountUI } = useSrcTokenChunkAmount();
  const { srcToken, state, isLimitPanel } = useTwapContext();
  const chunksError = useChunks().error;
  const chunkSizeError = useSrcTokenChunkAmount().error;
  const error = !state.typedSrcAmount ? false : chunksError || chunkSizeError;
  const { translations: t } = useTwapContext();
  const amountUIF = useFormatNumber({ value: amountUI, decimalScale: 3 });
  const chunkSizeF = useFormatNumber({ value: chunkSize, decimalScale: 2 });

  if (!chunkSizeF || isLimitPanel || !srcToken) return null;

  return (
    <StyledText className={`twap-trade-amount-message ${error ? "twap-trade-amount-message-error" : ""}`}>
      <span className="twap-trade-amount-message-amount"> {`${amountUIF} ${srcToken?.symbol}`}</span>
      <span className="twap-trade-amount-message-chunk-size"> {`($${chunkSizeF}) `}</span>
      <span className="twap-trade-amount-message-per-trade"> {`${t.perTrade}`}</span>
    </StyledText>
  );
};
