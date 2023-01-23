import { Box } from "@mui/material";
import { ReactNode } from "react";
import { useTwapContext } from "..";
import { Icon, IconButton, NumericInput, Slider, Tooltip } from "../components";
import { useTwapStore } from "../store";
import { StyledText } from "../styles";
import { HiOutlineSwitchVertical } from "react-icons/hi";


export function ChunksInput() {
  const translations = useTwapContext().translations;
  const chunks = useTwapStore((store) => store.getChunks());
  const maxPossibleChunks = useTwapStore((store) => store.getMaxPossibleChunks());
  const setChunks = useTwapStore((store) => store.setChunks);
  return (
    <Tooltip text={translations.sliderMinSizeTooltip}>
      <NumericInput placeholder="0" value={chunks} decimalScale={0} maxValue={maxPossibleChunks.toString()} onChange={(value) => setChunks(Number(value))} />
    </Tooltip>
  );
}

export function ChunksSliderSelect() {
  const maxPossibleChunks = useTwapStore((store) => store.getMaxPossibleChunks());
  const chunks = useTwapStore((store) => store.getChunks());
  const setChunks = useTwapStore((store) => store.setChunks);
  return <Slider maxTrades={maxPossibleChunks} value={chunks} onChange={setChunks} />;
}

export function ChunksSelectDisplay() {
  const getChunksBiggerThanOne = useTwapStore((store) => store.getChunksBiggerThanOne());
  const chunks = useTwapStore((store) => store.getChunks());

  if (getChunksBiggerThanOne) {
    return (
      <>
        <ChunksSliderSelect />
        <ChunksInput />
      </>
    );
  }
  return <StyledText>{chunks || "-"}</StyledText>;
}


export const ChangeTokensOrder = ({ children }: {children?: ReactNode}) => {
  const switchTokens = useTwapStore((state) => state.switchTokens);
  return (
    <Box className="twap-change-tokens-order">
      <IconButton onClick={switchTokens}>{children || <Icon icon={<HiOutlineSwitchVertical />} />}</IconButton>
    </Box>
  );
};

