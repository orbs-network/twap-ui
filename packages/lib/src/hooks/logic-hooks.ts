import { amountBN, amountUi, eqIgnoreCase, getNetwork, isNativeAddress, networks, TimeDuration, TwapAbi } from "@orbs-network/twap-sdk";
import { useMemo, useCallback } from "react";
import { useTwapContext } from "../context";
import { getMinNativeBalance, removeCommas } from "../utils";
import BN from "bignumber.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { erc20Abi } from "viem";
import { SwapStatus } from "@orbs-network/swap-ui";
import { TX_GAS_COST } from "../consts";

const abi = [{ inputs: [], name: "latestAnswer", outputs: [{ internalType: "int256", name: "", type: "int256" }], stateMutability: "view", type: "function" }];

const addressMap = {
  [networks.eth.id]: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
};

export const useMinChunkSizeUsd = () => {
  const { config, publicClient, minChunkSizeUsd: propsMinChunkSizeUsd } = useTwapContext();
  const address = addressMap[config.chainId];
  const query = useQuery({
    queryKey: ["useMinChunkSizeUsd", config.chainId],
    queryFn: async () => {
      if (!address) return null;
      const latestAnswer = await publicClient!.readContract({
        address,
        abi,
        functionName: "latestAnswer",
      });

      const ethUsdPrice = BN(latestAnswer).div(1e8).toNumber();
      const result = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = result.maxFeePerGas;
      const minChunkSizeUsd = BN(TX_GAS_COST)
        .multipliedBy(maxFeePerGas)
        .multipliedBy(ethUsdPrice || "0")
        .dividedBy(1e18)
        .dividedBy(0.05)
        .decimalPlaces(0)
        .toNumber();
      return minChunkSizeUsd;
    },
    enabled: !!publicClient && !!config && !propsMinChunkSizeUsd,
    staleTime: 60_000,
  });

  if (propsMinChunkSizeUsd) {
    return propsMinChunkSizeUsd;
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
  } = useTwapContext();

  return {
    amountWei: useAmountBN(srcToken?.decimals, typedSrcAmount),
    amountUI: typedSrcAmount,
  };
};

export const useHasAllowanceCallback = () => {
  const { account, srcToken, config, publicClient } = useTwapContext();
  const srcAmount = useSrcAmount().amountWei;
  const tokenAddress = useHandleNativeAddress(srcToken?.address);

  return useMutation({
    mutationFn: async () => {
      const allowance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [account, config.twapAddress],
      });
      return BN(allowance).gte(srcAmount);
    },
  });
};

export const useLimitPrice = () => {
  const { state, dstToken, marketPrice, updateState, twapSDK } = useTwapContext();
  const amountWei = useMemo(() => {
    if (state.typedPrice === undefined || state.isMarketOrder || !marketPrice) return marketPrice;
    const result = state.isInvertedPrice ? BN(1).div(state.typedPrice).toString() : state.typedPrice;
    return amountBN(dstToken?.decimals, result);
  }, [state.typedPrice, state.isMarketOrder, marketPrice, state.isInvertedPrice, dstToken?.decimals]);

  const error = useMemo(() => twapSDK.getLimitPriceError(state.typedPrice), [state.typedPrice, twapSDK]);

  return {
    amountWei,
    amountUI: useAmountUi(dstToken?.decimals, amountWei),
    onChange: useCallback((typedPrice?: string) => updateState({ typedPrice: typedPrice ? removeCommas(typedPrice) : undefined }), [updateState]),
    error,
  };
};

