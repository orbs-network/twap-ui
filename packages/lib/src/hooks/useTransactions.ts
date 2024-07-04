import { zeroAddress, zero, parseEvents, sendAndWaitForConfirmations, TokenData, web3, erc20, iwethabi, maxUint256 } from "@defi.org/web3-candies";
import { OrderInputValidation, TokensValidation } from "@orbs-network/twap";
import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context";
import { useTwapStore, useOrdersStore } from "../store";
import {
  useChunks,
  useDeadline,
  useDeadlineUi,
  useDstAmountUsdUi,
  useDstMinAmountOut,
  useDstMinAmountOutUi,
  useFillDelayMillis,
  useFillDelayText,
  useOutAmount,
  useResetAfterSwap,
  useShouldOnlyWrap,
  useShouldWrap,
  useSrcChunkAmount,
  useSrcChunkAmountUi,
  useSrcUsd,
} from "./hooks";
import { query } from "./query";
import BN from "bignumber.js";
import { isTxRejected } from "../utils";
import { useCallback } from "react";
import { analytics } from "../analytics";

export const useCreateOrder = () => {
  const { maxFeePerGas, priorityFeePerGas } = query.useGasPrice();
  const store = useTwapStore();
  const createOrder = useCreateOrderCallback();
  const { askDataParams, lib } = useTwapContext();
  const dstMinAmountOut = useDstMinAmountOut();
  const srcUsd = useSrcUsd().value.toString();
  const srcChunkAmount = useSrcChunkAmount();
  const deadline = useDeadline();
  const fillDelayMillisUi = useFillDelayMillis();
  return useMutation(
    async (srcToken: TokenData) => {
      analytics.updateAction("create");

      const dstToken = {
        ...store.dstToken!,
        address: lib!.validateTokens(srcToken!, store.dstToken!) === TokensValidation.dstTokenZero ? zeroAddress : store.dstToken!.address,
      };

      const fillDelayMillis = (fillDelayMillisUi - lib!.estimatedDelayBetweenChunksMillis()) / 1000;

      const onTxHash = (createOrdertxHash: string) => {
        store.updateState({
          createOrdertxHash,
        });
      };

      const data = await createOrder(
        onTxHash,
        srcToken!,
        dstToken,
        store.getSrcAmount(),
        srcChunkAmount,
        dstMinAmountOut,
        deadline,
        fillDelayMillis,
        srcUsd,
        askDataParams,
        priorityFeePerGas || zero,
        maxFeePerGas
      );
      analytics.onCreateOrderSuccess(data.orderId, data.txHash);
      return data;
    },
    {
      onError: (error) => {
        analytics.onTxError(error, "create");
      },
    }
  );
};

function useCreateOrderCallback() {
  const lib = useTwapContext()?.lib;
  return async (
    onTxHash: (txHash: string) => void,
    srcToken: TokenData,
    dstToken: TokenData,
    srcAmount: BN.Value,
    srcChunkAmount: BN.Value,
    dstMinChunkAmountOut: BN.Value,
    deadline: number,
    fillDelaySeconds: number,
    srcUsd: BN.Value,
    askDataParams: any[] = [],
    maxPriorityFeePerGas?: BN.Value,
    maxFeePerGas?: BN.Value
  ): Promise<{ txHash: string; orderId: number }> => {
    if (!lib) {
      throw new Error("lib is not defined");
    }

    const validation = lib?.validateOrderInputs(srcToken, dstToken, srcAmount, srcChunkAmount, dstMinChunkAmountOut, deadline, fillDelaySeconds, srcUsd);
    if (validation !== OrderInputValidation.valid) throw new Error(`invalid inputs: ${validation}`);

    const askData = lib?.config.exchangeType === "PangolinDaasExchange" ? web3().eth.abi.encodeParameters(["address"], askDataParams) : [];

    const askParams = [
      lib.config.exchangeAddress,
      srcToken.address,
      dstToken.address,
      BN(srcAmount).toFixed(0),
      BN(srcChunkAmount).toFixed(0),
      BN(dstMinChunkAmountOut).toFixed(0),
      BN(deadline).div(1000).toFixed(0),
      BN(lib.config.bidDelaySeconds).toFixed(0),
      BN(fillDelaySeconds).toFixed(0),
    ];

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
        maxPriorityFeePerGas,
        maxFeePerGas,
      },
      undefined,
      undefined,
      {
        onTxHash,
      }
    );

    const events = parseEvents(tx, lib.twap.options.jsonInterface);
    return { txHash: tx.transactionHash, orderId: Number(events[0].returnValues.id) };
  };
}

