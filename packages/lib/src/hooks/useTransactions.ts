import { zeroAddress, zero, parseEvents, sendAndWaitForConfirmations, TokenData, web3, erc20, iwethabi, maxUint256 } from "@defi.org/web3-candies";
import { OrderInputValidation, TokensValidation } from "@orbs-network/twap";
import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context";
import { useTwapStore, useOrdersStore } from "../store";
import { useDeadline, useDstAmountUsdUi, useDstMinAmountOut, useFillDelayMillis, useOutAmount, useResetAfterSwap, useShouldWrap, useSrcChunkAmount, useSrcUsd } from "./hooks";
import { query } from "./query";
import BN from "bignumber.js";
import { getTokenFromTokensList, isTxRejected } from "../utils";
import { useCallback } from "react";

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
  return useMutation(async (srcToken: TokenData) => {
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

    console.log({
      srcChunkAmount: srcChunkAmount.toString(),
      dstMinAmountOut,
      deadline,
      fillDelayMillis,
    });

    return createOrder(
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
  });
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
  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();

  return useMutation(async () => {
    if (!lib) {
      throw new Error("lib is not defined");
    }
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
          updateState({ wrapTxHash: txHash });
        },
      }
    );
  });
};

export const useWrapOnly = () => {
  const { mutateAsync } = useWrapToken();
  const onSuccess = useResetAfterSwap();

  return useMutation(async () => {
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

  return useMutation(async () => {
    if (!lib) {
      throw new Error("Lib not initialized");
    }

    await sendAndWaitForConfirmations(
      erc20<any>(lib.config.wToken.symbol, lib.config.wToken.address, lib.config.wToken.decimals, iwethabi).methods.withdraw(BN(srcAmount).toFixed(0)),
      { from: lib.maker, maxPriorityFeePerGas: priorityFeePerGas, maxFeePerGas },
      undefined,
      undefined,
      {
        onTxHash: (txHash: string) => {
          updateState({ unwrapTxHash: txHash });
        },
      }
    );
    await onSuccess();
  });
};

export const useApproveToken = () => {
  const updateState = useTwapStore((s) => s.updateState);

  const lib = useTwapContext().lib;

  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();
  return useMutation(async (token: TokenData) => {
    if (!lib) {
      throw new Error("Lib is not defined");
    }
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
          updateState({ approveTxHash });
        },
      }
    );
  });
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

const useSwitchNativeToWrapped = () => {
  const { updateState } = useTwapStore((s) => ({
    updateState: s.updateState,
  }));
  const { lib, dappTokens, onSrcTokenSelected } = useTwapContext();
  return useCallback(() => {
    updateState({ srcToken: lib!.config.wToken });
    const token = getTokenFromTokensList(dappTokens, lib!.config.wToken.address);
    if (token) {
      onSrcTokenSelected?.(token);
    }
  }, [lib, dappTokens, onSrcTokenSelected, updateState]);
};
export const useSubmitOrderFlow = () => {
  const { srcToken, swapState, updateState, swapStep, createOrdertxHash, approveTxHash, wrapTxHash, wrapSuccess, srcAmount } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    swapState: s.swapState,
    updateState: s.updateState,
    swapStep: s.swapStep,
    createOrdertxHash: s.createOrdertxHash,
    approveTxHash: s.approveTxHash,
    wrapTxHash: s.wrapTxHash,
    wrapSuccess: s.wrapSuccess,
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
  const nativeToWrapped = useSwitchNativeToWrapped();
  const { refetch: refetchAllowance } = query.useAllowance();
  const reset = useResetAfterSwap();

  const mutate = useMutation(
    async () => {
      if (!srcToken) {
        throw new Error("Please select a token to swap");
      }

      if (!wToken) {
        throw new Error("WToken not defined");
      }

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
          updateState({ swapState: undefined });
        } else {
          updateState({ swapState: "failed" });
        }
        if (wrapSuccess) {
          nativeToWrapped();
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