export const useMaxChunks = () => {
  const {
    twapSDK,
    state: { typedSrcAmount },
    srcUsd1Token,
    minChunkSizeUsd,
  } = useTwapContext();

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

  const chunks = useMemo(() => twapSDK.getChunks(maxChunks, Boolean(isLimitPanel), typedChunks), [maxChunks, typedChunks, isLimitPanel, twapSDK]);
  const error = useMemo(() => twapSDK.getChunksError(chunks, maxChunks, Boolean(isLimitPanel)), [chunks, twapSDK, maxChunks, isLimitPanel]);
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
    minChunkSizeUsd,
  } = useTwapContext();
  const { chunks } = useChunks();
  const srcAmountWei = useSrcAmount().amountWei;
  const amountWei = useMemo(() => twapSDK.getSrcTokenChunkAmount(srcAmountWei || "", chunks), [twapSDK, srcAmountWei, chunks]);
  const error = useMemo(() => twapSDK.getTradeSizeError(typedSrcAmount || "", srcUsd1Token || 0, minChunkSizeUsd || 0), [twapSDK, typedSrcAmount, srcUsd1Token, minChunkSizeUsd]);
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

export const useShouldWrap = () => {
  const { srcToken } = useTwapContext();

  return useMemo(() => isNativeAddress(srcToken?.address || ""), [srcToken]);
};

export const useError = () => {
  const {
    state: { typedSrcAmount },
    marketPrice = "0",
    translations: t,
  } = useTwapContext();

  const balanceError = useBalanceError();
  const chunksError = useChunks().error?.text;
  const fillDelayError = useFillDelay().error?.text;
  const orderDurationError = useOrderDuration().error?.text;
  const tradeSizeError = useSrcTokenChunkAmount().error?.text;
  const srcAmountError = BN(typedSrcAmount || 0).isZero() ? t.enterAmount : undefined;
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  if (shouldWrapOrUnwrapOnly) {
    return srcAmountError || balanceError;
  }

  if (BN(marketPrice || 0).isZero()) return;

  return srcAmountError || chunksError || fillDelayError || orderDurationError || tradeSizeError || balanceError;
};

export const useNetwork = () => {
  const { config } = useTwapContext();
  return useMemo(() => getNetwork(config.chainId), [config]);
};

export function useHandleNativeAddress(address?: string) {
  const wTokenAddress = useNetwork()?.wToken.address;
  return useMemo(() => {
    if (isNativeAddress(address || "")) {
      return wTokenAddress;
    }
    return address;
  }, [address, wTokenAddress]);
}

export const useOrderDeadline = () => {
  const {
    twapSDK,
    state: { currentTime },
  } = useTwapContext();
  const orderDuration = useOrderDuration().orderDuration;

  return useMemo(() => twapSDK.getOrderDeadline(currentTime, orderDuration), [twapSDK, currentTime, orderDuration]);
};

export function useSubmitOrderArgs() {
  const { srcToken, twapSDK, dstToken } = useTwapContext();
  const srcAmountWei = useSrcAmount().amountWei;
  const destTokenMinAmount = useDestTokenMinAmount().amountWei;
  const srcTokenChunkAmount = useSrcTokenChunkAmount().amountWei;
  const orderDeadline = useOrderDeadline();
  const fillDelay = useFillDelay().fillDelay;

  const srcTokenAddress = useHandleNativeAddress(srcToken?.address);

  return useMemo(() => {
    console.log(dstToken, destTokenMinAmount, srcTokenChunkAmount, orderDeadline, fillDelay, srcAmountWei, srcTokenAddress);

    if (!dstToken || !destTokenMinAmount || !srcTokenChunkAmount || !orderDeadline || !fillDelay || !srcAmountWei || !srcTokenAddress) return;
    const params = twapSDK.getAskArgs({
      destTokenMinAmount,
      srcChunkAmount: srcTokenChunkAmount,
      deadline: orderDeadline,
      fillDelay,
      srcAmount: srcAmountWei,
      srcTokenAddress,
      destTokenAddress: dstToken?.address || "",
    });

    return {
      method: "ask",
      params,
      contract: twapSDK.config.twapAddress,
      abi: TwapAbi,
    };
  }, [twapSDK, srcToken, srcAmountWei, dstToken, destTokenMinAmount, srcTokenChunkAmount, orderDeadline, fillDelay, srcTokenAddress]);
}

