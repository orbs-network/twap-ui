import { styled } from "@mui/material";
import { ReactNode } from "react";
import { useTwapContext } from "../context/context";
import {
  useSrcChunkAmountUi,
  useFormatNumber,
  useChunks,
  useSetChunks,
  useMaxPossibleChunks,
  useSrcChunkAmountUsdUi,
  useFormatNumberV2,
  useSrcUsd,
  useTradeSizeWarning,
  useShouldWrapOrUnwrapOnly,
} from "../hooks/hooks";
import { StyledColumnFlex } from "../styles";
import { BottomContent, Label, Loader, Message, NumericInput, Slider } from "./base";

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
  const { isWrongChain, state } = useTwapContext();

  const chunkSizeFormatted = useFormatNumberV2({ value: useSrcChunkAmountUi() });
  const srcToken = state.srcToken;
  const warning = useTradeSizeWarning();
  const srcUsdLoading = useSrcUsd().isLoading;
  const _usd = useFormatNumberV2({ value: useSrcChunkAmountUsdUi(), decimalScale: 2 });
  const usd = _usd ? `($${_usd})` : "";

  if (srcUsdLoading || isWrongChain) return null;

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
  const srcUsdLoading = useSrcUsd().isLoading;

  if (srcUsdLoading) {
    return <Loader height="100%" />;
  }

  return <StyledChunksInput className={className} placeholder="0" value={chunks} decimalScale={0} onChange={(value) => setChunks(Number(value))} />;
};

const SliderComponent = ({ className }: { className?: string }) => {
  const chunks = useChunks();
  const setChunks = useSetChunks();
  const formattedChunks = useFormatNumber({ value: chunks });
  const maxPossibleChunks = useMaxPossibleChunks();
  const srcUsdLoading = useSrcUsd().isLoading;

  if (srcUsdLoading) {
    return <Loader height="100%" />;
  }

  return (
    <Slider
      label={`${formattedChunks ? formattedChunks : "0"} trades`}
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

export const TotalTradesLabel = () => {
  const translations = useTwapContext().translations;

  return <Label tooltipText={translations.totalTradesTooltip}>{translations.totalTrades}</Label>;
};

ChunkSelector.Slider = SliderComponent;
ChunkSelector.Input = Input;
ChunkSelector.Label = TotalTradesLabel;

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
