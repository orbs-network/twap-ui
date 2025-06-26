import { amountBN, Config, constructSDK, maxUint256, TimeDuration, TwapSDK } from "@orbs-network/twap-sdk";
import { useCallback, useMemo } from "react";
import lib, { InputErrors } from "../lib/lib";
import { useTwapStore } from "../useTwapStore";
import { Provider, PublicClient, Token, WalletClient } from "../types";
import BN from "bignumber.js";
import { useOrdersQuery } from "../lib/hooks";
import { initiateWallet } from "../lib";
import { useSubmitOrderCallback } from "./callbacks";

type TwapProps = {
  config: Config;
  marketPrice: {
    value: string;
    isLoading: boolean;
  };
  account: `0x${string}` | undefined;
  chainId: number;
  isLimitPanel: boolean;
  srcUsd1Token: string;
  dstUsd1Token: string;
  srcToken: Token;
  dstToken: Token;
  provider?: Provider;
  isExactAppoval?: boolean;
};

const useChunksPanel = (sdk: TwapSDK, props: TwapProps, maxChunks: number) => {
  const state = useTwapStore((s) => s.state);
  const updateState = useTwapStore((s) => s.updateState);
  const chunks = useMemo(() => lib.getChunks(sdk, state, maxChunks, Boolean(props.isLimitPanel)), [sdk, state, maxChunks, props.isLimitPanel]);

  return {
    chunks,
    setChunks: useCallback((typedChunks: number) => updateState({ typedChunks }), [updateState]),
  };
};

const useMaxChunks = (sdk: TwapSDK, props: TwapProps) => {
  const state = useTwapStore((s) => s.state);
  return useMemo(() => lib.getMaxChunks(sdk, state, props.srcUsd1Token, sdk.config.minChunkSizeUsd), [sdk, state, props.srcUsd1Token]);
};

const useSrcTokenChunkSize = (sdk: TwapSDK, props: TwapProps, chunks: number) => {
  const state = useTwapStore((s) => s.state);
  return useMemo(() => lib.getSrcTokenChunkSize(sdk, state, chunks, props.srcToken), [sdk, state, chunks, props.srcToken]);
};

const useLimitPrice = (props: TwapProps) => {
  const state = useTwapStore((s) => s.state);
  const updateState = useTwapStore((s) => s.updateState);
  const limitPrice = useMemo(() => lib.getLimitPrice(state, props.dstToken, props.marketPrice.value), [state, props.dstToken, props.marketPrice.value]);
  return {
    limitPrice,
    setLimitPrice: useCallback((typedPrice: string) => updateState({ typedPrice }), [updateState]),
  };
};

const useDestTokenAmount = (sdk: TwapSDK, props: TwapProps, limitPrice: string) => {
  const state = useTwapStore((s) => s.state);
  return useMemo(() => lib.getDestTokenAmount(sdk, state, limitPrice, props.srcToken), [sdk, state, limitPrice, props.srcToken]);
};

const useDestTokenMinAmount = (sdk: TwapSDK, props: TwapProps, limitPrice: string, srcTokenChunkSize: string) => {
  const state = useTwapStore((s) => s.state);
  return useMemo(() => lib.getDestTokenMinAmount(sdk, state, limitPrice, srcTokenChunkSize, props.srcToken), [sdk, state, limitPrice, srcTokenChunkSize, props.srcToken]);
};

const useSrcChunkAmountUSD = (props: TwapProps, srcTokenChunkSize: string) => {
  const state = useTwapStore((s) => s.state);
  return useMemo(() => lib.getSrcChunkAmountUSD(props.srcUsd1Token, srcTokenChunkSize), [state, props.srcUsd1Token, srcTokenChunkSize]);
};

const useOrderDuration = (sdk: TwapSDK, props: TwapProps, chunks: number, fillDelay: TimeDuration) => {
  const state = useTwapStore((s) => s.state);
  const updateState = useTwapStore((s) => s.updateState);
  const duration = useMemo(() => lib.getOrderDuration(sdk, state, chunks, fillDelay), [sdk, state, chunks, fillDelay]);

  return {
    orderDuration: duration,
    setOrderDuration: useCallback((typedDuration: TimeDuration) => updateState({ typedDuration }), [updateState]),
  };
};

const useOrderDeadline = (sdk: TwapSDK, props: TwapProps, orderDuration: TimeDuration) => {
  const state = useTwapStore((s) => s.state);
  return useMemo(() => lib.getOrderDeadline(sdk, state, orderDuration), [sdk, state, orderDuration]);
};

const useFillDelay = (sdk: TwapSDK, props: TwapProps, chunks: number) => {
  const state = useTwapStore((s) => s.state);
  const updateState = useTwapStore((s) => s.updateState);
  const fillDelay = useMemo(() => lib.getFillDelay(sdk, state, chunks, Boolean(props.isLimitPanel)), [sdk, state, chunks, props.isLimitPanel]);
  return {
    fillDelay,
    setFillDelay: useCallback((typedFillDelay: TimeDuration) => updateState({ typedFillDelay }), [updateState]),
  };
};

