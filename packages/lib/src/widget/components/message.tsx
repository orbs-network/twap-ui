import React from "react";
import { Message } from "../../components/base";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/useShouldWrapOrUnwrap";
import { useSrcChunkAmountUSD } from "../../hooks/useSrcChunkAmountUSD";
import { useWidgetContext } from "../widget-context";

const useTradeSizeMessage = () => {
  const { srcUsd1Token, twap, srcToken } = useWidgetContext();
  const srcChunksAmount = twap.values.srcChunksAmountUI;
  const srcChunkAmountUsd = useSrcChunkAmountUSD();
  const _usd = useFormatNumber({ value: srcChunkAmountUsd, decimalScale: 2 });
  const chunkSizeFormatted = useFormatNumber({ value: srcChunksAmount });
  const usd = _usd ? `($${_usd})` : "";

  if (!srcUsd1Token || !srcToken) return null;

  return (
    <>
      {chunkSizeFormatted} {srcToken?.symbol} per trade <span>{usd}</span>
    </>
  );
};

export const WidgetMessage = () => {
  const tradeSizeMessage = useTradeSizeMessage();

  const message = tradeSizeMessage;
  if (!message) return null;

  return <Message title={message} />;
};
