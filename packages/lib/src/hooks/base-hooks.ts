import { amountBN, amountUi, getNetwork, isNativeAddress, networks, Order, TimeDuration, TwapAbi, TwapSDK } from "@orbs-network/twap-sdk";
import { useMemo, useCallback, useEffect, useState } from "react";
import { getMinNativeBalance, getOrderIdFromCreateOrderEvent, isTxRejected, millisToDays, millisToMinutes, removeCommas, shouldUnwrapOnly, shouldWrapOnly } from "../utils";
import BN from "bignumber.js";
import { createPublicClient, erc20Abi, TransactionReceipt, WalletClient } from "viem";
import { SwapStatus } from "@orbs-network/swap-ui";
import { TX_GAS_COST } from "../consts";
import { Callbacks, State, Token, Translations, TwapOrder } from "../types";
import { usePersistedOrdersStore } from "./order-hooks";

const abi = [{ inputs: [], name: "latestAnswer", outputs: [{ internalType: "int256", name: "", type: "int256" }], stateMutability: "view", type: "function" }];

const addressMap = {
  [networks.eth.id]: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
};

const useGetMinChunkSizeUsd = (sdk: TwapSDK, publicClient?: ReturnType<typeof createPublicClient>, customMinChunkSizeUsd?: number) => {
  const address = addressMap[sdk.config.chainId] as `0x${string}`;

  const getMinChunksSizeUSD = useCallback(async () => {
    if (customMinChunkSizeUsd) {
      return customMinChunkSizeUsd;
    }
    if (!address) {
      return sdk.config.minChunkSizeUsd;
    }
    try {
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
    } catch (error) {
      return sdk.config.minChunkSizeUsd;
    }
  }, [address, publicClient, customMinChunkSizeUsd, sdk.config.minChunkSizeUsd]);

  useEffect(() => {
    getMinChunksSizeUSD();
  }, [getMinChunksSizeUSD]);

  return getMinChunksSizeUSD;
};

const useAmountBN = (decimals?: number, value?: string) => {
  return useMemo(() => amountBN(decimals, value), [decimals, value]);
};

const useAmountUi = (decimals?: number, value?: string) => {
  return useMemo(() => amountUi(decimals, value), [decimals, value]);
};

const useSrcAmount = (t: Translations, typedSrcAmount = "", srcToken?: Token) => {
  return {
    amountWei: useAmountBN(srcToken?.decimals, typedSrcAmount),
    amountUI: typedSrcAmount,
    error: BN(typedSrcAmount || 0).isZero() ? t.enterAmount : undefined,
  };
};

const useHasAllowanceCallback = (sdk: TwapSDK, account?: `0x${string}`, publicClient?: ReturnType<typeof createPublicClient>) => {
  return useCallback(
    async (token: Token, amount: string) => {
      if (!publicClient) throw new Error("publicClient is not defined");
      const allowance = await publicClient.readContract({
        address: token.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "allowance",
        args: [account as `0x${string}`, sdk.config.twapAddress as `0x${string}`],
      });
      return BN(allowance.toString()).gte(amount);
    },
    [publicClient, account, sdk.config.twapAddress]
  );
};