export const useFillDelay = () => {
  const {
    twapSDK,
    isLimitPanel,
    state: { typedFillDelay },
    updateState,
  } = useTwapContext();
  const fillDelay = useMemo(() => twapSDK.getFillDelay(Boolean(isLimitPanel), typedFillDelay), [isLimitPanel, typedFillDelay, twapSDK]);

  const error = useMemo(() => twapSDK.getFillDelayError(fillDelay, Boolean(isLimitPanel)), [fillDelay, isLimitPanel, twapSDK]);
  return {
    fillDelay,
    setFillDelay: useCallback((typedFillDelay: TimeDuration) => updateState({ typedFillDelay }), [updateState]),
    error,
    milliseconds: fillDelay.unit * fillDelay.value,
  };
};

export const useOrderDuration = () => {
  const {
    twapSDK,
    state: { typedDuration },
    updateState,
    isLimitPanel,
  } = useTwapContext();
  const { chunks } = useChunks();
  const { fillDelay } = useFillDelay();

  const orderDuration = useMemo(() => twapSDK.getOrderDuration(chunks, fillDelay, typedDuration), [chunks, fillDelay, typedDuration, twapSDK]);
  const error = useMemo(() => twapSDK.getDurationError(orderDuration, Boolean(isLimitPanel)), [orderDuration, twapSDK, isLimitPanel]);

  return {
    orderDuration,
    milliseconds: orderDuration.unit * orderDuration.value,
    setOrderDuration: useCallback((typedDuration: TimeDuration) => updateState({ typedDuration }), [updateState]),
    error,
  };
};

export const useOnOpenConfirmationModal = () => {
  const {
    updateState,
    state: { typedSrcAmount },
  } = useTwapContext();
  const outAmount = useDestTokenAmount().amountUI;
  const { srcUsd, dstUsd } = useUsdAmount();
  return useCallback(() => {
    updateState({
      showConfirmation: true,
      // prevent data to change during order creation
      swapData: {
        srcAmount: typedSrcAmount,
        outAmount,
        srcAmountusd: srcUsd,
        outAmountusd: dstUsd,
      },
    });
  }, [updateState, typedSrcAmount, outAmount, srcUsd, dstUsd]);
};

export const useOnCloseConfirmationModal = () => {
  const {
    updateState,
    state: { swapStatus },
    reset,
    state,
    actions: { onSwitchFromNativeToWrapped },
  } = useTwapContext();

  return useCallback(() => {
    const success = swapStatus === SwapStatus.SUCCESS;
    const failure = swapStatus === SwapStatus.FAILED;
    updateState({ showConfirmation: false });
    if (success) {
      setTimeout(() => {
        reset();
      }, 500);
    }

    if (failure) {
      updateState({ swapStatus: undefined, swapStep: undefined });
    }
    if ((success || failure) && state.isWrapped) {
      onSwitchFromNativeToWrapped?.();
    }
  }, [reset, updateState, onSwitchFromNativeToWrapped, state.isWrapped, swapStatus]);
};

const getUsdAmount = (amount?: string, usd?: string | number) => {
  if (!amount || !usd || BN(amount || "0").isZero() || BN(usd || "0").isZero()) return "0";
  return BN(amount || "0")
    .times(usd)
    .toString();
};
export const useUsdAmount = () => {
  const {
    dstUsd1Token,
    srcUsd1Token,
    state: { typedSrcAmount },
  } = useTwapContext();
  const isWrapOrUnwrap = useShouldWrapOrUnwrapOnly();
  const destTokenAmountUI = useDestTokenAmount().amountUI;

  const srcUsd = useMemo(() => getUsdAmount(typedSrcAmount, srcUsd1Token), [typedSrcAmount, srcUsd1Token]);
  const dstUsd = useMemo(() => getUsdAmount(destTokenAmountUI, dstUsd1Token), [destTokenAmountUI, dstUsd1Token]);

  return {
    srcUsd,
    dstUsd: isWrapOrUnwrap ? srcUsd : dstUsd,
  };
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
