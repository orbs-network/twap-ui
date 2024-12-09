import { zero, sendAndWaitForConfirmations, TokenData, web3, erc20, iwethabi, maxUint256, hasWeb3Instance, setWeb3Instance } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context/context";
import { useEstimatedDelayBetweenChunksMillis, useGetHasAllowance, useNetwork, useResetAfterSwap, useTwapContract } from "./hooks";
import { query, useOrdersHistory } from "./query";
import BN from "bignumber.js";
import { isTxRejected, logger } from "../utils";
import { useCallback, useMemo } from "react";
import { analytics } from "../analytics";
import { stateActions, useSwitchNativeToWrapped } from "../context/actions";
import moment from "moment";
import { useDeadline, useDstMinAmountOut, useFillDelay, useIsMarketOrder, useShouldOnlyWrap, useShouldWrap, useSrcAmount, useSrcChunkAmount, useSwapData } from "./lib";
import { Status } from "../types";

export const useCreateOrder = () => {
  const { maxFeePerGas, priorityFeePerGas } = query.useGasPrice();
  const { askDataParams, account, dstToken, config } = useTwapContext();
  const dstMinAmountOut = useDstMinAmountOut().amount;
  const srcChunkAmount = useSrcChunkAmount().amount;
  const deadline = useDeadline().millis;
  const fillDelayMillisUi = useFillDelay().millis;
  const srcAmount = useSrcAmount().amount;
  const onTxHash = stateActions.useOnTxHash().onCreateOrderTxHash;
  const twapContract = useTwapContract();
  const estimatedDelayBetweenChunksMillis = useEstimatedDelayBetweenChunksMillis();

  return useMutation(
    async (srcToken: TokenData) => {
      analytics.updateAction("create-order");

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
        },
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
        analytics.onTxError(error, "create-order");
      },
    },
  );
};

export const useWrapToken = () => {
  const srcAmount = useSrcAmount().amount;
  const { config, account } = useTwapContext();
  const network = useNetwork();
  const wrapOnly = useShouldOnlyWrap();
  const onTxHash = stateActions.useOnTxHash().onWrapTxHash;
  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();

  return useMutation(
    async () => {
      let txHash: string = "";
      if (!config) {
        throw new Error("config is not defined");
      }
      if (!network) {
        throw new Error("network is not defined");
      }
      if (!account) {
        throw new Error("account is not defined");
      }

      logger("wrapping token");
      analytics.updateAction(wrapOnly ? "wrap-only" : "wrap");
      await sendAndWaitForConfirmations(
        erc20<any>(network.wToken.symbol, network.wToken.address, network.wToken.decimals, iwethabi).methods.deposit(),
        {
          from: account,
          maxPriorityFeePerGas: priorityFeePerGas,
          maxFeePerGas,
          value: srcAmount,
        },
        undefined,
        undefined,
        {
          onTxHash: (hash) => {
            txHash = hash;
            onTxHash(hash);
          },
        },
      );
      logger("token wrap success:", txHash);
      analytics.onWrapSuccess(txHash);
    },
    {
      onError: (error) => {
        logger("token wrap failed:", error);
        analytics.onTxError(error, wrapOnly ? "wrap-only" : "wrap");
      },
    },
  );
};

export const useWrapOnly = () => {
  const { mutateAsync } = useWrapToken();
  const onSuccess = useResetAfterSwap();

  return useMutation(async () => {
    analytics.updateAction("wrap-only");
    await mutateAsync();
    await onSuccess();
  });
};

export const useUnwrapToken = () => {
  const { account } = useTwapContext();
  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();
  const onSuccess = useResetAfterSwap();
  const srcAmount = useSrcAmount().amount;
  const onTxHash = stateActions.useOnTxHash().onUnwrapTxHash;
  const network = useNetwork();

  return useMutation(
    async () => {
      let txHash: string = "";
      if (!network) {
        throw new Error("network is not defined");
      }

      if (!account) {
        throw new Error("account is not defined");
      }

      analytics.updateAction("unwrap");

      await sendAndWaitForConfirmations(
        erc20<any>(network.wToken.symbol, network.wToken.address, network.wToken.decimals, iwethabi).methods.withdraw(BN(srcAmount).toFixed(0)),
        { from: account, maxPriorityFeePerGas: priorityFeePerGas, maxFeePerGas },
        undefined,
        undefined,
        {
          onTxHash: (hash) => {
            txHash = hash;
            onTxHash(hash);
          },
        },
      );
      analytics.onUnwrapSuccess(txHash);
      await onSuccess();
    },
    {
      onError: (error) => {
        analytics.onTxError(error, "unwrap");
      },
    },
  );
};