const useLimitPrice = (state: State, updateState: (state: Partial<State>) => void, t: Translations, dstToken?: Token, marketPrice?: string) => {
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

const useMaxChunks = (sdk: TwapSDK, minChunkSizeUsd: number, typedSrcAmount = "", srcUsd1Token = 0) => {
  return useMemo(() => sdk.getMaxChunks(typedSrcAmount || "", srcUsd1Token || 0, minChunkSizeUsd || 0), [typedSrcAmount, srcUsd1Token, sdk, minChunkSizeUsd]);
};

const useChunks = (sdk: TwapSDK, updateState: (state: Partial<State>) => void, t: Translations, minChunkSizeUsd: number, typedChunks = 0, maxChunks = 0, isLimitPanel = false) => {
  const chunks = useMemo(() => sdk.getChunks(maxChunks, Boolean(isLimitPanel), typedChunks), [maxChunks, typedChunks, isLimitPanel, sdk]);
  const error = useMemo(() => {
    if (!chunks) {
      return `${t.minChunksError} 1`;
    }
    const { isError } = sdk.getMaxChunksError(chunks, maxChunks, Boolean(isLimitPanel));
    if (!isError) return undefined;
    return t.minTradeSizeError.replace("{minTradeSize}", `${minChunkSizeUsd} USD`);
  }, [chunks, sdk, maxChunks, isLimitPanel]);

  const setChunks = useCallback(
    (typedChunks: number) => {
      updateState({
        typedChunks,
      });
    },
    [updateState]
  );

  return {
    chunks,
    error,
    setChunks,
  };
};

const useSrcTokenChunkAmount = (twapSDK: TwapSDK, t: Translations, minChunkSizeUsd: number, typedSrcAmount = "", chunks = 1, srcUsd1Token = 0, srcToken?: Token) => {
  const srcAmountWei = useAmountBN(srcToken?.decimals, typedSrcAmount);
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

const useDestTokenAmount = (twapSDK: TwapSDK, srcAmountWei = "", limitPriceWei = "", srcToken?: Token, dstToken?: Token) => {
  const amountWei = useMemo(
    () => twapSDK.getDestTokenAmount(srcAmountWei || "", limitPriceWei || "", srcToken?.decimals || 0),
    [twapSDK, srcAmountWei, limitPriceWei, srcToken?.decimals]
  );
  return {
    amountWei,
    amountUI: useAmountUi(dstToken?.decimals, amountWei),
  };
};

const useDestTokenMinAmount = (twapSDK: TwapSDK, limitPriceWei = "", srcTokenChunkAmountWei = "", srcToken?: Token, dstToken?: Token, isMarketOrder = false) => {
  const amountWei = useMemo(
    () => twapSDK.getDestTokenMinAmount(srcTokenChunkAmountWei, limitPriceWei || "", Boolean(isMarketOrder), srcToken?.decimals || 0),
    [twapSDK, srcTokenChunkAmountWei, limitPriceWei, isMarketOrder, srcToken?.decimals]
  );

  return {
    amountWei,
    amountUI: useAmountUi(dstToken?.decimals, amountWei),
  };
};

const usePriceDiffFromMarketPercent = (marketPriceWei = "", limitPriceWei = "", isInvertedPrice = false) => {
  return useMemo(() => {
    // Validate inputs
    if (!limitPriceWei || !marketPriceWei || BN(limitPriceWei).isZero() || BN(marketPriceWei).isZero()) {
      return "0";
    }

    // Determine comparison direction
    const from = isInvertedPrice ? marketPriceWei : limitPriceWei;
    const to = isInvertedPrice ? limitPriceWei : marketPriceWei;

    // Calculate percentage difference
    return BN(from).div(to).minus(1).multipliedBy(100).decimalPlaces(2, BN.ROUND_UP).toFixed();
  }, [limitPriceWei, marketPriceWei, isInvertedPrice]);
};

const useMaxSrcInputAmount = (sdk: TwapSDK, srcToken?: Token, srcBalance?: string) => {
  return useMemo(() => {
    if (srcBalance && isNativeAddress(srcToken?.address || "")) {
      const srcTokenMinimum = amountBN(srcToken?.decimals, getMinNativeBalance(sdk.config.chainId).toString());
      return BN.max(0, BN.min(BN(srcBalance).minus(srcTokenMinimum))).toString();
    }
  }, [srcToken, srcBalance, sdk.config.chainId]);
};

const useSrcChunkAmountUSD = (srcChunksAmountUI = "", srcUsd1Token = 0) => {
  return useMemo(() => {
    if (!srcUsd1Token) return "0";
    return BN(srcChunksAmountUI || "0")
      .times(srcUsd1Token || 0)
      .toString();
  }, [srcChunksAmountUI, srcUsd1Token]);
};

const useBalanceError = (t: Translations, srcAmountWei = "", maxSrcInputAmount = "", srcBalance = "") => {
  return useMemo(() => {
    const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && BN(srcAmountWei)?.gt(maxSrcInputAmount);

    if ((srcBalance && BN(srcAmountWei).gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return t.insufficientFunds;
    }
  }, [srcBalance?.toString(), srcAmountWei, maxSrcInputAmount?.toString(), t]);
};

const useShouldOnlyWrap = (chainId: number, srcToken?: Token, dstToken?: Token) => {
  return useMemo(() => {
    return shouldWrapOnly(srcToken, dstToken, chainId);
  }, [srcToken, dstToken, chainId]);
};

const useShouldUnwrap = (chainId: number, srcToken?: Token, dstToken?: Token) => {
  return useMemo(() => {
    return shouldUnwrapOnly(srcToken, dstToken, chainId);
  }, [srcToken, dstToken, chainId]);
};

const useShouldWrapOrUnwrapOnly = (chainId: number, srcToken?: Token, dstToken?: Token) => {
  const wrap = useShouldOnlyWrap(chainId, srcToken, dstToken);
  const unwrap = useShouldUnwrap(chainId, srcToken, dstToken);

  return wrap || unwrap;
};

const useError = (
  t: Translations,
  marketPrice = "",
  balanceError = "",
  chunksError = "",
  fillDelayError = "",
  orderDurationError = "",
  tradeSizeError = "",
  shouldWrapOrUnwrapOnly = false,
  srcAmountError = "",
  limitPriceError = ""
) => {
  if (shouldWrapOrUnwrapOnly) {
    return srcAmountError || balanceError;
  }

  if (BN(marketPrice || 0).isZero()) return;

  return srcAmountError || limitPriceError || chunksError || fillDelayError || tradeSizeError || balanceError || orderDurationError;
};

const useNetwork = (sdk: TwapSDK) => {
  return useMemo(() => getNetwork(sdk.config.chainId), [sdk.config.chainId]);
};

const useOrderDeadline = (sdk: TwapSDK, duration?: TimeDuration, currentTime = 0) => {
  const deadline = useMemo(() => (!duration ? undefined : sdk.getOrderDeadline(currentTime, duration)), [sdk, currentTime, duration]);

  return deadline;
};

const useFillDelay = (sdk: TwapSDK, state: State, updateState: (state: Partial<State>) => void, t: Translations, chunks = 1, isLimitPanel = false) => {
  const fillDelay = useMemo(() => sdk.getFillDelay(Boolean(isLimitPanel), state.typedFillDelay), [isLimitPanel, state.typedFillDelay, sdk]);
  const maxFillDelayError = useMemo(() => {
    const { isError, value } = sdk.getMaxFillDelayError(fillDelay, chunks);
    if (!isError) return undefined;
    return t.maxFillDelayError.replace("{fillDelay}", `${Math.floor(millisToDays(value)).toFixed(0)} ${t.days}`);
  }, [fillDelay, sdk, chunks]);

  const minFillDelayError = useMemo(() => {
    const { isError, value } = sdk.getMinFillDelayError(fillDelay);
    if (!isError) return undefined;
    return t.minFillDelayError.replace("{fillDelay}", `${millisToMinutes(value)} ${t.minutes}`);
  }, [fillDelay, sdk]);

  return {
    fillDelay,
    setFillDelay: useCallback((typedFillDelay: TimeDuration) => updateState({ typedFillDelay }), [updateState]),
    error: maxFillDelayError || minFillDelayError,
    milliseconds: fillDelay.unit * fillDelay.value,
  };
};

const useOrderName = (t: Translations, isMarketOrder = false, chunks = 1) => {
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
const useOrderDuration = (sdk: TwapSDK, state: State, updateState: (state: Partial<State>) => void, t: Translations, chunks = 1, fillDelay: TimeDuration) => {
  const orderDuration = useMemo(() => sdk.getOrderDuration(chunks, fillDelay, state.typedDuration), [chunks, fillDelay, state.typedDuration, sdk]);

  const error = useMemo(() => {
    const { isError, value } = sdk.getOrderDurationError(orderDuration);

    if (!isError) return undefined;
    return t.maxDurationError.replace("{duration}", `${Math.floor(millisToDays(value)).toFixed(0)} ${t.days}`);
  }, [orderDuration, sdk]);

  return {
    orderDuration,
    milliseconds: orderDuration.unit * orderDuration.value,
    setOrderDuration: useCallback((typedDuration: TimeDuration) => updateState({ typedDuration }), [updateState]),
    error,
  };
};

const useOnOpenConfirmationModal = (state: State, updateState: (state: Partial<State>) => void, orderName = "", dstAmountUI = "", srcToken?: Token, dstToken?: Token) => {
  return useCallback(() => {
    updateState({ showConfirmation: true });
    if (state.swapStatus === SwapStatus.LOADING) return;
    updateState({
      swapStatus: undefined,
      // prevent data to change during order creation
      trade: {
        srcAmount: state.typedSrcAmount,
        dstAmount: dstAmountUI,
        srcToken,
        dstToken,
        title: orderName,
      },
    });
  }, [updateState, state.typedSrcAmount, dstAmountUI, srcToken, dstToken, state.swapStatus, orderName]);
};

const useOnCloseConfirmationModal = (state: State, updateState: (state: Partial<State>) => void, reset: () => void) => {
  return useCallback(() => {
    updateState({ showConfirmation: false });
    if (state.swapStatus === SwapStatus.SUCCESS) {
      reset();
    }

    if (state.swapStatus === SwapStatus.FAILED) {
      updateState({ swapStatus: undefined, activeStep: undefined, currentStepIndex: 0 });
    }
  }, [reset, updateState, state.swapStatus]);
};

const useTransactionExplorerLink = (sdk: TwapSDK, txHash?: string) => {
  const network = useNetwork(sdk);
  return useMemo(() => {
    if (!txHash || !network) return undefined;
    return `${network.explorer}/tx/${txHash}`;
  }, [txHash, network]);
};

const useUsdAmount = (amount?: string, usd?: string | number) => {
  return useMemo(() => {
    if (!amount || !usd || BN(amount || "0").isZero() || BN(usd || "0").isZero()) return 0;
    return BN(amount || "0")
      .times(usd)
      .toNumber();
  }, [amount, usd]);
};

const useOnSrcInputPercentClick = (updateState: (state: Partial<State>) => void, maxAmount = "", srcBalance = "", srcToken?: Token) => {
  return useCallback(
    (percent: number) => {
      if (!srcToken || !srcBalance || BN(srcBalance || 0).isZero()) return;
      const _maxAmount = maxAmount && percent === 1 && BN(maxAmount).gt(0) ? maxAmount : undefined;
      const value = amountUi(srcToken.decimals, _maxAmount || BN(srcBalance).times(percent).toString());
      updateState({ typedSrcAmount: value });
    },
    [maxAmount, srcBalance, updateState, srcToken]
  );
};

const useApproveToken = (
  sdk: TwapSDK,
  updateState: (state: Partial<State>) => void,
  account?: `0x${string}` | undefined,
  walletClient?: WalletClient | undefined,
  publicClient?: ReturnType<typeof createPublicClient>,
  callbacks?: Callbacks
) => {
  return useCallback(
    async (token: Token, amount: string) => {
      try {
        if (!account) throw new Error("account is not defined");
        if (!walletClient) throw new Error("walletClient is not defined");
        if (!publicClient) throw new Error("publicClient is not defined");

        callbacks?.approve?.onRequest?.(token, amountUi(token.decimals, amount));
        const hash = await walletClient.writeContract({
          abi: erc20Abi,
          functionName: "approve",
          account: account as `0x${string}`,
          address: token.address as `0x${string}`,
          args: [sdk.config.twapAddress as `0x${string}`, BigInt(BN(amount).decimalPlaces(0).toFixed())],
          chain: walletClient.chain,
        });
        updateState({ approveTxHash: hash });
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 2,
        });

        if (receipt.status === "reverted") {
          throw new Error("failed to approve token");
        }

        sdk.analytics.onApproveSuccess(hash);
        callbacks?.approve?.onSuccess?.(receipt, token!, amountUi(token?.decimals, amount));
      } catch (error) {
        callbacks?.approve?.onFailed?.((error as Error).message);
      }
    },
    [account, walletClient, publicClient, sdk, updateState, callbacks]
  );
};

const useCancelOrder = ({
  sdk,
  account,
  walletClient,
  publicClient,
  onTxHash,
}: {
  sdk: TwapSDK;
  account?: `0x${string}` | undefined;
  walletClient?: WalletClient | undefined;
  publicClient?: ReturnType<typeof createPublicClient>;
  onTxHash?: (hash: string) => void;
}) => {
  return useCallback(
    async (order: Order) => {
      try {
        if (!account) throw new Error("account not defined");
        if (!walletClient) throw new Error("walletClient not defined");
        if (!publicClient) throw new Error("publicClient not defined");
        sdk.analytics.onCancelOrderRequest(order.id);
        const hash = await walletClient.writeContract({
          account: account as `0x${string}`,
          address: order.twapAddress as `0x${string}`,
          abi: TwapAbi,
          functionName: "cancel",
          args: [order.id],
          chain: walletClient.chain,
        });
        onTxHash?.(hash);
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 2,
        });

        if (receipt.status === "reverted") {
          throw new Error("failed to cancel order");
        }

        console.log(`order canceled`);
        sdk.analytics.onCancelOrderSuccess();
        return hash;
      } catch (error) {
        console.log(`cancel error order`, error);
        sdk.analytics.onCreateOrderError(error);
        throw error;
      }
    },
    [account, walletClient, publicClient, sdk, onTxHash]
  );
};

