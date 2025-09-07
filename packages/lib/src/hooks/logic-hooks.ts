import { amountBN, amountUi, getNetwork, isNativeAddress, networks, TimeDuration } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context";
import { getMinNativeBalance, getOrderType, millisToDays, millisToMinutes, removeCommas, shouldUnwrapOnly, shouldWrapOnly } from "../utils";
import BN from "bignumber.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { SwapStatus } from "@orbs-network/swap-ui";
import { TX_GAS_COST } from "../consts";
import { InputError, InputErrors, Provider, State, Token } from "../types";
import { useTwapStore } from "../useTwapStore";
import * as chains from "viem/chains";
import { getAllowance } from "../lib";

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
  const { srcToken, translations: t } = useTwapContext();

  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);

  return {
    amountWei: useAmountBN(srcToken?.decimals, typedSrcAmount),
    amountUI: typedSrcAmount,
    error: BN(typedSrcAmount || 0).isZero() ? t.enterAmount : undefined,
  };
};

export const useHasAllowanceCallback = () => {
  const { account, config, publicClient } = useTwapContext();

  return useMutation({
    mutationFn: async ({ token, amount }: { token: Token; amount: string }) => {
      if (!publicClient) throw new Error("publicClient is not defined");
      if (!account) throw new Error("account is not defined");
      const allowance = await getAllowance(token.address, account, config.twapAddress, publicClient);

      return BN(allowance).gte(amount);
    },
  });
};

export const useLimitPrice = () => {
  const { dstToken, marketPrice } = useTwapContext();
  const typedPrice = useTwapStore((s) => s.state.typedPrice);
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);
  const updateState = useTwapStore((s) => s.updateState);
  const amountWei = useMemo(() => {
    if (typedPrice === undefined || isMarketOrder || !marketPrice) return marketPrice;
    const result = isInvertedPrice ? BN(1).div(typedPrice).toFixed() : typedPrice;
    return amountBN(dstToken?.decimals, result);
  }, [typedPrice, isMarketOrder, marketPrice, isInvertedPrice, dstToken?.decimals]);

  return {
    amountWei,
    amountUI: useAmountUi(dstToken?.decimals, amountWei),
    onChange: useCallback((typedPrice?: string) => updateState({ typedPrice: typedPrice ? removeCommas(typedPrice) : typedPrice }), [updateState]),
  };
};

export const useMaxChunks = () => {
  const { twapSDK, srcUsd1Token } = useTwapContext();
  const minChunkSizeUsd = useMinChunkSizeUsd();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);

  return useMemo(() => twapSDK.getMaxChunks(typedSrcAmount || "", srcUsd1Token || "", minChunkSizeUsd || 0), [typedSrcAmount, srcUsd1Token, twapSDK]);
};

export const useChunks = () => {
  const { twapSDK, isLimitPanel } = useTwapContext();
  const typedChunks = useTwapStore((s) => s.state.typedChunks);
  const updateState = useTwapStore((s) => s.updateState);
  const maxChunks = useMaxChunks();

  const chunks = useMemo(() => twapSDK.getChunks(maxChunks, Boolean(isLimitPanel), typedChunks), [maxChunks, typedChunks, isLimitPanel, twapSDK]);

  const setChunks = useCallback(
    (typedChunks: number) => {
      updateState({
        typedChunks,
      });
    },
    [updateState],
  );

  return {
    chunks,
    setChunks,
  };
};

/// ---errors---- ////

export const useLimitPriceError = () => {
  const { translations: t } = useTwapContext();
  const typedPrice = useTwapStore((s) => s.state.typedPrice);
  return useMemo((): InputError | undefined => {
    if (typedPrice !== undefined && BN(typedPrice || 0).isZero()) {
      return {
        type: InputErrors.MISSING_LIMIT_PRICE,
        value: typedPrice,
        message: t.enterLimitPrice,
      };
    }
  }, [typedPrice, t]);
};

