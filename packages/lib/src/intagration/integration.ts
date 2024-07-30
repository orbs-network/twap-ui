import { useCallback, useMemo } from "react";
import { TimeResolution, Token } from "../types";
import * as libHooks from "../hooks/lib";
import { MAX_DURATION_MILLIS, MIN_DURATION_MILLIS, MIN_DURATION_MILLIS_FORMATTED, MIN_TRADE_INTERVAL_FORMATTED } from "../consts";
import { amountBN, fillDelayText } from "../utils";
import { useIntegrationContext } from "./context";
import BN from "bignumber.js";
import { useIntegrationStore } from "./store";
import { useAmountUi, useFormatDecimals } from "../hooks";
import { convertDecimals, eqIgnoreCase, isNativeAddress, maxUint256, parsebn } from "@defi.org/web3-candies";
import moment from "moment";

export const useFillDelay = () => {
  const {
    state: { customFillDelay },
    isLimitPanel,
    translations,
  } = useIntegrationContext();

  const millis = useMemo(() => {
    if (isLimitPanel) {
      return TimeResolution.Minutes * MIN_TRADE_INTERVAL_FORMATTED;
    }
    return customFillDelay.amount! * customFillDelay.resolution;
  }, [customFillDelay, isLimitPanel]);

  return {
    millis,
    text: useMemo(() => fillDelayText(millis, translations), [millis, translations]),
  };
};

export const useTotalTradesAmount = () => {
  const {
    isLimitPanel,
    state: { customChunks },
  } = useIntegrationContext();

  const maxPossibleTrades = useMaxPossibleTrades();

  return useMemo(() => {
    if (isLimitPanel) return 1;
    if (typeof customChunks === "number") return customChunks;
    return maxPossibleTrades;
  }, [customChunks, maxPossibleTrades, isLimitPanel]);
};

const useMinDuration = () => {
  const fillDelayUiMillis = useFillDelay().millis;
  const chunks = useTotalTradesAmount();

  return useMemo(() => {
    const _millis = fillDelayUiMillis * 2 * chunks;
    const resolution = [TimeResolution.Days, TimeResolution.Hours, TimeResolution.Minutes].find((r) => r <= _millis) || TimeResolution.Minutes;
    const duration = { resolution, amount: Number(BN(_millis / resolution).toFixed(2)) };

    return {
      duration,
      millis: (duration.amount || 0) * duration.resolution,
    };
  }, [fillDelayUiMillis, chunks]);
};

export const useTradeDuration = () => {
  const { duration: minDuration } = useMinDuration();
  const {
    updateState,
    isLimitPanel,
    state: { customDuration },
    translations,
  } = useIntegrationContext();

  const duration = useMemo(() => {
    if (isLimitPanel) {
      return { resolution: TimeResolution.Days, amount: 7 };
    }
    if (customDuration) {
      return customDuration;
    }
    return minDuration;
  }, [isLimitPanel, customDuration, minDuration]);

  const millis = useMemo(() => (duration.amount || 0) * duration.resolution, [duration]);

  const warning = useMemo(() => {
    if (!customDuration) return;
    if (millis < MIN_DURATION_MILLIS) {
      return translations.minDurationWarning.replace("{duration}", MIN_DURATION_MILLIS_FORMATTED.toString());
    }
    if (millis > MAX_DURATION_MILLIS) {
      return translations.maxDurationWarning;
    }
  }, [customDuration, millis, translations]);

  const onResolutionChange = useCallback(
    (resolution: TimeResolution) => {
      updateState({ customDuration: { resolution, amount: duration.amount } });
    },
    [duration.amount, updateState]
  );

  const onInputChange = useCallback(
    (amount: string | number) => {
      updateState({ customDuration: { resolution: duration.resolution, amount: Number(amount) } });
    },
    [duration.resolution, updateState]
  );

  return {
    millis,
    duration,
    warning,
    onResolutionChange,
    onInputChange,
  };
};

export const useSingleTradeSizeUsd = () => {
  const { srcToken, srcUsdPrice } = useIntegrationContext();
  const srcChunksAmount = useSingleTradeSize().amount;

  const result = useMemo(() => {
    if (!srcToken || !srcUsdPrice) return;
    return BN(srcChunksAmount || 0)
      .times(srcUsdPrice)
      .toString();
  }, [srcChunksAmount, srcUsdPrice]);

  return useAmountUi(srcToken?.decimals, result);
};