export const useWrapToken = () => {
  const { srcAmount, updateState } = useTwapStore((state) => ({
    srcAmount: state.getSrcAmount(),
    srcToken: state.srcToken,
    dstToken: state.dstToken,
    updateState: state.updateState,
  }));
  const { lib } = useTwapContext();
  const useWrapOnly = useShouldOnlyWrap();
  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();

  return useMutation(
    async () => {
      let txHash: string = "";
      if (!lib) {
        throw new Error("lib is not defined");
      }
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
          onTxHash: (txHash: string) => {
            txHash = txHash;
            updateState({ wrapTxHash: txHash });
          },
        }
      );
      analytics.onWrapSuccess(txHash);
    },
    {
      onError: (error) => {
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

  const { srcAmount, updateState } = useTwapStore((state) => ({
    srcAmount: state.getSrcAmount(),
    updateState: state.updateState,
  }));

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
          onTxHash: (txHash: string) => {
            txHash = txHash;
            updateState({ unwrapTxHash: txHash });
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
  const updateState = useTwapStore((s) => s.updateState);

  const lib = useTwapContext().lib;

  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();
  return useMutation(
    async (token: TokenData) => {
      if (!lib) {
        throw new Error("Lib is not defined");
      }
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
          onTxHash: (approveTxHash) => {
            txHash = approveTxHash;
            updateState({ approveTxHash });
          },
        }
      );
      analytics.onApproveSuccess(txHash);
    },
    {
      onError: (error) => {
        analytics.onTxError(error, "approve");
      },
    }
  );
};
const useOnSuccessCallback = () => {
  const { srcAmount, srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
    srcAmount: s.getSrcAmount().toString(),
  }));

  const dstAmountUsdUi = useDstAmountUsdUi();
  const outAmountRaw = useOutAmount().outAmountRaw;

  const { onTxSubmitted } = useTwapContext();
  return useCallback(
    (order: { txHash: string; orderId: number }) => {
      onTxSubmitted?.({
        srcToken: srcToken!,
        dstToken: dstToken!,
        srcAmount,
        dstUSD: dstAmountUsdUi!,
        dstAmount: outAmountRaw || "",
        txHash: order.txHash,
      });
    },
    [srcToken, dstToken, srcAmount, dstAmountUsdUi, outAmountRaw, onTxSubmitted]
  );
};

const useSubmitAnalytics = () => {
  const { srcToken, srcAmount, dstToken, srcAmountUi } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
    srcAmount: s.getSrcAmount().toString(),
    srcAmountUi: s.srcAmountUi,
  }));
  const { lib } = useTwapContext();
  const { outAmountRaw, outAmountUi } = useOutAmount();
  const chunks = useChunks();
  const minDstAmountOutUi = useDstMinAmountOutUi();
  const minDstAmountOut = useDstMinAmountOut();
  const fillDelay = useFillDelayMillis();
  const deadline = useDeadline();
  const deadlineUi = useDeadlineUi();
  const fillDelayUi = useFillDelayText();
  const srcChunkAmount = useSrcChunkAmount().toString();
  const srcChunkAmountUi = useSrcChunkAmountUi();

  return useCallback(() => {
    console.log({
      srcChunkAmount: srcChunkAmount.toString(),
      minDstAmountOut,
      deadline,
      fillDelayMillis: fillDelay,
    });

    analytics.onSubmitOrder({
      fromTokenAddress: srcToken?.address,
      toTokenAddress: dstToken?.address,
      fromTokenSymbol: srcToken?.symbol,
      toTokenSymbol: dstToken?.symbol,
      fromTokenAmount: srcAmount,
      fromTokenAmountUi: srcAmountUi,
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
    srcAmountUi,
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
    fillDelay,
  ]);
};

export const useSubmitOrderFlow = () => {
  const { srcToken, swapState, updateState, swapStep, createOrdertxHash, approveTxHash, wrapTxHash, srcAmount } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    swapState: s.swapState,
    updateState: s.updateState,
    swapStep: s.swapStep,
    createOrdertxHash: s.createOrdertxHash,
    approveTxHash: s.approveTxHash,
    wrapTxHash: s.wrapTxHash,
    srcAmount: s.getSrcAmount().toString(),
  }));
  const { data: haveAllowance } = query.useAllowance();
  const { mutateAsync: approve } = useApproveToken();
  const { lib, minNativeTokenBalance } = useTwapContext();
  const { refetch: refetchNativeBalance } = query.useMinNativeTokenBalance(minNativeTokenBalance);
  const { refetch: refetchOrderHistory } = query.useOrdersHistory();
  const { setTab } = useOrdersStore();
  const shouldWrap = useShouldWrap();
  const { mutateAsync: wrapToken } = useWrapToken();
  const { mutateAsync: createOrder } = useCreateOrder();
  const onSuccessCallback = useOnSuccessCallback();
  const wToken = lib?.config.wToken;
  const nativeSymbol = lib?.config.nativeToken.symbol;
  const { refetch: refetchAllowance } = query.useAllowance();
  const reset = useResetAfterSwap();
  const submitAnalytics = useSubmitAnalytics();

  const mutate = useMutation(
    async () => {
      if (!srcToken) {
        throw new Error("Please select a token to swap");
      }

      if (!wToken) {
        throw new Error("WToken not defined");
      }
      submitAnalytics();
      updateState({ swapState: "loading" });

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
        if (isTxRejected(error)) {
          updateState({ swapState: "rejected" });
        } else {
          updateState({ swapState: "failed" });
        }
      },
      onSuccess(data) {
        setTab(0);
        onSuccessCallback(data);
        refetchOrderHistory();
        updateState({ swapState: "success", createOrderSuccess: true, waitingForOrdersUpdate: true });
        reset();
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
      analytics.onCancelOrder(orderId);
      return lib?.cancelOrder(orderId, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: (_result) => {
        analytics.onCancelOrderSuccess();
        refetch();
      },
      onError: (error: Error) => {
        analytics.onTxError(error, "cancel");
      },
    }
  );
};