const useCreateOrder = (
  twapSDK: TwapSDK,
  updateState: (state: Partial<State>) => void,
  fillDelay: TimeDuration
  account?: `0x${string}`,
  walletClient?: WalletClient,
  publicClient?: ReturnType<typeof createPublicClient>,
  srcToken?: Token,
  dstToken?: Token,
  srcAmountWei = "",
  destTokenMinAmountWei = "",
  srcChunkAmountWei = "",
  deadline = 0,
) => {
  return useCallback(async () => {
    if (!account) throw new Error("account is not defined");
    if (!walletClient) throw new Error("walletClient is not defined");
    if (!publicClient) throw new Error("publicClient is not defined");
    if (!dstToken) throw new Error("dstToken is not defined");
    if (!srcToken) throw new Error("srcToken is not defined");

    const params = twapSDK.getAskParams({
      destTokenMinAmount: destTokenMinAmountWei,
      srcChunkAmount: srcChunkAmountWei,
      deadline,
      fillDelay,
      srcAmount: srcAmountWei,
      // src token cant be native token
      srcTokenAddress: srcToken.address,
      destTokenAddress: dstToken.address,
    });

    if (!params) throw new Error("failed to get params for ask method");

    const txHash = await walletClient.writeContract({
      account: account.toLowerCase() as `0x${string}`,
      address: twapSDK.config.twapAddress.toLowerCase() as `0x${string}`,
      abi: TwapAbi,
      functionName: "ask",
      args: [params],
      chain: walletClient.chain,
    });
    updateState({ createOrderTxHash: txHash });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 2,
    });

    if (receipt.status === "reverted") {
      throw new Error("failed to create order");
    }
    const orderId = getOrderIdFromCreateOrderEvent(receipt);

    return {
      orderId,
      receipt,
    };
  }, [account, updateState, walletClient, publicClient, twapSDK, dstToken, srcToken, srcAmountWei, destTokenMinAmountWei, srcChunkAmountWei, deadline, fillDelay]);
};