export const useSingleTradeSize = () => {
  const {
    state: { srcAmount },
    srcToken,
    config,
    translations,
  } = useIntegrationContext();
  const chunks = useTotalTrades();

  const singleChunksUsd = useMemo(() => {
    if (!srcAmount || !chunks) return "0";
    const res = chunks === 0 ? BN(0) : BN(srcAmount).div(chunks).integerValue(BN.ROUND_FLOOR) || BN(0);
    return res.toString();
  }, [srcAmount, chunks]);

  const warning = useMemo(() => {
    if (BN(srcAmount || 0).isZero()) return;
    const minTradeSizeUsd = BN(config.minChunkSizeUsd || 0);
    if (BN(chunks).isZero() || BN(singleChunksUsd || 0).isLessThan(minTradeSizeUsd)) {
      return translations.tradeSizeMustBeEqual.replace("{minChunkSizeUsd}", minTradeSizeUsd.toString());
    }
  }, [chunks, translations, singleChunksUsd, config, srcAmount]);

  return {
    amount: singleChunksUsd,
    amountUi: useFormatDecimals(useAmountUi(srcToken?.decimals, singleChunksUsd), 2),
    warning,
  };
};

const useMaxPossibleTrades = () => {
  const { config, state, srcUsdPrice } = useIntegrationContext();
  const { srcAmount, srcToken } = state;

  return useMemo(() => {
    if (!config || !srcAmount || !srcToken || !srcUsdPrice) return 1;
    const res = BN.max(1, BN(srcAmount).div(BN(10).pow(srcToken?.decimals).div(srcUsdPrice).times(config.minChunkSizeUsd)))
      .integerValue(BN.ROUND_FLOOR)
      .toNumber();
    return res > 1 ? res : 1;
  }, [config, srcAmount, srcToken, srcUsdPrice]);
};

export const useMaxPossibleChunks = () => {
  const {
    config,
    srcUsdPrice,
    srcToken,
    state: { srcAmount },
  } = useIntegrationContext();

  return useMemo(() => {
    if (!config || !srcToken || !srcAmount || !srcUsdPrice) return 1;
    const res = BN.max(1, BN(srcAmount).div(BN(10).pow(srcToken.decimals).div(srcUsdPrice).times(config.minChunkSizeUsd)))
      .integerValue(BN.ROUND_FLOOR)
      .toNumber();
    return res > 1 ? res : 1;
  }, [srcAmount, srcToken, srcUsdPrice, config]);
};

const useTotalTrades = () => {
  const { isLimitPanel, state } = useIntegrationContext();
  const { customChunks } = state;
  const maxPossibleChunks = useMaxPossibleChunks();

  return useMemo(() => {
    if (isLimitPanel) return 1;
    if (typeof customChunks === "number") return customChunks;
    return maxPossibleChunks;
  }, [customChunks, maxPossibleChunks, isLimitPanel]);
};

const useOnSrcAmount = () => {
  const {
    updateState,
    state: { srcToken },
  } = useIntegrationStore();
  return useCallback(
    (srcAmountUi: string) => {
      updateState({
        srcAmountUi,
        srcAmount: amountBN(srcToken?.decimals, srcAmountUi),
      });
    },
    [updateState, srcToken]
  );
};

export const useMinAmountOut = () => {
  const { priceUi } = libHooks.useLimitPrice();
  const { srcToken, dstToken } = useIntegrationContext();
  const srcChunkAmount = useSingleTradeSize().amount;

  const isMarketOrder = libHooks.useIsMarketOrder();
  const amount = useMemo(() => {
    let amount = BN(1).toString();
    if (!isMarketOrder && srcToken && dstToken && BN(priceUi || "0").gt(0)) {
      amount = BN.max(1, convertDecimals(BN(srcChunkAmount).times(parsebn(priceUi || "0")), srcToken.decimals, dstToken.decimals).integerValue(BN.ROUND_FLOOR)).toString();
    }
    return amount;
  }, [srcToken, dstToken, srcChunkAmount, priceUi, isMarketOrder]);

  return {
    amount,
    amountUi: useAmountUi(dstToken?.decimals, amount),
  };
};