export const useChunksError = () => {
  const chunks = useChunks().chunks;
  const { twapSDK, isLimitPanel } = useTwapContext();
  const maxChunks = useMaxChunks();
  const t = useTwapContext().translations;

  return useMemo((): InputError | undefined => {
    if (!chunks) {
      return {
        type: InputErrors.MIN_CHUNKS,
        value: 1,
        message: `${t.minChunksError} 1`,
      };
    }
    const { isError } = twapSDK.getMaxChunksError(chunks, maxChunks, Boolean(isLimitPanel));
    if (isError) {
      return {
        type: InputErrors.MAX_CHUNKS,
        value: maxChunks,
        message: t.maxChunksError.replace("{maxChunks}", `${maxChunks}`),
      };
    }
  }, [chunks, twapSDK, maxChunks, isLimitPanel]);
};
export const useStopLoss = () => {
  const { dstToken, marketPrice } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const typedStopLoss = useTwapStore((s) => s.state.typedStopLoss);
  return useMemo(() => {
    const amountWei = amountBN(dstToken?.decimals, typedStopLoss) || marketPrice;
    return {
      amountWei,
      amountUI: amountUi(dstToken?.decimals, amountWei),
      setStopLoss: (typedStopLoss: string) => updateState({ typedStopLoss }),
    };
  }, [typedStopLoss, dstToken?.decimals, marketPrice, updateState]);
};

export const useFillDelayError = () => {
  const { twapSDK, translations: t } = useTwapContext();
  const { chunks } = useChunks();
  const { fillDelay } = useFillDelay();

  const maxFillDelayError = useMemo((): InputError | undefined => {
    const { isError, value } = twapSDK.getMaxFillDelayError(fillDelay, chunks);
    if (!isError) return undefined;
    return {
      type: InputErrors.MAX_FILL_DELAY,
      value: value,
      message: t.maxFillDelayError.replace("{fillDelay}", `${Math.floor(millisToDays(value)).toFixed(0)} ${t.days}`),
    };
  }, [fillDelay, twapSDK, chunks, t]);

  const minFillDelayError = useMemo((): InputError | undefined => {
    const { isError, value } = twapSDK.getMinFillDelayError(fillDelay);
    if (!isError) return undefined;
    return {
      type: InputErrors.MIN_FILL_DELAY,
      value: value,
      message: t.minFillDelayError.replace("{fillDelay}", `${millisToMinutes(value)} ${t.minutes}`),
    };
  }, [fillDelay, twapSDK, t]);

  return maxFillDelayError || minFillDelayError;
};

export const useOrderDurationError = () => {
  const { twapSDK, translations: t } = useTwapContext();
  const { orderDuration } = useOrderDuration();

  return useMemo((): InputError | undefined => {
    const maxError = twapSDK.getMaxOrderDurationError(orderDuration);
    const minError = twapSDK.getMinOrderDurationError(orderDuration);

    if (maxError.isError) {
      return {
        type: InputErrors.MAX_ORDER_DURATION,
        value: maxError.value,
        message: t.maxDurationError.replace("{duration}", `${Math.floor(millisToDays(maxError.value)).toFixed(0)} ${t.days}`),
      };
    }
    if (minError.isError) {
      return {
        type: InputErrors.MIN_ORDER_DURATION,
        value: minError.value,
        message: t.minDurationError.replace("{duration}", `${Math.floor(millisToMinutes(minError.value)).toFixed(0)} ${t.minutes}`),
      };
    }
  }, [orderDuration, twapSDK, t]);
};
export const useMinTradeSizeError = () => {
  const { twapSDK, translations: t } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const srcUsd1Token = useTwapContext().srcUsd1Token;
  const minChunkSizeUsd = useMinChunkSizeUsd();

  return useMemo((): InputError | undefined => {
    const { isError, value } = twapSDK.getMinTradeSizeError(typedSrcAmount || "", srcUsd1Token || "", minChunkSizeUsd || 0);

    if (isError) {
      return {
        type: InputErrors.MIN_TRADE_SIZE,
        value: value,
        message: t.minTradeSizeError.replace("{minTradeSize}", `${value} USD`),
      };
    }
  }, [twapSDK, typedSrcAmount, srcUsd1Token, minChunkSizeUsd]);
};

export const useSrcTokenChunkAmount = () => {
  const { twapSDK, srcToken } = useTwapContext();
  const { chunks } = useChunks();
  const srcAmountWei = useSrcAmount().amountWei;
  const amountWei = useMemo(() => twapSDK.getSrcTokenChunkAmount(srcAmountWei || "", chunks), [twapSDK, srcAmountWei, chunks]);

  return {
    amountWei,
    amountUI: useAmountUi(srcToken?.decimals, amountWei),
  };
};