const useChunksError = (sdk: TwapSDK, props: TwapProps, chunks: number, maxChunks: number) => {
  return useMemo(() => lib.getChunksError(sdk, chunks, maxChunks, Boolean(props.isLimitPanel)), [sdk, chunks, maxChunks, props.isLimitPanel]);
};

const useLimitPriceError = () => {
  const state = useTwapStore((s) => s.state);
  return useMemo(() => lib.getLimitPriceError(state), [state]);
};

const useOrderDurationError = (sdk: TwapSDK, orderDuration: TimeDuration) => {
  return useMemo(() => lib.getOrderDurationError(sdk, orderDuration), [sdk, orderDuration]);
};

const useFillDelayError = (sdk: TwapSDK, fillDelay: TimeDuration, chunks: number) => {
  return useMemo(() => lib.getFillDelayError(sdk, fillDelay, chunks), [sdk, fillDelay, chunks]);
};

const useTradeSizeError = (sdk: TwapSDK, srcUsd1Token: string, minChunkSizeUsd: number) => {
  const state = useTwapStore((s) => s.state);
  return useMemo(() => lib.getTradeSizeError(sdk, state, srcUsd1Token, minChunkSizeUsd), [sdk, state, srcUsd1Token, minChunkSizeUsd]);
};

const useSrcAmountError = () => {
  const state = useTwapStore((s) => s.state);
  return BN(state.typedSrcAmount || 0).isZero() ? InputErrors.EMPTY_AMOUNT_ERROR : undefined;
};

const useSubmitOrderPanel = ({
  sdk,
  props,
  walletClient,
  publicClient,
  fillDelay,
  orderDeadline,
  srcTokenChunkSize,
  destTokenMinAmount,
}: {
  sdk: TwapSDK;
  props: TwapProps;
  walletClient?: WalletClient;
  publicClient?: PublicClient;
  fillDelay: TimeDuration;
  orderDeadline: number;
  srcTokenChunkSize: string;
  destTokenMinAmount: string;
}) => {
  const { mutateAsync, isLoading } = useSubmitOrderCallback(sdk, walletClient, publicClient, props.account, props.srcToken, props.dstToken);
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const submitOrderCallback = useCallback(() => {
    return mutateAsync({
      srcAmount: props.isExactAppoval ? amountBN(props.srcToken.decimals, typedSrcAmount) : maxUint256,
      fillDelay,
      deadline: orderDeadline,
      srcChunkAmount: srcTokenChunkSize,
      destTokenMinAmount: destTokenMinAmount,
    });
  }, [mutateAsync, typedSrcAmount, fillDelay, orderDeadline, srcTokenChunkSize, destTokenMinAmount, props.isExactAppoval]);

  return {
    submitOrderCallback,
    submitOrderLoading: isLoading,
  };
};

export function useTwap(props: TwapProps) {
  const sdk = useMemo(() => constructSDK({ config: props.config }), [props.config]);
  const maxChunks = useMaxChunks(sdk, props);
  const { walletClient, publicClient } = useMemo(() => initiateWallet(props.chainId, props.provider), [props.chainId, props.provider]);

  const chunksPanel = useChunksPanel(sdk, props, maxChunks);
  const srcTokenChunkSize = useSrcTokenChunkSize(sdk, props, chunksPanel.chunks);
  const limitPricePanel = useLimitPrice(props);
  const destTokenAmount = useDestTokenAmount(sdk, props, limitPricePanel.limitPrice);
  const destTokenMinAmount = useDestTokenMinAmount(sdk, props, limitPricePanel.limitPrice, srcTokenChunkSize);
  const srcChunkAmountUSD = useSrcChunkAmountUSD(props, srcTokenChunkSize);
  const fillDelayPanel = useFillDelay(sdk, props, chunksPanel.chunks);
  const orderDurationPanel = useOrderDuration(sdk, props, chunksPanel.chunks, fillDelayPanel.fillDelay);
  const orderDeadline = useOrderDeadline(sdk, props, orderDurationPanel.orderDuration);
  const orderDurationError = useOrderDurationError(sdk, orderDurationPanel.orderDuration);
  const fillDelayError = useFillDelayError(sdk, fillDelayPanel.fillDelay, chunksPanel.chunks);
  const tradeSizeError = useTradeSizeError(sdk, props.srcUsd1Token, sdk.config.minChunkSizeUsd);
  const chunksError = useChunksError(sdk, props, chunksPanel.chunks, maxChunks);
  const limitPriceError = useLimitPriceError();
  const srcAmountError = useSrcAmountError();
  const submitOrderPanel = useSubmitOrderPanel({
    sdk,
    props,
    walletClient,
    publicClient,
    fillDelay: fillDelayPanel.fillDelay,
    orderDeadline,
    srcTokenChunkSize,
    destTokenMinAmount,
  });

  const ordersQuery = useOrdersQuery(sdk, publicClient, props.account);
  return {
    sdk,
    ordersQuery,
    errors: {
      chunksError,
      limitPriceError,
      orderDurationError,
      fillDelayError,
      tradeSizeError,
      srcAmountError,
    },
    panels: {
      limitPricePanel,
      fillDelayPanel,
      orderDurationPanel,
      chunksPanel,
      submitOrderPanel,
    },
  };
}