const useWrapToken = () => {
  const {
    account,
    walletClient,
    publicClient,
    callbacks,
    state: { typedSrcAmount = "" },
    twapSDK,
    updateState,
  } = useTwapContext();
  const tokenAddress = useNetwork()?.wToken.address;

  return useMutation(
    async (amount: string) => {
      if (!account) throw new Error("account is not defined");
      if (!tokenAddress) throw new Error("tokenAddress is not defined");
      if (!walletClient) throw new Error("walletClient is not defined");
      if (!publicClient) throw new Error("publicClient is not defined");

      const hash = await walletClient.writeContract({
        abi: iwethabi,
        functionName: "deposit",
        account,
        address: tokenAddress as `0x${string}`,
        value: BigInt(BN(amount).decimalPlaces(0).toFixed()),
        chain: walletClient.chain,
      });
      updateState({ wrapTxHash: hash });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 2,
      });
      if (receipt.status === "reverted") {
        throw new Error("failed to wrap token");
      }

      twapSDK.analytics.onWrapSuccess(hash);
      await callbacks?.wrap?.onSuccess?.(receipt, typedSrcAmount);
      return receipt;
    },
    {
      onMutate: () => {
        callbacks?.wrap?.onRequest?.(typedSrcAmount);
      },
      onError: (error) => {
        callbacks?.wrap?.onFailed?.((error as any).message);
      },
    }
  );
};