export const useDeadline = () => {
  const {
    state: { confirmationClickTimestamp },
  } = useIntegrationContext();

  const { duration } = useTradeDuration();

  return useMemo(() => {
    const millis = moment(confirmationClickTimestamp)
      .add((duration.amount || 0) * duration.resolution)
      .add(1, "minute")
      .valueOf();
    return {
      millis,
      text: moment(millis).format("ll HH:mm"),
    };
  }, [duration, confirmationClickTimestamp]);
};

const useEstimatedDelayBetweenChunksMillis = () => {
  const { config } = useIntegrationContext();
  return useMemo(() => {
    return config.bidDelaySeconds * 1000 * 2;
  }, [config]);
};

export const useOutAmount = () => {
  const { price, isLoading } = libHooks.useLimitPrice();
  const {
    dstToken,
    state: { srcAmount },
  } = useIntegrationContext();

  const outAmount = useMemo(() => {
    if (!srcAmount || BN(srcAmount || 0).isZero()) return;

    return !price ? undefined : BN(price).multipliedBy(srcAmount).decimalPlaces(0).toString();
  }, [price, srcAmount]);

  return {
    isLoading,
    amountUi: useAmountUi(dstToken?.decimals, outAmount) || "",
    amount: outAmount || "",
  };
};

const getUsdAmount = (amount?: string, usd?: string | number) => {
  if (!amount || !usd || BN(amount || "0").isZero() || BN(usd || "0").isZero()) return "0";
  return BN(amount || "0")
    .times(usd)
    .toString();
};
export const useUsdAmount = () => {
  const {
    state: { srcAmount },
    srcUsdPrice,
    srcToken,
    dstUsdPrice,
    dstToken,
  } = useIntegrationContext();
  const dstAmount = useOutAmount().amount;

  const dstUsdAmount = useMemo(() => {
    return getUsdAmount(dstAmount, dstUsdPrice);
  }, [dstAmount, dstUsdPrice]);

  const srcUsdAmount = useMemo(() => {
    return getUsdAmount(srcAmount, srcUsdPrice);
  }, [srcAmount, srcUsdPrice]);

  return {
    srcUsd: useAmountUi(srcToken?.decimals, srcUsdAmount),
    dstUsd: useAmountUi(dstToken?.decimals, dstUsdAmount),
  };
};

export const useSwapData = () => {
  const amountUsd = useUsdAmount();
  const outAmount = useOutAmount();
  const deadline = useDeadline();
  const srcChunkAmount = useSingleTradeSize();
  const dstMinAmount = useMinAmountOut();
  const fillDelay = useFillDelay();
  const chunks = useTotalTrades();
  const {
    srcToken,
    dstToken,
    state: { srcAmount },
  } = useIntegrationContext();

  return {
    srcAmount,
    amountUsd,
    outAmount,
    deadline,
    srcChunkAmount,
    dstMinAmount,
    fillDelay,
    chunks,
    srcToken,
    dstToken,
  };
};

const useOnOrderCreated = () => {
  const { onTxSubmitted, config, srcToken, dstToken } = useTwapContext();
  const addOrder = query.useAddNewOrder();
  const swapData = useSwapData();
  const onOrderCreated = stateActions.useOnOrderCreated();
  const reset = useResetAfterSwap();
  const estimatedDelayBetweenChunksMillis = useEstimatedDelayBetweenChunksMillis();
  return useCallback(
    (order: { txHash: string; orderId: number }) => {
      const fillDelaySeconds = (swapData.fillDelay.millis - estimatedDelayBetweenChunksMillis) / 1000;

      onOrderCreated();
      addOrder({
        srcTokenAddress: srcToken?.address,
        dstTokenAddress: dstToken?.address,
        srcAmount: swapData.srcAmount.amount,
        createdAt: moment().unix().valueOf(),
        id: order.orderId,
        txHash: order.txHash,
        deadline: moment(swapData.deadline.millis).unix(),
        srcBidAmount: swapData.srcChunkAmount.amount,
        dstMinAmount: swapData.dstMinAmount.amount,
        fillDelay: fillDelaySeconds,
        totalChunks: swapData.chunks,
        status: Status.Open,
        srcToken,
        dstToken,
        exchange: config.exchangeAddress,
      });
      onTxSubmitted?.({
        srcToken: srcToken!,
        dstToken: dstToken!,
        srcAmount: swapData.srcAmount.amount,
        dstUSD: swapData.amountUsd.dstUsd || "",
        dstAmount: swapData.outAmount.amount || "",
        txHash: order.txHash,
      });
      reset();
    },
    [srcToken, dstToken, onTxSubmitted, onOrderCreated, reset, config, swapData, estimatedDelayBetweenChunksMillis]
  );
};

