import styled from "styled-components";
import React, { ReactNode } from "react";
import { StyledColumnFlex } from "../styles";
import { Label, Message, NumericInput } from "./base";
import { useWidgetContext } from "../context/context";

export const ChunkSelector = ({ className = "", children }: { className?: string; children: ReactNode }) => {
  const { twap } = useWidgetContext();
  const error = twap.errors.tradeSize?.text;

  return <Container className={`twap-chunks-select ${error ? "twap-chunks-select-error" : ""} ${className}`}>{children}</Container>;
};

const Input = ({ className }: { className?: string }) => {
  const {
    values: { chunks },
    actionHandlers: { setChunks },
  } = useWidgetContext().twap;

  return <StyledChunksInput className={className} placeholder="0" value={chunks} decimalScale={0} onChange={(value) => setChunks(Number(value))} />;
};

const StyledMessage = styled(Message)({
  span: {
    opacity: 0.7,
    fontSize: "13px",
  },
});

export const TotalTradesLabel = () => {
  const translations = useWidgetContext().translations;

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

const Container = styled(StyledColumnFlex)({
  gap: 0,
  ".twap-slider": {
    flex: 1,
    marginLeft: "auto",
    marginRight: "auto",
  },
});
