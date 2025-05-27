import React from "react";
import { useChunks, useSrcChunkAmountUSD, useSrcTokenChunkAmount } from "../../hooks/logic-hooks";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { useTwapContext } from "../../context";
import { useTwapStore } from "../../useTwapStore";
import BN from "bignumber.js";
export const Main = () => {
  const { translations: t } = useTwapContext();

  const { tokenAmount, usdAmount, error, token, hide } = useTradeAmountMessagePanel();

  if (hide) return null;
  return (
    <span className={`twap-trade-amount-message ${error ? "twap-trade-amount-message-error" : ""}`}>
      <span className="twap-trade-amount-message-amount"> {`${tokenAmount} ${token?.symbol}`}</span>
      <span className="twap-trade-amount-message-chunk-size"> {`($${usdAmount}) `}</span>
      <span className="twap-trade-amount-message-per-trade"> {`${t.perTrade}`}</span>
    </span>
  );
};

export const useTradeAmountMessagePanel = () => {
  const chunkSize = useSrcChunkAmountUSD();
  const { amountUI } = useSrcTokenChunkAmount();
  const chunksError = useChunks().error;
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const chunkSizeError = useSrcTokenChunkAmount().error;
  const error = !typedSrcAmount ? false : chunksError || chunkSizeError;
  const amountUIF = useFormatNumber({ value: amountUI, decimalScale: 3 });
  const chunkSizeF = useFormatNumber({ value: chunkSize, decimalScale: 2 });
  const { srcToken, isLimitPanel } = useTwapContext();

  return {
    hide: isLimitPanel || !srcToken || BN(amountUI || 0).eq(0) || BN(chunkSize || 0).eq(0),
    tokenAmount: amountUIF,
    usdAmount: chunkSizeF,
    error,
    token: srcToken,
  };
};

export const TradeAmountMessage = () => {
  return <Main />;
};

TradeAmountMessage.usePanel = useTradeAmountMessagePanel;
