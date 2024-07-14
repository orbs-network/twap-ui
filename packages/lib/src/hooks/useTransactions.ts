import { zeroAddress, zero, parseEvents, sendAndWaitForConfirmations, TokenData, web3, erc20, iwethabi, maxUint256 } from "@defi.org/web3-candies";
import { OrderInputValidation, Status, TokensValidation } from "@orbs-network/twap";
import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context/context";
import {
  useChunks,
  useDeadline,
  useDstAmountUsdUi,
  useDstMinAmountOut,
  useDstMinAmountOutUi,
  useFillDelayMillis,
  useFillDelayText,
  useIsMarketOrder,
  useOutAmount,
  useResetAfterSwap,
  useShouldOnlyWrap,
  useShouldWrap,
  useSrcAmount,
  useSrcChunkAmount,
  useSrcChunkAmountUi,
} from "./hooks";
import { query } from "./query";
import BN from "bignumber.js";
import { isTxRejected, logger } from "../utils";
import { useCallback } from "react";
import { analytics } from "../analytics";
import { stateActions, useSwitchNativeToWrapped } from "../context/actions";
import moment from "moment";

export const useCreateOrder = () => {
  const { maxFeePerGas, priorityFeePerGas } = query.useGasPrice();
  const { dappProps, lib, srcUsd, dstToken: _dstToken } = useTwapContext();
  const { askDataParams } = dappProps;
  const dstMinAmountOut = useDstMinAmountOut();
  const srcChunkAmount = useSrcChunkAmount();
  const deadline = useDeadline().millis;
  const fillDelayMillisUi = useFillDelayMillis();
  const srcAmount = useSrcAmount().srcAmountBN;
  const onTxHash = stateActions.useOnTxHash().onCreateOrderTxHash;

  return useMutation(
    async (srcToken: TokenData) => {
      analytics.updateAction("create");
      const dstToken = {
        ..._dstToken!,
        address: lib!.validateTokens(srcToken!, _dstToken!) === TokensValidation.dstTokenZero ? zeroAddress : _dstToken!.address,
      };

      const fillDelaySeconds = (fillDelayMillisUi - lib!.estimatedDelayBetweenChunksMillis()) / 1000;

      if (!lib) {
        throw new Error("lib is not defined");
      }

      const validation = lib?.validateOrderInputs(srcToken, dstToken, srcAmount, srcChunkAmount, dstMinAmountOut, deadline, fillDelaySeconds, srcUsd || "1");
      if (validation !== OrderInputValidation.valid) throw new Error(`invalid inputs: ${validation}`);

      const askData = lib?.config.exchangeType === "PangolinDaasExchange" ? web3().eth.abi.encodeParameters(["address"], askDataParams || []) : [];

      const askParams = [
        lib.config.exchangeAddress,
        srcToken.address,
        dstToken.address,
        BN(srcAmount).toFixed(0),
        BN(srcChunkAmount).toFixed(0),
        BN(dstMinAmountOut).toFixed(0),
        BN(deadline).div(1000).toFixed(0),
        BN(lib.config.bidDelaySeconds).toFixed(0),
        BN(fillDelaySeconds).toFixed(0),
      ];

      logger("create order args:", {
        exchangeAddress: lib.config.exchangeAddress,
        srcToken: srcToken.address,
        dstToken: dstToken.address,
        srcAmount: BN(srcAmount).toFixed(0),
        srcChunkAmount: BN(srcChunkAmount).toFixed(0),
        dstMinAmountOut: BN(dstMinAmountOut).toFixed(0),
        deadline: BN(deadline).div(1000).toFixed(0),
        bidDelaySeconds: BN(lib.config.bidDelaySeconds).toFixed(0),
        fillDelaySeconds: BN(fillDelaySeconds).toFixed(0),
        priorityFeePerGas: priorityFeePerGas.toString(),
        maxFeePerGas: maxFeePerGas.toString(),
      });

      let ask: any;
      if (lib.config.twapVersion > 3) {
        askParams.push(askData as any);
        ask = lib.twap.methods.ask(askParams as any);
      } else {
        ask = (lib.twap.methods as any).ask(...askParams);
      }

      const tx = await sendAndWaitForConfirmations(
        ask,
        {
          from: lib.maker,
          maxPriorityFeePerGas: priorityFeePerGas || zero,
          maxFeePerGas,
        },
        undefined,
        undefined,
        {
          onTxHash,
        }
      );

      const events = parseEvents(tx, lib.twap.options.jsonInterface);
      const data = { txHash: tx.transactionHash, orderId: Number(events[0].returnValues.id) };

      analytics.onCreateOrderSuccess(data.orderId, data.txHash);
      logger("order created:", "orderId:", data.orderId, "txHash:", data.txHash);
      return data;
    },
    {
      onError: (error) => {
        logger("order create failed:", error);
        analytics.onTxError(error, "create");
      },
    }
  );
};

