import { amountBN, amountUi, eqIgnoreCase, getNetwork, isNativeAddress, networks, TimeDuration } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context";
import { getMinNativeBalance, millisToDays, millisToMinutes, removeCommas } from "../utils";
import BN from "bignumber.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { erc20Abi } from "viem";
import { SwapStatus } from "@orbs-network/swap-ui";
import { TX_GAS_COST } from "../consts";
import { Token } from "../types";

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
  const {
    state: { typedSrcAmount },
    srcToken,
    translations: t,
  } = useTwapContext();

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
      const allowance = await publicClient.readContract({
        address: token.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "allowance",
        args: [account as `0x${string}`, config.twapAddress as `0x${string}`],
      });
      return BN(allowance.toString()).gte(amount);
    },
  });
};

export const useLimitPrice = () => {
  const { state, dstToken, marketPrice, updateState, translations: t } = useTwapContext();
  const amountWei = useMemo(() => {
    if (state.typedPrice === undefined || state.isMarketOrder || !marketPrice) return marketPrice;
    const result = state.isInvertedPrice ? BN(1).div(state.typedPrice).toString() : state.typedPrice;
    return amountBN(dstToken?.decimals, result);
  }, [state.typedPrice, state.isMarketOrder, marketPrice, state.isInvertedPrice, dstToken?.decimals]);

  return {
    amountWei,
    amountUI: useAmountUi(dstToken?.decimals, amountWei),
    onChange: useCallback((typedPrice?: string) => updateState({ typedPrice: typedPrice ? removeCommas(typedPrice) : typedPrice }), [updateState]),
    error: state.typedPrice !== undefined && BN(state.typedPrice || 0).isZero() ? t.enterLimitPrice : undefined,
  };
};

export const useMaxChunks = () => {
  const {
    twapSDK,
    state: { typedSrcAmount },
    srcUsd1Token,
  } = useTwapContext();
  const minChunkSizeUsd = useMinChunkSizeUsd();

  return useMemo(() => twapSDK.getMaxChunks(typedSrcAmount || "", srcUsd1Token || 0, minChunkSizeUsd || 0), [typedSrcAmount, srcUsd1Token, twapSDK]);
};

export const useChunks = () => {
  const {
    twapSDK,
    state: { typedChunks },
    isLimitPanel,
    updateState,
  } = useTwapContext();
  const maxChunks = useMaxChunks();
  const t = useTwapContext().translations;

  const chunks = useMemo(() => twapSDK.getChunks(maxChunks, Boolean(isLimitPanel), typedChunks), [maxChunks, typedChunks, isLimitPanel, twapSDK]);
  const error = useMemo(() => {
    const { isError, value } = twapSDK.getMaxChunksError(chunks, maxChunks, Boolean(isLimitPanel));
    if (!isError) return undefined;
    return t.maxChunksError.replace("{maxChunks}", value.toString());
  }, [chunks, twapSDK, maxChunks, isLimitPanel]);

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
    error,
    setChunks,
  };
};

