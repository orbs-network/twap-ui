import { TwapProps } from "../types";
import { useInitTwap } from "./hooks";
import { useChunks, useLimitPrice, useMaxChunks } from "./widget-hooks";

interface Props extends TwapProps {}

export const useTwap = (props: Props) => {
  const { state, updateState, resetState, translations, twapSDK, walletClient, publicClient, isWrongChain } = useInitTwap(props);

  const limitPrice = useLimitPrice(state, updateState, translations, props.dstToken, props.marketReferencePrice.value);
  const maxChunks = useMaxChunks(twapSDK, state.typedSrcAmount, props.srcUsd1Token);
  const chunks = useChunks(twapSDK, updateState, translations, state.typedChunks, maxChunks, props.isLimitPanel);
  return {
    state,
    updateState,
    resetState,
    translations,
    twapSDK,
    walletClient,
    publicClient,
    isWrongChain,
  };
};
