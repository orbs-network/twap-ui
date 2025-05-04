import { useCallback } from "react";
import { useTwapContext } from "../context";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Token } from "../types";
import { BaseHooks } from "./base-hooks";

const useMinChunkSizeUsd = () => {
  const { twapSDK, publicClient, customMinChunkSizeUsd } = useTwapContext();
  const getMinChunksSizeUSD = BaseHooks.useGetMinChunkSizeUsd(twapSDK, publicClient, customMinChunkSizeUsd);

  return (
    useQuery({
      queryKey: ["useMinChunkSizeUsd", twapSDK.config.chainId],
      queryFn: getMinChunksSizeUSD,
      enabled: !!publicClient && !!twapSDK.config,
      staleTime: 60_000,
    }).data || 0
  );
};

const useSrcAmount = () => {
  const {
    state: { typedSrcAmount },
    srcToken,
    translations: t,
  } = useTwapContext();

  return BaseHooks.useSrcAmount(t, typedSrcAmount, srcToken);
};

const useHasAllowanceCallback = () => {
  const { account, twapSDK, publicClient } = useTwapContext();
  const getHasAllowanceCallback = BaseHooks.useHasAllowanceCallback(twapSDK, account, publicClient);

  return useMutation({
    mutationFn: async ({ token, amount }: { token: Token; amount: string }) => {
      return getHasAllowanceCallback(token, amount);
    },
  });
};

const useLimitPrice = () => {
  const { state, dstToken, marketPrice, updateState, translations: t } = useTwapContext();

  return BaseHooks.useLimitPrice(state, updateState, t, dstToken, marketPrice);
};

const useMaxChunks = () => {
  const {
    twapSDK,
    state: { typedSrcAmount },
    srcUsd1Token,
  } = useTwapContext();
  const minChunkSizeUsd = useMinChunkSizeUsd();

  return BaseHooks.useMaxChunks(twapSDK, minChunkSizeUsd, typedSrcAmount, srcUsd1Token);
};

const useChunks = () => {
  const {
    twapSDK,
    state: { typedChunks },
    isLimitPanel,
    updateState,
    translations: t,
  } = useTwapContext();
  const maxChunks = useMaxChunks();
  const minChunkSizeUsd = useMinChunkSizeUsd();

  return BaseHooks.useChunks(twapSDK, updateState, t, minChunkSizeUsd, typedChunks, maxChunks, isLimitPanel);
};

const useSrcTokenChunkAmount = () => {
  const {
    twapSDK,
    srcToken,
    state: { typedSrcAmount },
    srcUsd1Token,
  } = useTwapContext();
  const minChunkSizeUsd = useMinChunkSizeUsd();
  const { chunks } = useChunks();
  const t = useTwapContext().translations;

  return BaseHooks.useSrcTokenChunkAmount(twapSDK, t, minChunkSizeUsd, typedSrcAmount, chunks, srcUsd1Token, srcToken);
};

const useDestTokenAmount = () => {
  const { twapSDK, srcToken, dstToken } = useTwapContext();
  const srcAmountWei = useSrcAmount().amountWei;
  const limitPrice = useLimitPrice().amountWei;

  return BaseHooks.useDestTokenAmount(twapSDK, srcAmountWei, limitPrice, srcToken, dstToken);
};

const useDestTokenMinAmount = () => {
  const {
    twapSDK,
    srcToken,
    dstToken,
    state: { isMarketOrder },
  } = useTwapContext();
  const limitPrice = useLimitPrice().amountWei;
  const srcTokenChunkAmount = useSrcTokenChunkAmount().amountWei;

  return BaseHooks.useDestTokenMinAmount(twapSDK, limitPrice, srcTokenChunkAmount, srcToken, dstToken, isMarketOrder);
};

const usePriceDiffFromMarketPercent = () => {
  const {
    marketPrice,
    state: { isInvertedPrice },
  } = useTwapContext();
  const limitPrice = useLimitPrice().amountWei;
  return BaseHooks.usePriceDiffFromMarketPercent(marketPrice, limitPrice, isInvertedPrice);
};

const useMaxSrcInputAmount = () => {
  const { srcToken, twapSDK, srcBalance } = useTwapContext();

  return BaseHooks.useMaxSrcInputAmount(twapSDK, srcToken, srcBalance);
};

const useSrcChunkAmountUSD = () => {
  const { srcUsd1Token } = useTwapContext();

  const srcChunksAmountUI = useSrcTokenChunkAmount().amountUI;
  return BaseHooks.useSrcChunkAmountUSD(srcChunksAmountUI, srcUsd1Token);
};

