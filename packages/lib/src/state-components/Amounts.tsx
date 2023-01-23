import React from "react";
import { Balance, NumberDisplay, USD } from "../components";
import { useTwapContext } from "../context";
import { useLoadingState } from "../hooks";
import { useTwapStore } from "../store";
import { StyledOneLineText } from "../styles";

export function ChunksAmount() {
  const value = useTwapStore((store) => store.getSrcChunkAmountUi());
  return (
    <StyledOneLineText>
      <NumberDisplay value={value} />
    </StyledOneLineText>
  );
}

export function TotalChunks() {
  const value = useTwapStore((store) => store.getChunks());

  return (
    <StyledOneLineText>
      <NumberDisplay value={value} />
    </StyledOneLineText>
  );
}

export const Deadline = () => {
  const deadline = useTwapStore((store) => store.getDeadlineUi());
  return <StyledOneLineText>{deadline}</StyledOneLineText>;
};

export const OrderType = () => {
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const translations = useTwapContext().translations;
  return <StyledOneLineText>{isLimitOrder ? translations.limitOrder : translations.marketOrder}</StyledOneLineText>;
};

export const TradeIntervalAsText = () => {
  const getFillDelayText = useTwapStore((store) => store.getFillDelayText);
  const translations = useTwapContext().translations;

  return <StyledOneLineText>{getFillDelayText(translations)}</StyledOneLineText>;
};

export const MinDstAmountOut = () => {
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const translations = useTwapContext().translations;
  const dstMinAmountOutUi = useTwapStore((store) => store.getDstMinAmountOutUi());

  if (isLimitOrder) {
    return <StyledOneLineText>{translations.none}</StyledOneLineText>;
  }

  return (
    <StyledOneLineText>
      <NumberDisplay value={dstMinAmountOutUi} />
    </StyledOneLineText>
  );
};

export const SrcTokenAmount = () => {
  const amount = useTwapStore((store) => store.srcAmountUi);

  return (
    <StyledOneLineText>
      <NumberDisplay value={amount} />
    </StyledOneLineText>
  );
};

export const DstTokenAmount = () => {
  const amount = useTwapStore((store) => store.getDstAmountUi());

  return (
    <StyledOneLineText>
      <NumberDisplay value={amount} />
    </StyledOneLineText>
  );
};

export function ChunksUSD() {
  const usd = useTwapStore((state) => state.getSrcChunkAmountUsdUi());
  const loading = useLoadingState().srcUsdLoading;

  return <USD value={usd} isLoading={loading} />;
}

function SrcBalance() {
  const balance = useTwapStore((state) => state.getSrcBalanceUi());
  const isLoading = useLoadingState().srcBalanceLoading;
  return <Balance value={balance} isLoading={isLoading} />;
}

function DstBalance() {
  const balance = useTwapStore((state) => state.getDstBalanceUi());
  const isLoading = useLoadingState().dstBalanceLoading;
  return <Balance value={balance} isLoading={isLoading} />;
}

export const TokenBalance = ({ isSrc }: { isSrc?: boolean }) => {
  if (isSrc) {
    return <SrcBalance />;
  }
  return <DstBalance />;
};

 export function SrcTokenUSD() {
  const usd = useTwapStore((state) => state.getSrcAmountUsdUi());
  const srcLoading = useLoadingState().srcUsdLoading;

  return <USD value={usd} isLoading={srcLoading} />;
}

export function DstTokenUSD() {
  const usd = useTwapStore((state) => state.getDstAmountUsdUi());
  const loading = useLoadingState().dstUsdLoading;

  return <USD value={usd} isLoading={loading} />;
}

export const TokenUSD = ({ isSrc }: { isSrc?: boolean }) => {
  if (isSrc) {
    return <SrcTokenUSD />;
  }
  return <DstTokenUSD />;
};