const useWrapOnly = () => {
  const { mutateAsync } = useWrapToken();
  const { reset } = useTwapContext();
  const srcAmount = useSrcAmount().amountWei;
  return useMutation(async () => {
    await mutateAsync(srcAmount);
    reset();
  });
};

const useUnwrapToken = () => {
  const { account, reset, walletClient, publicClient, callbacks, updateState } = useTwapContext();
  const wTokenAddress = useNetwork()?.wToken.address;
  const { amountWei, amountUI = "" } = useSrcAmount();

  return useMutation(
    async () => {
      if (!wTokenAddress) throw new Error("wTokenAddress is not defined");
      if (!account) throw new Error("account is not defined");
      if (!walletClient) throw new Error("walletClient is not defined");
      if (!publicClient) throw new Error("publicClient is not defined");

      const hash = await walletClient.writeContract({
        abi: iwethabi,
        functionName: "withdraw",
        account: account,
        address: wTokenAddress as `0x${string}`,
        args: [BigInt(BN(amountWei).decimalPlaces(0).toFixed())],
        chain: walletClient.chain,
      });
      updateState({ unwrapTxHash: hash });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 2,
      });

      await callbacks.unwrap?.onSuccess?.(receipt, amountUI);
      return receipt;
    },
    {
      onMutate: () => {
        callbacks.unwrap?.onRequest?.(amountUI);
      },
      onSuccess: reset,
      onError: (error) => {
        callbacks.unwrap?.onFailed?.((error as any).message);
      },
    }
  );
};