export const useSrcTokenChunkAmount = () => {
  const {
    twapSDK,
    srcToken,
    state: { typedSrcAmount },
    srcUsd1Token,
  } = useTwapContext();
  const minChunkSizeUsd = useMinChunkSizeUsd();
  const { chunks } = useChunks();
  const t = useTwapContext().translations;
  const srcAmountWei = useSrcAmount().amountWei;
  const amountWei = useMemo(() => twapSDK.getSrcTokenChunkAmount(srcAmountWei || "", chunks), [twapSDK, srcAmountWei, chunks]);
  const error = useMemo(() => {
    const { isError, value } = twapSDK.getMinTradeSizeError(typedSrcAmount || "", srcUsd1Token || 0, minChunkSizeUsd || 0);

    if (!isError) return undefined;
    return t.minTradeSizeError.replace("{minTradeSize}", `${value} USD`);
  }, [twapSDK, typedSrcAmount, srcUsd1Token, minChunkSizeUsd]);
  return {
    amountWei,
    amountUI: useAmountUi(srcToken?.decimals, amountWei),
    error,
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
  const {
    twapSDK,
    srcToken,
    dstToken,
    state: { isMarketOrder },
  } = useTwapContext();
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
  const {
    marketPrice,
    state: { isInvertedPrice },
  } = useTwapContext();
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
  const { srcToken, dstToken } = useTwapContext();
  const network = useNetwork();

  return useMemo(() => {
    if (!srcToken || !dstToken || !network) return false;
    return isNativeAddress(srcToken?.address || "") && eqIgnoreCase(dstToken?.address || "", network?.wToken.address || "");
  }, [srcToken, dstToken, network]);
};

export const useShouldUnwrap = () => {
  const { srcToken, dstToken } = useTwapContext();
  const network = useNetwork();

  return useMemo(() => {
    if (!srcToken || !dstToken || !network) return false;

    return eqIgnoreCase(srcToken?.address || "", network?.wToken.address || "") && isNativeAddress(dstToken?.address || "");
  }, [srcToken, dstToken, network]);
};

export const useShouldWrapOrUnwrapOnly = () => {
  const wrap = useShouldOnlyWrap();
  const unwrap = useShouldUnwrap();

  return wrap || unwrap;
};

export const useError = () => {
  const { marketPrice } = useTwapContext();
  const balanceError = useBalanceError();
  const chunksError = useChunks().error;
  const fillDelayError = useFillDelay().error;
  const tradeSizeError = useSrcTokenChunkAmount().error;
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const srcAmountError = useSrcAmount().error;
  const limitPriceError = useLimitPrice().error;

  if (shouldWrapOrUnwrapOnly) {
    return srcAmountError || balanceError;
  }

  if (BN(marketPrice || 0).isZero()) return;

  return srcAmountError || limitPriceError || chunksError || fillDelayError || tradeSizeError || balanceError;
};

export const useNetwork = () => {
  const { config } = useTwapContext();
  return useMemo(() => getNetwork(config.chainId), [config]);
};

export const useOrderDeadline = () => {
  const {
    twapSDK,
    state: { currentTime },
  } = useTwapContext();
  const orderDuration = useOrderDuration().orderDuration;
  // return moment().add("3", "month").valueOf();
  return useMemo(() => twapSDK.getOrderDeadline(currentTime, orderDuration), [twapSDK, currentTime, orderDuration]);
};

export const useFillDelay = () => {
  const {
    twapSDK,
    isLimitPanel,
    state: { typedFillDelay },
    updateState,
    translations: t,
  } = useTwapContext();
  const fillDelay = useMemo(() => twapSDK.getFillDelay(Boolean(isLimitPanel), typedFillDelay), [isLimitPanel, typedFillDelay, twapSDK]);
  const chunks = useChunks().chunks;
  const maxFillDelayError = useMemo(() => {
    const { isError, value } = twapSDK.getMaxFillDelayError(fillDelay, chunks);
    if (!isError) return undefined;
    return t.maxFillDelayError.replace("{fillDelay}", `${Math.floor(millisToDays(value)).toFixed(0)} ${t.days}`);
  }, [fillDelay, twapSDK, chunks]);

  const minFillDelayError = useMemo(() => {
    const { isError, value } = twapSDK.getMinFillDelayError(fillDelay);
    if (!isError) return undefined;
    return t.minFillDelayError.replace("{fillDelay}", `${millisToMinutes(value)} ${t.minutes}`);
  }, [fillDelay, twapSDK]);

  return {
    fillDelay,
    setFillDelay: useCallback((typedFillDelay: TimeDuration) => updateState({ typedFillDelay }), [updateState]),
    error: maxFillDelayError || minFillDelayError,
    milliseconds: fillDelay.unit * fillDelay.value,
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
  const {
    twapSDK,
    state: { typedDuration },
    updateState,
  } = useTwapContext();
  const { chunks } = useChunks();
  const { fillDelay } = useFillDelay();

  const orderDuration = useMemo(() => twapSDK.getOrderDuration(chunks, fillDelay, typedDuration), [chunks, fillDelay, typedDuration, twapSDK]);

  return {
    orderDuration,
    milliseconds: orderDuration.unit * orderDuration.value,
    setOrderDuration: useCallback((typedDuration: TimeDuration) => updateState({ typedDuration }), [updateState]),
  };
};

export const useOnOpenConfirmationModal = () => {
  const {
    updateState,
    state: { typedSrcAmount, swapStatus, isMarketOrder },
    srcToken,
    dstToken,
  } = useTwapContext();
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
  const {
    updateState,
    state: { swapStatus },
    reset,
  } = useTwapContext();

  return useCallback(() => {
    updateState({ showConfirmation: false });
    if (swapStatus === SwapStatus.SUCCESS) {
      reset();
    }

    if (swapStatus === SwapStatus.FAILED) {
      updateState({ swapStatus: undefined, activeStep: undefined, currentStepIndex: 0 });
    }
  }, [reset, updateState, swapStatus]);
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
    if (!amount || !usd || BN(amount || "0").isZero() || BN(usd || "0").isZero()) return 0;
    return BN(amount || "0")
      .times(usd)
      .toNumber();
  }, [amount, usd]);
};

export const useOnSrcInputPercentClick = () => {
  const { srcToken, updateState, srcBalance } = useTwapContext();

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