export const useApproveToken = () => {
  const onTxHash = stateActions.useOnTxHash().onApproveTxHash;

  const { config, account, isExactAppoval, web3 } = useTwapContext();
  const srcAmount = useSrcAmount().amount;

  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();

  const approvalAmount = isExactAppoval ? srcAmount : maxUint256;

  return useMutation(
    async (token: TokenData) => {
      if (!account) {
        throw new Error("account is not defined");
      }

      logger("approving token...");
      analytics.updateAction("approve");

      let txHash: string = "";
      if (!hasWeb3Instance()) {
        setWeb3Instance(web3);
      }
      const contract = erc20(token.symbol, token.address, token.decimals);

      await sendAndWaitForConfirmations(
        contract.methods.approve(config.twapAddress, BN(approvalAmount).decimalPlaces(0).toFixed(0)),
        {
          from: account,
          maxPriorityFeePerGas: priorityFeePerGas,
          maxFeePerGas,
        },
        undefined,
        undefined,
        {
          onTxHash: (value) => {
            onTxHash(value);
            txHash = value;
          },
        },
      );
      logger("token approve success:", txHash);
      analytics.onApproveSuccess(txHash);
    },
    {
      onError: (error) => {
        logger("token approve failed:", error);
        analytics.onTxError(error, "approve");
      },
    },
  );
};
const useOnSuccessCallback = () => {
  const { onTxSubmitted, config, srcToken, dstToken } = useTwapContext();
  const addOrder = query.useAddNewOrder();
  const swapData = useSwapData();
  const onOrderCreated = stateActions.useOnOrderCreated();
  const { refetch } = useOrdersHistory();
  const reset = useResetAfterSwap();
  const estimatedDelayBetweenChunksMillis = useEstimatedDelayBetweenChunksMillis();
  return useCallback(
    (order: { txHash: string; orderId?: number }) => {
      if (!order.orderId) {
        return refetch();
      }

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
    [srcToken, dstToken, onTxSubmitted, onOrderCreated, reset, config, swapData, estimatedDelayBetweenChunksMillis, refetch, addOrder],
  );
};

const useSubmitAnalytics = () => {
  const swapData = useSwapData();
  const isMarket = useIsMarketOrder();
  const { isLimitPanel } = useTwapContext();

  const orderType = useMemo(() => {
    if (isLimitPanel) {
      return "limit";
    }
    return isMarket ? "twap-market" : "twap-limit";
  }, [isLimitPanel, isMarket]);

  return useCallback(() => {
    analytics.onSubmitOrder(swapData, orderType);
  }, [swapData, orderType]);
};

export const useSubmitOrderFlow = () => {
  const { minNativeTokenBalance, updateState, state, srcToken } = useTwapContext();
  const { swapState, swapStep, createOrdertxHash, approveTxHash, wrapTxHash, wrapSuccess } = state;
  const { data: haveAllowance } = query.useAllowance();
  const { ensureData: ensureNativeBalance } = query.useMinNativeTokenBalance(minNativeTokenBalance);
  const shouldWrap = useShouldWrap();
  const onSuccessCallback = useOnSuccessCallback();
  const network = useNetwork();
  const wToken = network?.wToken;
  const nativeSymbol = network?.native.symbol;
  const { refetch: refetchAllowance } = query.useAllowance();
  const submitAnalytics = useSubmitAnalytics();
  const nativeToWrapped = useSwitchNativeToWrapped();
  const approve = useApproveToken().mutateAsync;
  const wrapToken = useWrapToken().mutateAsync;
  const createOrder = useCreateOrder().mutateAsync;
  const getHasAllowance = useGetHasAllowance();
  const swapData = useSwapData();
  const { srcAmount } = swapData;

  const mutate = useMutation(
    async () => {
      if (!srcToken) {
        throw new Error("Please select a token to swap");
      }

      if (!wToken) {
        throw new Error("WToken not defined");
      }
      logger(`Create order request`);
      updateState({ swapState: "loading", swapData });
      submitAnalytics();

      if (minNativeTokenBalance) {
        const hasMinNativeTokenBalance = await ensureNativeBalance();
        if (!hasMinNativeTokenBalance.data) {
          throw new Error(`Insufficient ${nativeSymbol} balance, you need at least ${minNativeTokenBalance}${nativeSymbol} to cover the transaction fees.`);
        }
      }

      let token = srcToken;

      if (shouldWrap) {
        updateState({ swapStep: "wrap" });
        await wrapToken();
        updateState({ wrapSuccess: true });
        token = wToken;
      }

      if (!haveAllowance) {
        updateState({ swapStep: "approve" });
        await approve(token);
        const res = await getHasAllowance(token, srcAmount.amount);
        if (!res) {
          throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
        }
        updateState({ approveSuccess: true });
      }

      updateState({ swapStep: "createOrder" });
      const order = await createOrder(token);
      await onSuccessCallback(order);
    },
    {
      onError(error) {
        if (wrapSuccess) {
          nativeToWrapped();
        }
        if (isTxRejected(error)) {
          updateState({ swapState: undefined, swapData: undefined });
        } else {
          updateState({ swapState: "failed" });
        }
      },

      onSettled() {
        refetchAllowance();
      },
    },
  );

  const error = !mutate.error ? undefined : (mutate.error as any).message || "Failed to create order";

  return {
    ...mutate,
    swapState,
    error,
    swapStep,
    createOrdertxHash,
    approveTxHash,
    wrapTxHash,
  };
};

export const useCancelOrder = () => {
  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();
  const { account } = useTwapContext();
  const twapContract = useTwapContract();
  const onCancelOrder = query.useUpdateOrderStatusToCanceled();
  return useMutation(
    async (orderId: number) => {
      if (!twapContract) {
        throw new Error("twap contract not defined");
      }

      if (!account) {
        throw new Error("account not defined");
      }

      logger(`canceling order...`, orderId);

      analytics.onCancelOrder(orderId);
      await sendAndWaitForConfirmations(twapContract.methods.cancel(orderId), {
        from: account,
        maxPriorityFeePerGas: priorityFeePerGas,
        maxFeePerGas,
      });
      console.log(`order canceled`);
    },
    {
      onSuccess: (_, orderId) => {
        logger(`order canceled`);
        analytics.onCancelOrderSuccess();
        onCancelOrder(orderId);
      },
      onError: (error: Error) => {
        console.log(`cancel error order`, error);
        analytics.onTxError(error, "cancel");
      },
    },
  );
};