export const useWrapToken = () => {
  const srcAmount = useSrcAmount().srcAmountBN;
  const { lib } = useTwapContext();

  const useWrapOnly = useShouldOnlyWrap();
  const onTxHash = stateActions.useOnTxHash().onWrapTxHash;
  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();

  return useMutation(
    async () => {
      let txHash: string = "";
      if (!lib) {
        throw new Error("lib is not defined");
      }
      logger("wrapping token");
      analytics.updateAction(useWrapOnly ? "wrap-only" : "wrap");
      await sendAndWaitForConfirmations(
        erc20<any>(lib.config.wToken.symbol, lib.config.wToken.address, lib.config.wToken.decimals, iwethabi).methods.deposit(),
        {
          from: lib.maker,
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
        }
      );
      logger("token wrap success:", txHash);
      analytics.onWrapSuccess(txHash);
    },
    {
      onError: (error) => {
        logger("token wrap failed:", error);
        analytics.onTxError(error, useWrapOnly ? "wrap-only" : "wrap");
      },
    }
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
  const lib = useTwapContext().lib;
  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();
  const onSuccess = useResetAfterSwap();
  const srcAmount = useSrcAmount().srcAmountBN;
  const onTxHash = stateActions.useOnTxHash().onUnwrapTxHash;

  return useMutation(
    async () => {
      let txHash: string = "";
      if (!lib) {
        throw new Error("Lib not initialized");
      }
      analytics.updateAction("unwrap");

      await sendAndWaitForConfirmations(
        erc20<any>(lib.config.wToken.symbol, lib.config.wToken.address, lib.config.wToken.decimals, iwethabi).methods.withdraw(BN(srcAmount).toFixed(0)),
        { from: lib.maker, maxPriorityFeePerGas: priorityFeePerGas, maxFeePerGas },
        undefined,
        undefined,
        {
          onTxHash: (hash) => {
            txHash = hash;
            onTxHash(hash);
          },
        }
      );
      analytics.onUnwrapSuccess(txHash);
      await onSuccess();
    },
    {
      onError: (error) => {
        analytics.onTxError(error, "unwrap");
      },
    }
  );
};

export const useApproveToken = () => {
  const onTxHash = stateActions.useOnTxHash().onApproveTxHash;

  const lib = useTwapContext().lib;

  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();
  return useMutation(
    async (token: TokenData) => {
      if (!lib) {
        throw new Error("Lib is not defined");
      }
      logger("approving token...");
      analytics.updateAction("approve");

      let txHash: string = "";
      const _token = erc20(token.symbol, token.address, token.decimals);
      await sendAndWaitForConfirmations(
        _token.methods.approve(lib.config.twapAddress, BN(maxUint256).toFixed(0)),
        {
          from: lib.maker,
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
        }
      );
      logger("token approve success:", txHash);
      analytics.onApproveSuccess(txHash);
    },
    {
      onError: (error) => {
        logger("token approve failed:", error);
        analytics.onTxError(error, "approve");
      },
    }
  );
};
const useOnSuccessCallback = () => {
  const { dappProps, state, lib, srcToken, dstToken } = useTwapContext();
  const { onTxSubmitted } = dappProps;
  const { srcAmountUi } = state;
  const srcAmount = useSrcAmount().srcAmountBN.toString();
  const dstAmountUsdUi = useDstAmountUsdUi();
  const outAmountRaw = useOutAmount().outAmountRaw;
  const addOrder = query.useAddNewOrder();
  const deadline = useDeadline().millis;
  const srcBidAmount = useSrcChunkAmount().toString();
  const dstMinAmount = useDstMinAmountOut();
  const fillDelayMillisUi = useFillDelayMillis();
  const totalChunks = useChunks();
  const onOrderCreated = stateActions.useOnOrderCreated();
  const reset = useResetAfterSwap();

  return useCallback(
    (order: { txHash: string; orderId: number }) => {
      const fillDelaySeconds = (fillDelayMillisUi - lib!.estimatedDelayBetweenChunksMillis()) / 1000;

      onOrderCreated(order.orderId);
      addOrder({
        srcTokenAddress: srcToken?.address,
        dstTokenAddress: dstToken?.address,
        srcAmount,
        createdAt: moment().unix().valueOf(),
        id: order.orderId,
        txHash: order.txHash,
        deadline: moment(deadline).unix(),
        srcBidAmount,
        dstMinAmount,
        fillDelay: fillDelaySeconds,
        totalChunks,
        status: Status.Open,
        srcToken,
        dstToken,
        exchange: lib?.config.exchangeAddress,
      });
      onTxSubmitted?.({
        srcToken: srcToken!,
        dstToken: dstToken!,
        srcAmount,
        dstUSD: dstAmountUsdUi!,
        dstAmount: outAmountRaw || "",
        txHash: order.txHash,
      });
      reset();
    },
    [
      srcToken,
      dstToken,
      srcAmount,
      dstAmountUsdUi,
      outAmountRaw,
      onTxSubmitted,
      srcAmountUi,
      deadline,
      srcBidAmount,
      dstMinAmount,
      fillDelayMillisUi,
      totalChunks,
      onOrderCreated,
      reset,
      lib,
    ]
  );
};

const useSubmitAnalytics = () => {
  const srcAmount = useSrcAmount();
  const { srcToken, dstToken } = useTwapContext();
  const { outAmountRaw, outAmountUi } = useOutAmount();
  const chunks = useChunks();
  const minDstAmountOutUi = useDstMinAmountOutUi();
  const minDstAmountOut = useDstMinAmountOut();
  const fillDelay = useFillDelayMillis();
  const { millis: deadline, text: deadlineUi } = useDeadline();

  const fillDelayUi = useFillDelayText();
  const srcChunkAmount = useSrcChunkAmount().toString();
  const srcChunkAmountUi = useSrcChunkAmountUi();

  return useCallback(() => {
    analytics.onSubmitOrder({
      fromTokenAddress: srcToken?.address,
      toTokenAddress: dstToken?.address,
      fromTokenSymbol: srcToken?.symbol,
      toTokenSymbol: dstToken?.symbol,
      fromTokenAmount: srcAmount.srcAmountBN.toString(),
      fromTokenAmountUi: srcAmount.srcAmountUi,
      toTokenAmount: outAmountRaw,
      toTokenAmountUi: outAmountUi,
      chunksAmount: chunks,
      minDstAmountOut,
      minDstAmountOutUi,
      fillDelay,
      fillDelayUi,
      deadline,
      deadlineUi,
      srcChunkAmount,
      srcChunkAmountUi,
    });
  }, [
    srcToken,
    dstToken,
    srcAmount,
    outAmountRaw,
    outAmountUi,
    chunks,
    minDstAmountOut,
    fillDelay,
    fillDelayUi,
    deadline,
    deadlineUi,
    minDstAmountOutUi,
    srcChunkAmount,
    srcChunkAmountUi,
    srcAmount.srcAmountUi,
    srcAmount.srcAmountBN.toString(),
  ]);
};

export const useSubmitOrderFlow = () => {
  const srcAmount = useSrcAmount().srcAmountBN.toString();
  const { lib, dappProps, updateState, state, srcToken } = useTwapContext();
  const { minNativeTokenBalance } = dappProps;
  const { swapState, swapStep, createOrdertxHash, approveTxHash, wrapTxHash, wrapSuccess } = state;
  const { data: haveAllowance } = query.useAllowance();
  const { mutateAsync: approve } = useApproveToken();
  const { refetch: refetchNativeBalance } = query.useMinNativeTokenBalance(minNativeTokenBalance);
  const shouldWrap = useShouldWrap();
  const { mutateAsync: wrapToken } = useWrapToken();
  const { mutateAsync: createOrder } = useCreateOrder();
  const onSuccessCallback = useOnSuccessCallback();
  const wToken = lib?.config.wToken;
  const nativeSymbol = lib?.config.nativeToken.symbol;
  const { refetch: refetchAllowance } = query.useAllowance();
  const submitAnalytics = useSubmitAnalytics();
  const onSubmitSwap = stateActions.useOnSubmitSwap();
  const nativeToWrapped = useSwitchNativeToWrapped();

  const mutate = useMutation(
    async () => {
      if (!srcToken) {
        throw new Error("Please select a token to swap");
      }

      if (!wToken) {
        throw new Error("WToken not defined");
      }
      logger(`Create order request`);
      onSubmitSwap();
      submitAnalytics();

      if (minNativeTokenBalance) {
        const hasMinNativeTokenBalance = await refetchNativeBalance();
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
        const res = await lib.hasAllowance(token, srcAmount);
        if (!res) {
          throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
        }
        updateState({ approveSuccess: true });
      }

      updateState({ swapStep: "createOrder" });
      return createOrder(token);
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
      onSuccess(data) {
        onSuccessCallback(data);
      },
      onSettled() {
        refetchAllowance();
      },
    }
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
  const { refetch } = query.useOrdersHistory();
  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();
  const lib = useTwapContext().lib;
  return useMutation(
    async (orderId: number) => {
      logger(`canceling order...`, orderId);

      analytics.onCancelOrder(orderId);
      await lib?.cancelOrder(orderId, priorityFeePerGas, maxFeePerGas);
      await refetch();
    },
    {
      onSuccess: () => {
        logger(`order canceled`);
        analytics.onCancelOrderSuccess();
      },
      onError: (error: Error) => {
        logger(`cancel error order`, error);
        analytics.onTxError(error, "cancel");
      },
    }
  );
};