export const useDestTokenAmount = () => {
  const { twapSDK, srcToken, dstToken } = useTwapContext();
  const srcAmountWei = useSrcAmount().amountWei;

  const limitPrice = useLimitPrice().amountWei;
  const amountWei = useMemo(
    () => twapSDK.getDestTokenAmount(srcAmountWei || "", limitPrice || "", srcToken?.decimals || 0),
    [twapSDK, srcAmountWei, limitPrice, srcToken?.decimals],
  );
  return {
    amountWei,
    amountUI: useAmountUi(dstToken?.decimals, amountWei),
  };
};

export const useDestTokenMinAmount = () => {
  const { twapSDK, srcToken, dstToken } = useTwapContext();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const limitPrice = useLimitPrice().amountWei;
  const srcTokenChunkAmount = useSrcTokenChunkAmount().amountWei;
  const amountWei = useMemo(
    () => twapSDK.getDestTokenMinAmount(srcTokenChunkAmount, limitPrice || "", Boolean(isMarketOrder), srcToken?.decimals || 0),
    [twapSDK, srcTokenChunkAmount, limitPrice, isMarketOrder, srcToken?.decimals],
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
      return "";
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
  return useMemo(() => {
    if (!srcUsd1Token) return "0";
    return BN(srcChunksAmountUI || "0")
      .times(srcUsd1Token || 0)
      .toString();
  }, [srcChunksAmountUI, srcUsd1Token]);
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

export const useInputsError = () => {
  const { marketPrice, marketPriceLoading, srcUsd1Token } = useTwapContext();
  const srcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const chunksError = useChunksError();
  const fillDelayError = useFillDelayError();
  const orderDurationError = useOrderDurationError();
  const tradeSizeError = useMinTradeSizeError();
  const limitPriceError = useLimitPriceError();

  if (BN(marketPrice || 0).isZero() || BN(srcAmount || 0).isZero() || marketPriceLoading || !srcUsd1Token) return;

  return limitPriceError || chunksError || fillDelayError || tradeSizeError || orderDurationError;
};

export const useNetwork = () => {
  const { config } = useTwapContext();
  return useMemo(() => getNetwork(config.chainId), [config]);
};

export const useOrderDeadline = () => {
  const { twapSDK } = useTwapContext();
  const currentTime = useTwapStore((s) => s.state.currentTime);
  const orderDuration = useOrderDuration().orderDuration;
  const deadline = useMemo(() => twapSDK.getOrderDeadline(currentTime, orderDuration), [twapSDK, currentTime, orderDuration]);

  return deadline;
};

export const useFillDelay = () => {
  const { twapSDK, isLimitPanel } = useTwapContext();
  const typedFillDelay = useTwapStore((s) => s.state.typedFillDelay);
  const updateState = useTwapStore((s) => s.updateState);
  const fillDelay = useMemo(() => twapSDK.getFillDelay(Boolean(isLimitPanel), typedFillDelay), [isLimitPanel, typedFillDelay, twapSDK]);

  return {
    fillDelay,
    setFillDelay: useCallback((typedFillDelay: TimeDuration) => updateState({ typedFillDelay }), [updateState]),
  };
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
  const { fillDelay } = useFillDelay();
  const typedDuration = useTwapStore((s) => s.state.typedDuration);
  const updateState = useTwapStore((s) => s.updateState);
  const orderDuration = useMemo(() => twapSDK.getOrderDuration(chunks, fillDelay, typedDuration), [chunks, fillDelay, typedDuration, twapSDK]);

  return {
    orderDuration,
    setOrderDuration: useCallback((typedDuration: TimeDuration) => updateState({ typedDuration }), [updateState]),
  };
};

export const useOnOpenConfirmationModal = () => {
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const updateState = useTwapStore((s) => s.updateState);
  const dstAmount = useDestTokenAmount().amountUI;
  return useCallback(() => {
    updateState({ showConfirmation: true });
    if (swapStatus === SwapStatus.LOADING) return;
    updateState({
      swapStatus: undefined,
      acceptedDstAmount: dstAmount,
    });
  }, [updateState, dstAmount, swapStatus]);
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

export const useResetState = (partialState?: Partial<State>) => {
  const updateState = useTwapStore((s) => s.updateState);
  return useCallback(() => {
    updateState({
      ...(partialState || {}),
    });
  }, [updateState, partialState]);
};

export const useOrderType = () => {
  const { chunks } = useChunks();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  return useMemo(() => getOrderType(isMarketOrder || false, chunks), [chunks, isMarketOrder]);
};
