import { amountBN, amountUi, getNetwork, isNativeAddress, networks, TimeDuration } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context";
import { getMinNativeBalance, millisToDays, millisToMinutes, removeCommas, shouldUnwrapOnly, shouldWrapOnly } from "../utils";
import BN from "bignumber.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { SwapStatus } from "@orbs-network/swap-ui";
import { TX_GAS_COST } from "../consts";
import { Provider, Token } from "../types";
import { useTwapStore } from "../useTwapStore";
import * as chains from "viem/chains";
import lib, { InputErrors } from "../lib/lib";

const abi = [{ inputs: [], name: "latestAnswer", outputs: [{ internalType: "int256", name: "", type: "int256" }], stateMutability: "view", type: "function" }];

const addressMap = {
  [networks.eth.id]: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
};

export const useMinChunkSizeUsd = () => {
  const { config, publicClient, customMinChunkSizeUsd } = useTwapContext();
  const address = addressMap[config.chainId] as `0x${string}`;
  const query = useQuery({
    queryKey: ["useMinChunkSizeUsd", config.chainId],
    queryFn: async () => {
      if (!address) return null;
      const latestAnswer = await publicClient!.readContract({
        address,
        abi,
        functionName: "latestAnswer",
      });

      const ethUsdPrice = BN(latestAnswer as string)
        .div(1e8)
        .toNumber();
      const result = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = result.maxFeePerGas;
      const minChunkSizeUsd = BN(TX_GAS_COST)
        .multipliedBy(maxFeePerGas.toString())
        .multipliedBy(ethUsdPrice || "0")
        .dividedBy(1e18)
        .dividedBy(0.05)
        .decimalPlaces(0)
        .toNumber();
      return minChunkSizeUsd;
    },
    enabled: !!publicClient && !!config,
    staleTime: 60_000,
  });

  if (customMinChunkSizeUsd) {
    return customMinChunkSizeUsd;
  }

  if (!address) {
    return config.minChunkSizeUsd;
  }

  if (query.isLoading) return 0;

  return query.data || config.minChunkSizeUsd;
};

export const useAmountBN = (decimals?: number, value?: string) => {
  return useMemo(() => amountBN(decimals, value), [decimals, value]);
};

export const useAmountUi = (decimals?: number, value?: string) => {
  return useMemo(() => amountUi(decimals, value), [decimals, value]);
};

export const useSrcAmount = () => {
  const { srcToken } = useTwapContext();

  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);

  return {
    amountWei: useAmountBN(srcToken?.decimals, typedSrcAmount),
    amountUI: typedSrcAmount,
  };
};

const useSrcAmountError = () => {
  const { translations: t } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);

  return useMemo(() => {
    return BN(typedSrcAmount || 0).isZero() ? t.enterAmount : undefined;
  }, [t, typedSrcAmount]);
};


export const useLimitPrice = () => {
  const { dstToken, marketPrice } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const state = useTwapStore((s) => s.state);

  const limitPrice = useMemo(() => lib.getLimitPrice(state, dstToken, marketPrice), [state, dstToken, marketPrice]);

  return {
    amountWei: limitPrice,
    amountUI: useAmountUi(dstToken?.decimals, limitPrice),
    onChange: useCallback((typedPrice?: string) => updateState({ typedPrice: typedPrice ? removeCommas(typedPrice) : typedPrice }), [updateState]),
  };
};

export const useMaxChunks = () => {
  const { twapSDK, srcUsd1Token } = useTwapContext();
  const minChunkSizeUsd = useMinChunkSizeUsd();
  const state = useTwapStore((s) => s.state);
  return useMemo(() => lib.getMaxChunks(twapSDK, state, srcUsd1Token, minChunkSizeUsd), [twapSDK, state, srcUsd1Token, minChunkSizeUsd]);
};

export const useChunks = () => {
  const { twapSDK, isLimitPanel } = useTwapContext();
  const maxChunks = useMaxChunks();
  const state = useTwapStore((s) => s.state);
  const updateState = useTwapStore((s) => s.updateState);

  return {
    chunks: useMemo(() => lib.getChunks(twapSDK, state, maxChunks, Boolean(isLimitPanel)), [twapSDK, state, maxChunks, isLimitPanel]),
    setChunks: useCallback((typedChunks: number) => updateState({ typedChunks }), [updateState]),
  };
};

export const useSrcTokenChunkAmount = () => {
  const { twapSDK, srcToken } = useTwapContext();
  const state = useTwapStore((s) => s.state);
  const { chunks } = useChunks();
  const srcTokenChunkSize = useMemo(() => {
    return lib.getSrcTokenChunkSize(twapSDK, state, chunks, srcToken);
  }, [twapSDK, state, chunks, srcToken]);

  return {
    amountWei: srcTokenChunkSize,
    amountUI: useAmountUi(srcToken?.decimals, srcTokenChunkSize),
  };
};

