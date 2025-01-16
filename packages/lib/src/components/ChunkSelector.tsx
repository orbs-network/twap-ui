import styled from "styled-components";
import React, { ReactNode } from "react";
import { useTwapContext } from "../context/context";
import { useFormatNumberV2 } from "../hooks/hooks";
import { StyledColumnFlex } from "../styles";
import { BottomContent, Label, Message, NumericInput, Slider } from "./base";
import { useChunks, useSetChunks, useShouldWrapOrUnwrapOnly, useSrcChunkAmount, useSrcChunkAmountUsd, useTradeSizeWarning } from "../hooks/lib";
import { useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";

export const ChunkSelector = ({ className = "", children }: { className?: string; children: ReactNode }) => {
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  if (shouldWrapOrUnwrapOnly) {
    return null;
  }

  return (
    <StyledChunkSelector className={className}>
      {children}
      <Text />
    </StyledChunkSelector>
  );
};
const Text = () => {
  const { isWrongChain, srcUsd } = useTwapContext();
  const { parsedSrcToken: srcToken } = useTwapContextUI();

  const chunkSizeFormatted = useFormatNumberV2({ value: useSrcChunkAmount().amountUi });

  const tradeSizeWarning = useTradeSizeWarning();

  const warning = tradeSizeWarning;

  const _usd = useFormatNumberV2({ value: useSrcChunkAmountUsd(), decimalScale: 2 });
  const usd = _usd ? `($${_usd})` : "";

  if (!srcUsd || isWrongChain) return null;

  return (
    <BottomContent>
      <StyledMessage
        title={
          <>
            {chunkSizeFormatted} {srcToken?.symbol} per trade <span>{usd}</span>
          </>
        }
      />
      {warning && <StyledWarning variant="warning" title={warning} />}
    </BottomContent>
  );
};

const StyledWarning = styled(Message)({
  marginTop: 2,
});

const Input = ({ className }: { className?: string }) => {
  const chunks = useChunks();

  const setChunks = useSetChunks();

  return <StyledChunksInput className={className} placeholder="0" value={chunks} decimalScale={0} onChange={(value) => setChunks(Number(value))} />;
};

const StyledMessage = styled(Message)({
  span: {
    opacity: 0.7,
    fontSize: "13px",
  },
});

export const TotalTradesLabel = () => {
  const translations = useTwapContext().translations;

  return (
    <Label>
      <Label.Text text={translations.totalTrades} />
      <Label.Info text={translations.totalTradesTooltip} />
    </Label>
  );
};

ChunkSelector.Input = Input;
ChunkSelector.Label = TotalTradesLabel;

const StyledChunksInput = styled(NumericInput)({
  width: "100%",
  padding: "0px",
  input: {
    padding: "0px",
    width: "100%",
    transition: "0.2s all",
  },
});

const StyledChunkSelector = styled(StyledColumnFlex)({
  gap: 0,
  ".twap-slider": {
    flex: 1,
    marginLeft: "auto",
    marginRight: "auto",
  },
});