const getTotalSteps = (shouldWrap?: boolean, shouldApprove?: boolean) => {
  let stepsCount = 1;
  if (shouldWrap) stepsCount++;
  if (shouldApprove) stepsCount++;
  return stepsCount;
};

const useSubmitOrderCallbacks = (dstAmountUI?: string) => {
  const {
    callbacks,
    srcToken,
    dstToken,
    state: { typedSrcAmount },
  } = useTwapContext();
  const onRequest = useCallback(() => {
    callbacks?.onSubmitOrderRequest?.({
      srcToken: srcToken!,
      dstToken: dstToken!,
      srcAmount: typedSrcAmount || "",
      dstAmount: dstAmountUI || "",
    });
  }, [callbacks, srcToken, dstToken, typedSrcAmount, dstAmountUI]);
  return { onRequest };
};

const useSubmitOrderCallback = () => {
  const { updateState, srcToken, dstToken, isExactAppoval, chainId } = useTwapContext();
  const { mutateAsync: getHasAllowance } = useHasAllowanceCallback();
  const approve = useApproveToken().mutateAsync;
  const wrapToken = useWrapToken().mutateAsync;
  const createOrder = useCreateOrder().mutateAsync;
  const { onRequest } = useSubmitOrderCallbacks();
  const srcAmount = useSrcAmount().amountWei;
  const approvalAmount = isExactAppoval ? srcAmount : maxUint256.toString();
  const [checkingApproval, setCheckingApproval] = useState(false);

  const wrappedRef = useRef(false);
  const mutation = useMutation(
    async () => {
      if (!srcToken) throw new Error("srcToken is not defined");
      if (!dstToken) throw new Error("dstToken is not defined");
      if (!chainId) throw new Error("chainId is not defined");
      const ensureAllowance = () => getHasAllowance({ token: ensureWrappedToken(srcToken, chainId), amount: srcAmount });
      const shouldWrap = isNativeAddress(srcToken.address);
      setCheckingApproval(true);
      const haveAllowance = await ensureAllowance();
      setCheckingApproval(false);
      let stepIndex = 0;
      updateState({ swapStatus: SwapStatus.LOADING, totalSteps: getTotalSteps(shouldWrap, !haveAllowance) });

      if (shouldWrap) {
        updateState({ activeStep: Steps.WRAP });
        await wrapToken(srcAmount);
        stepIndex++;
        updateState({ currentStepIndex: stepIndex });
      }

      if (!haveAllowance) {
        updateState({ activeStep: Steps.APPROVE });
        await approve({ token: ensureWrappedToken(srcToken, chainId), amount: approvalAmount });
        // make sure the allowance was set
        if (!(await ensureAllowance())) {
          throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
        }
        stepIndex++;
        updateState({ currentStepIndex: stepIndex });
      }
      updateState({ activeStep: Steps.CREATE });
      const order = await createOrder(ensureWrappedToken(srcToken, chainId));

      // we refetch balances only if we wrapped the token
      updateState({ swapStatus: SwapStatus.SUCCESS });
      return order;
    },
    {
      onMutate: onRequest,
      onError(error) {
        if (isTxRejected(error) && !wrappedRef.current) {
          updateState({ activeStep: undefined, swapStatus: undefined, currentStepIndex: undefined });
        } else {
          updateState({ swapStatus: SwapStatus.FAILED, swapError: (error as any).message });
        }
      },
    }
  );

  return {
    ...mutation,
    checkingApproval,
  };
};

export const BaseHooks = {
  useGetMinChunkSizeUsd,
  useAmountBN,
  useAmountUi,
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
  useUsdAmount,
  useOnSrcInputPercentClick,
};