export const useCreateOrder = () => {
  const {
    askDataParams,
    dstToken,
    srcToken,
    config,
    state: { srcAmount },
  } = useIntegrationContext();
  const minAmountOut = useMinAmountOut().amount;
  const singleTradeSize = useSingleTradeSize().amount;
  const deadline = useDeadline().millis;
  const fillDelayMillisUi = useFillDelay().millis;

  const estimatedDelayBetweenChunksMillis = useEstimatedDelayBetweenChunksMillis();
  const fillDelaySeconds = (fillDelayMillisUi - estimatedDelayBetweenChunksMillis) / 1000;

  return useMemo(() => {
    if (!srcToken || !dstToken || !srcAmount) return;
    const askParams = [
      config.exchangeAddress,
      srcToken.address,
      dstToken.address,
      BN(srcAmount).toFixed(0),
      BN(singleTradeSize).toFixed(0),
      BN(minAmountOut).toFixed(0),
      BN(deadline).div(1000).toFixed(0),
      BN(config.bidDelaySeconds).toFixed(0),
      BN(fillDelaySeconds).toFixed(0),
      askDataParams,
    ];
    const twapContract = config.twapAddress;
  }, [srcToken, dstToken, srcAmount, singleTradeSize, minAmountOut, deadline, fillDelaySeconds, askDataParams, config]);

  return useMutation(
    async (srcToken: TokenData) => {
      analytics.updateAction("create");

      const fillDelaySeconds = (fillDelayMillisUi - estimatedDelayBetweenChunksMillis) / 1000;

      if (!dstToken) {
        throw new Error("dstToken is not defined");
      }

      if (!twapContract) {
        throw new Error("twapContract is not defined");
      }

      if (!account) {
        throw new Error("account is not defined");
      }

      const askData = config.exchangeType === "PangolinDaasExchange" ? web3().eth.abi.encodeParameters(["address"], askDataParams || []) : [];

      const askParams = [
        config.exchangeAddress,
        srcToken.address,
        dstToken.address,
        BN(srcAmount).toFixed(0),
        BN(srcChunkAmount).toFixed(0),
        BN(dstMinAmountOut).toFixed(0),
        BN(deadline).div(1000).toFixed(0),
        BN(config.bidDelaySeconds).toFixed(0),
        BN(fillDelaySeconds).toFixed(0),
        askData,
      ];

      console.log("create order args:", {
        exchangeAddress: config.exchangeAddress,
        srcToken: srcToken.address,
        dstToken: dstToken.address,
        srcAmount: BN(srcAmount).toFixed(0),
        srcChunkAmount: BN(srcChunkAmount).toFixed(0),
        dstMinAmountOut: BN(dstMinAmountOut).toFixed(0),
        deadline: BN(deadline).div(1000).toFixed(0),
        bidDelaySeconds: BN(config.bidDelaySeconds).toFixed(0),
        fillDelaySeconds: BN(fillDelaySeconds).toFixed(0),
        priorityFeePerGas: priorityFeePerGas.toString(),
        maxFeePerGas: maxFeePerGas.toString(),
      });

      const ask = twapContract.methods.ask(askParams as any);

      const tx = await sendAndWaitForConfirmations(
        ask,
        {
          from: account,
          maxPriorityFeePerGas: priorityFeePerGas || zero,
          maxFeePerGas,
        },
        undefined,
        undefined,
        {
          onTxHash,
        }
      );

      const orderId = Number(tx.events.OrderCreated.returnValues.id);
      const txHash = tx.transactionHash;
      analytics.onCreateOrderSuccess(orderId, txHash);
      logger("order created:", "orderId:", orderId, "txHash:", txHash);
      return {
        orderId,
        txHash,
      };
    },
    {
      onError: (error) => {
        logger("order create failed:", error);
        analytics.onTxError(error, "create");
      },
    }
  );
};
