import { styled } from "@mui/material";
import { ReactNode } from "react";
import {
  useSrcChunkAmountUi,
  useFormatNumber,
  useChunks,
  useSetChunks,
  useMaxPossibleChunks,
  useSrcChunkAmountUsdUi,
  useFormatDecimals,
  useSwapWarning,
  useFormatNumberV2,
  useSrcUsd,
} from "../hooks";
import { useTwapStore } from "../store";
import { StyledColumnFlex } from "../styles";
import { Message, NumericInput, Slider } from "./base";

const ChunkSelector = ({ className = "", children }: { className?: string; children: ReactNode }) => {
  return (
    <StyledChunkSelector>
      {children}
      <Text />
    </StyledChunkSelector>
  );
};
const Text = () => {
  const chunkSizeFormatted = useFormatNumberV2({ value: useSrcChunkAmountUi() });
  const srcToken = useTwapStore((s) => s.srcToken);
  const warning = useSwapWarning();
  const srcUsdLoading = useSrcUsd().isLoading;
  const _usd = useFormatNumberV2({ value: useSrcChunkAmountUsdUi(), decimalScale: 2 });

  const usd = _usd ? `($${_usd})` : "";

  if (srcUsdLoading) return null;

  return (
    <>
      <StyledMessage
        text={
          <>
            {chunkSizeFormatted} {srcToken?.symbol} per trade <span>{usd}</span>
          </>
        }
      />
      {warning.tradeSize && <StyledWarning type="warning" text={warning.tradeSize} />}
    </>
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

const SliderComponent = ({ className }: { className?: string }) => {
  const chunks = useChunks();
  const setChunks = useSetChunks();
  const formattedChunks = useFormatNumber({ value: chunks });
  const maxPossibleChunks = useMaxPossibleChunks();

  return (
    <Slider
      label={`${formattedChunks} trades`}
      className={className}
      maxTrades={maxPossibleChunks === 1 ? maxPossibleChunks + 0.0001 : maxPossibleChunks}
      value={chunks}
      onChange={setChunks}
    />
  );
};

const StyledMessage = styled(Message)({
  span: {
    opacity: 0.7,
    fontSize: "13px",
  },
});

ChunkSelector.Slider = SliderComponent;
ChunkSelector.Input = Input;

export default ChunkSelector;

const StyledChunksInput = styled(NumericInput)({
  width: "100%",
  padding: "0px",
  input: {
    padding: "0px",
    textAlign: "right",
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