export const useDestTokenAmount = () => {
  const { twapSDK, srcToken, dstToken } = useTwapContext();
  const state = useTwapStore((s) => s.state);
  const limitPrice = useLimitPrice().amountWei;
  const amountWei = useMemo(() => lib.getDestTokenAmount(twapSDK, state, limitPrice, srcToken), [state, twapSDK, limitPrice, srcToken]);
  return {
    amountWei,
    amountUI: useAmountUi(dstToken?.decimals, amountWei),
  };
};

export const useDestTokenMinAmount = () => {
  const { twapSDK, srcToken, dstToken } = useTwapContext();
  const limitPrice = useLimitPrice().amountWei;
  const srcTokenChunkAmount = useSrcTokenChunkAmount().amountWei;
  const state = useTwapStore((s) => s.state);

  const amountWei = useMemo(
    () => lib.getDestTokenMinAmount(twapSDK, state, limitPrice, srcTokenChunkAmount, srcToken),
    [twapSDK, state, limitPrice, srcTokenChunkAmount, srcToken],
  );

  return {
    amountWei,
    amountUI: useAmountUi(dstToken?.decimals, amountWei),
  };
};

export const usePriceDiffFromMarketPercent = () => {
  const { marketPrice } = useTwapContext();
  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);
  const limitPrice = useLimitPrice().amountWei;
  return useMemo(() => {
    // Validate inputs
    if (!limitPrice || !marketPrice || BN(limitPrice).isZero() || BN(marketPrice).isZero()) {
      return "0";
    }

    // Determine comparison direction
    const from = isInvertedPrice ? marketPrice : limitPrice;
    const to = isInvertedPrice ? limitPrice : marketPrice;

    // Calculate percentage difference
    return BN(from).div(to).minus(1).multipliedBy(100).decimalPlaces(2, BN.ROUND_UP).toFixed();
  }, [limitPrice, marketPrice, isInvertedPrice]);
};

export const useMaxSrcInputAmount = () => {
  const { srcToken, config, srcBalance } = useTwapContext();

  return useMemo(() => {
    if (srcBalance && isNativeAddress(srcToken?.address || "")) {
      const srcTokenMinimum = amountBN(srcToken?.decimals, getMinNativeBalance(config.chainId).toString());
      return BN.max(0, BN.min(BN(srcBalance).minus(srcTokenMinimum))).toString();
    }
  }, [srcToken, srcBalance, config.chainId]);
};

export const useSrcChunkAmountUSD = () => {
  const { srcUsd1Token } = useTwapContext();
  const srcChunksAmountUI = useSrcTokenChunkAmount().amountUI;
  return useMemo(() => lib.getSrcChunkAmountUSD(srcUsd1Token, srcChunksAmountUI), [srcUsd1Token, srcChunksAmountUI]);
};