const useBalanceError = () => {
  const maxSrcInputAmount = useMaxSrcInputAmount();
  const { translations: t, srcBalance } = useTwapContext();
  const srcAmountWei = useSrcAmount().amountWei;

  return BaseHooks.useBalanceError(t, srcAmountWei, maxSrcInputAmount, srcBalance);
};

const useShouldOnlyWrap = () => {
  const { srcToken, dstToken, twapSDK } = useTwapContext();

  return BaseHooks.useShouldOnlyWrap(twapSDK.config.chainId, srcToken, dstToken);
};

const useShouldUnwrap = () => {
  const { srcToken, dstToken, twapSDK } = useTwapContext();

  return BaseHooks.useShouldUnwrap(twapSDK.config.chainId, srcToken, dstToken);
};

const useShouldWrapOrUnwrapOnly = () => {
  const wrap = useShouldOnlyWrap();
  const unwrap = useShouldUnwrap();

  return wrap || unwrap;
};

const useError = () => {
  const { marketPrice, translations: t } = useTwapContext();
  const balanceError = useBalanceError();
  const chunksError = useChunks().error;
  const fillDelayError = useFillDelay().error;
  const orderDurationError = useOrderDuration().error;
  const tradeSizeError = useSrcTokenChunkAmount().error;
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const srcAmountError = useSrcAmount().error;
  const limitPriceError = useLimitPrice().error;

  return BaseHooks.useError(t, marketPrice, balanceError, chunksError, fillDelayError, orderDurationError, tradeSizeError, shouldWrapOrUnwrapOnly, srcAmountError, limitPriceError);
};
const useNetwork = () => {
  const { twapSDK } = useTwapContext();
  return BaseHooks.useNetwork(twapSDK);
};

const useOrderDeadline = () => {
  const {
    twapSDK,
    state: { currentTime },
  } = useTwapContext();
  const orderDuration = useOrderDuration().orderDuration;
  return BaseHooks.useOrderDeadline(twapSDK, orderDuration, currentTime);
};

const useFillDelay = () => {
  const { twapSDK, isLimitPanel, state, updateState, translations: t } = useTwapContext();
  const chunks = useChunks().chunks;

  return BaseHooks.useFillDelay(twapSDK, state, updateState, t, chunks, isLimitPanel);
};

const useOrderName = (isMarketOrder = false, chunks = 1) => {
  const { translations: t } = useTwapContext();
  return BaseHooks.useOrderName(t, isMarketOrder, chunks);
};
const useOrderDuration = () => {
  const { twapSDK, state, updateState, translations: t } = useTwapContext();
  const { chunks } = useChunks();
  const { fillDelay } = useFillDelay();

  return BaseHooks.useOrderDuration(twapSDK, state, updateState, t, chunks, fillDelay);
};

const useOnOpenConfirmationModal = () => {
  const { updateState, state, srcToken, dstToken} = useTwapContext();
  const orderName = useOrderName();
  const dstAmount = useDestTokenAmount().amountUI;
  return BaseHooks.useOnOpenConfirmationModal(state, updateState, orderName, dstAmount, srcToken, dstToken);
};

const useOnCloseConfirmationModal = () => {
  const { updateState, state, reset } = useTwapContext();

  return BaseHooks.useOnCloseConfirmationModal(state, updateState, reset);
};

const useTransactionExplorerLink = (txHash?: string) => {
  const { twapSDK } = useTwapContext();
  return BaseHooks.useTransactionExplorerLink(twapSDK, txHash);
};

const useOnSrcInputPercentClick = () => {
  const { srcToken, updateState, srcBalance } = useTwapContext();

  const maxAmount = useMaxSrcInputAmount();
  return BaseHooks.useOnSrcInputPercentClick(updateState, maxAmount, srcBalance, srcToken);
};

const useSwitchChain = () => {
  const { config, walletClient } = useTwapContext();

  return useCallback(() => {
    (walletClient as any)?.switchChain({ id: config.chainId });
  }, [config, walletClient]);
};

export const WidgetHooks = {
  useMinChunkSizeUsd,
  useSrcAmount,
  useHasAllowanceCallback,
  useLimitPrice,
  useMaxChunks,
  useChunks,
  useSrcTokenChunkAmount,
  useDestTokenAmount,
  useDestTokenMinAmount,
  usePriceDiffFromMarketPercent,
  useMaxSrcInputAmount,
  useSrcChunkAmountUSD,
  useBalanceError,
  useShouldOnlyWrap,
  useShouldUnwrap,
  useShouldWrapOrUnwrapOnly,
  useError,
  useNetwork,
  useOrderDeadline,
  useFillDelay,
  useOrderName,
  useOrderDuration,
  useOnOpenConfirmationModal,
  useOnCloseConfirmationModal,
  useTransactionExplorerLink,
  useOnSrcInputPercentClick,
  useSwitchChain,
};