export const useBalanceError = () => {
  const maxSrcInputAmount = useMaxSrcInputAmount();
  const { translations: t, srcBalance } = useTwapContext();
  const srcAmountWei = useSrcAmount().amountWei;

  return useMemo(() => {
    const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && BN(srcAmountWei)?.gt(maxSrcInputAmount);

    if ((srcBalance && BN(srcAmountWei).gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return t.insufficientFunds;
    }
  }, [srcBalance?.toString(), srcAmountWei, maxSrcInputAmount?.toString(), t]);
};

export const useShouldOnlyWrap = () => {
  const { srcToken, dstToken, chainId } = useTwapContext();

  return useMemo(() => {
    return shouldWrapOnly(srcToken, dstToken, chainId);
  }, [srcToken, dstToken, chainId]);
};

export const useShouldUnwrap = () => {
  const { srcToken, dstToken, chainId } = useTwapContext();

  return useMemo(() => {
    return shouldUnwrapOnly(srcToken, dstToken, chainId);
  }, [srcToken, dstToken, chainId]);
};

export const useShouldWrapOrUnwrapOnly = () => {
  const wrap = useShouldOnlyWrap();
  const unwrap = useShouldUnwrap();

  return wrap || unwrap;
};

export const useChunksError = () => {
  const { twapSDK, isLimitPanel, translations: t } = useTwapContext();
  const maxChunks = useMaxChunks();
  const chunks = useChunks().chunks;
  const error = useMemo(() => lib.getChunksError(twapSDK, chunks, maxChunks, Boolean(isLimitPanel)), [twapSDK, chunks, maxChunks, isLimitPanel]);

  return useMemo(() => {
    if (error?.type === InputErrors.MIN_CHUNKS_ERROR) {
      return `${t.minChunksError} 1`;
    }
    if (error?.type === InputErrors.MAX_CHUNKS_ERROR) {
      return t.maxChunksError.replace("{maxChunks}", maxChunks.toString());
    }
  }, [error, t]);
};

export const useLimitPriceError = () => {
  const { translations: t } = useTwapContext();
  const state = useTwapStore((s) => s.state);
  const error = useMemo(() => lib.getLimitPriceError(state), [state]);
  return useMemo(() => {
    if (error === InputErrors.EMPTY_LIMIT_PRICE) {
      return t.enterLimitPrice;
    }
  }, [error, t]);
  return error;
};

export const useTradeSizeError = () => {
  const { twapSDK, srcUsd1Token, translations: t } = useTwapContext();
  const minChunkSizeUsd = useMinChunkSizeUsd();
  const state = useTwapStore((s) => s.state);
  const error = useMemo(() => lib.getTradeSizeError(twapSDK, state, srcUsd1Token, minChunkSizeUsd), [twapSDK, state, srcUsd1Token, minChunkSizeUsd]);
  console.log({ error });

  const errorText = useMemo(() => {
    if (error?.type === InputErrors.MIN_TRADE_SIZE_ERROR) {
      return `${t.minTradeSizeError} ${minChunkSizeUsd}`;
    }
  }, [error, minChunkSizeUsd, t]);

  return errorText;
};

export const useOrderDurationError = () => {
  const { translations: t, twapSDK } = useTwapContext();
  const orderDuration = useOrderDuration().orderDuration;

  return useMemo(() => {
    const error = lib.getOrderDurationError(twapSDK, orderDuration);

    if (error?.type === InputErrors.MAX_DURATION_ERROR) {
      return t.maxDurationError.replace("{duration}", `${Math.floor(millisToDays(error.value)).toFixed(0)} ${t.days}`);
    }
  }, [t]);
};

export const useError = () => {
  const { marketPrice, isLimitPanel } = useTwapContext();
  const balanceError = useBalanceError();
  const chunksError = useChunksError();
  const fillDelayError = useFillDelayError();
  const orderDurationError = useOrderDurationError();
  const tradeSizeError = useTradeSizeError();
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const srcAmountError = useSrcAmountError();
  const limitPriceError = useLimitPriceError();

  if (shouldWrapOrUnwrapOnly) {
    return srcAmountError || balanceError;
  }

  if (BN(marketPrice || 0).isZero()) return;

  return srcAmountError || limitPriceError || chunksError || fillDelayError || tradeSizeError || balanceError || (isLimitPanel && orderDurationError);
};

export const useNetwork = () => {
  const { config } = useTwapContext();
  return useMemo(() => getNetwork(config.chainId), [config]);
};

export const useOrderDeadline = () => {
  const { twapSDK } = useTwapContext();
  const orderDuration = useOrderDuration().orderDuration;
  const state = useTwapStore((s) => s.state);
  return useMemo(() => lib.getOrderDeadline(twapSDK, state, orderDuration), [twapSDK, state, orderDuration]);
};

export const useFillDelay = () => {
  const { twapSDK, isLimitPanel } = useTwapContext();
  const state = useTwapStore((s) => s.state);
  const updateState = useTwapStore((s) => s.updateState);
  const chunks = useChunks().chunks;
  const fillDelay = useMemo(() => lib.getFillDelay(twapSDK, state, chunks, Boolean(isLimitPanel)), [twapSDK, state, chunks, isLimitPanel]);

  return {
    fillDelay,
    setFillDelay: useCallback((typedFillDelay: TimeDuration) => updateState({ typedFillDelay }), [updateState]),
    milliseconds: fillDelay.unit * fillDelay.value,
  };
};

export const useFillDelayError = () => {
  const { translations: t, twapSDK } = useTwapContext();
  const chunks = useChunks().chunks;
  const fillDelay = useFillDelay().fillDelay;
  const error = useMemo(() => lib.getFillDelayError(twapSDK, fillDelay, chunks), [twapSDK, chunks, fillDelay]);

  return useMemo(() => {
    if (error?.type === InputErrors.MAX_FILL_DELAY_ERROR) {
      return t.maxFillDelayError.replace("{fillDelay}", `${Math.floor(millisToDays(error.value)).toFixed(0)} ${t.days}`);
    }
    if (error?.type === InputErrors.MIN_FILL_DELAY_ERROR) {
      return t.minFillDelayError.replace("{fillDelay}", `${millisToMinutes(error.value)} ${t.minutes}`);
    }
  }, [error, t]);
};

export const useOrderName = (isMarketOrder = false, chunks = 1) => {
  const { translations: t } = useTwapContext();
  return useMemo(() => {
    if (isMarketOrder) {
      return t.twapMarket;
    }
    if (chunks === 1) {
      return t.limit;
    }
    return t.twapLimit;
  }, [t, isMarketOrder, chunks]);
};
export const useOrderDuration = () => {
  const { twapSDK } = useTwapContext();
  const { chunks } = useChunks();
  const updateState = useTwapStore((s) => s.updateState);
  const state = useTwapStore((s) => s.state);
  const { fillDelay } = useFillDelay();
  const orderDuration = useMemo(() => lib.getOrderDuration(twapSDK, state, chunks, fillDelay), [twapSDK, state, chunks, fillDelay]);

  return {
    orderDuration,
    milliseconds: orderDuration.unit * orderDuration.value,
    setOrderDuration: useCallback((typedDuration: TimeDuration) => updateState({ typedDuration }), [updateState]),
  };
};

export const useOnOpenConfirmationModal = () => {
  const { srcToken, dstToken } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const updateState = useTwapStore((s) => s.updateState);
  const chunks = useChunks().chunks;
  const dstAmount = useDestTokenAmount().amountUI;
  const orderName = useOrderName(isMarketOrder, chunks);
  return useCallback(() => {
    updateState({ showConfirmation: true });
    if (swapStatus === SwapStatus.LOADING) return;
    updateState({
      swapStatus: undefined,
      // prevent data to change during order creation
      trade: {
        srcAmount: typedSrcAmount,
        dstAmount,
        srcToken,
        dstToken,
        title: orderName,
      },
    });
  }, [updateState, typedSrcAmount, dstAmount, srcToken, dstToken, swapStatus, orderName]);
};

export const useOnCloseConfirmationModal = () => {
  const updateState = useTwapStore((s) => s.updateState);
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const resetState = useTwapStore((s) => s.resetState);

  return useCallback(() => {
    updateState({ showConfirmation: false });
    if (swapStatus === SwapStatus.SUCCESS) {
      resetState();
    }

    if (swapStatus === SwapStatus.FAILED) {
      updateState({ swapStatus: undefined, activeStep: undefined, currentStepIndex: 0 });
    }
  }, [resetState, updateState, swapStatus]);
};

export const useTransactionExplorerLink = (txHash?: string) => {
  const network = useNetwork();
  return useMemo(() => {
    if (!txHash || !network) return undefined;
    return `${network.explorer}/tx/${txHash}`;
  }, [txHash, network]);
};

export const useUsdAmount = (amount?: string, usd?: string | number) => {
  return useMemo(() => {
    if (!amount || !usd || BN(amount || "0").isZero() || BN(usd || "0").isZero()) return "";
    return BN(amount || "0")
      .times(usd)
      .toFixed();
  }, [amount, usd]);
};

export const useOnSrcInputPercentClick = () => {
  const { srcToken, srcBalance } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const maxAmount = useMaxSrcInputAmount();
  return useCallback(
    (percent: number) => {
      if (!srcToken || !srcBalance || BN(srcBalance || 0).isZero()) return;
      const _maxAmount = maxAmount && percent === 1 && BN(maxAmount).gt(0) ? maxAmount : undefined;
      const value = amountUi(srcToken.decimals, _maxAmount || BN(srcBalance).times(percent).toString());
      updateState({ typedSrcAmount: value });
    },
    [maxAmount, srcBalance, updateState, srcToken],
  );
};

export const useSwitchChain = () => {
  const { config, walletClient } = useTwapContext();

  return useCallback(() => {
    (walletClient as any)?.switchChain({ id: config.chainId });
  }, [config, walletClient]);
};

export const useInitiateWallet = (
  chainId?: number,
  provider?: Provider,
): {
  walletClient?: ReturnType<typeof createWalletClient>;
  publicClient?: ReturnType<typeof createPublicClient>;
} => {
  const chain = useMemo(() => Object.values(chains).find((it: any) => it.id === chainId), [chainId]);
  const transport = useMemo(() => (provider ? custom(provider) : undefined), [provider]);
  const walletClient = useMemo(() => {
    return transport ? (createWalletClient({ chain, transport }) as any) : undefined;
  }, [transport]);

  const publicClient = useMemo(() => {
    if (!chain) return;
    return createPublicClient({ chain, transport: transport || http() }) as any;
  }, [transport, chain]);

  return {
    walletClient,
    publicClient,
  };
};
