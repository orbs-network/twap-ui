import { useMutation } from "@tanstack/react-query";
import { isTxRejected, SwapSteps } from "..";
import { waitForTransactionReceipt } from "viem/actions";
import BN from "bignumber.js";
import { erc20Abi, maxUint256, Hex, decodeEventLog } from "viem";
import { useTwapContext } from "../context";
import { useAmountBN, useDestTokenAmount, useHandleNativeAddress, useHasAllowanceCallback, useNetwork, useShouldWrap, useSrcAmount, useSubmitOrderArgs } from "./logic-hooks";
import { iwethabi, TwapAbi } from "@orbs-network/twap-sdk";
import { useCallback, useRef } from "react";
import { SwapStatus } from "@orbs-network/swap-ui";
import { useAddCancelledOrder, useAddNewOrder } from "./order-hooks";

export const useApproveToken = () => {
  const {
    account,
    isExactAppoval,
    config,
    srcToken,
    walletClient,
    publicClient,
    callbacks,
    state: { typedSrcAmount = "" },
    twapSDK,
  } = useTwapContext();
  const srcAmount = useAmountBN(srcToken?.decimals, typedSrcAmount);
  const approvalAmount = isExactAppoval ? srcAmount : maxUint256.toString();
  const tokenAddress = useHandleNativeAddress(srcToken?.address);

  return useMutation(
    async () => {
      if (!account) throw new Error("account is not defined");
      if (!approvalAmount) throw new Error("approvalAmount is not defined");
      if (!tokenAddress) throw new Error("tokenAddress is not defined");
      callbacks?.approve?.onRequest?.({ token: srcToken!, amount: typedSrcAmount || "" });
      const hash = await (walletClient as any).writeContract({
        abi: erc20Abi,
        functionName: "approve",
        args: [config.twapAddress as `0x${string}`, BigInt(BN(approvalAmount).decimalPlaces(0).toFixed())],
        account: account,
        address: tokenAddress,
      });

      await waitForTransactionReceipt(publicClient as any, {
        hash,
        confirmations: 5,
      });

      twapSDK.analytics.onApproveSuccess(hash);
      callbacks?.approve.onSuccess?.({ token: srcToken!, txHash: hash, amount: isExactAppoval ? typedSrcAmount : maxUint256.toString() });
    },
    {
      onError: (error) => {
        callbacks?.approve.onFailed?.((error as any).message);
      },
    },
  );
};

export const useCancelOrder = () => {
  const { account, config, callbacks, walletClient, publicClient, twapSDK } = useTwapContext();

  const addCancelledOrder = useAddCancelledOrder();
  return useMutation(
    async (orderId: number) => {
      if (!account) {
        throw new Error("account not defined");
      }

      twapSDK.analytics.onCancelOrderRequest(orderId);
      callbacks?.cancelOrder.onRequest?.(orderId);
      const hash = await (walletClient as any).writeContract({
        account,
        address: config.twapAddress,
        abi: TwapAbi,
        functionName: "cancel",
        args: [orderId],
      });
      await waitForTransactionReceipt(publicClient as any, {
        hash,
        confirmations: 5,
      });

      console.log(`order canceled`);
      callbacks?.cancelOrder.onSuccess?.({ orderId, txHash: hash });
      await addCancelledOrder(orderId);
    },
    {
      onSuccess: () => {
        twapSDK.analytics.onCancelOrderSuccess();
      },
      onError: (error: Error) => {
        console.log(`cancel error order`, error);
        twapSDK.analytics.onCreateOrderError(error);
        callbacks?.cancelOrder.onFailed?.(error.message);
      },
    },
  );
};

export function decodeOrderCreatedEvent(topics: Hex[], data: Hex) {
  const decodedLog = (decodeEventLog as any)({
    abi: TwapAbi,
    data,
    topics,
    eventName: "OrderCreated",
  });

  return decodedLog.args;
}

const useCallbacks = () => {
  const {
    twapSDK,
    account,
    callbacks,
    srcToken,
    dstToken,
    state: { typedSrcAmount },
  } = useTwapContext();
  const addNewOrder = useAddNewOrder();

  const destTokenAmountUI = useDestTokenAmount().amountUI;
  const onRequest = useCallback((params: string[]) => twapSDK.analytics.onCreateOrderRequest(params, account), [twapSDK, account]);
  const onSuccess = useCallback(
    async (orderId: number, txHash: string, params: string[]) => {
      twapSDK.analytics.onCreateOrderSuccess(txHash, orderId);
      callbacks?.createOrder?.onSuccess?.({
        srcToken: srcToken!,
        dstToken: dstToken!,
        orderId,
        srcAmount: typedSrcAmount || "0",
        dstAmount: destTokenAmountUI,
        txHash,
      });
      await addNewOrder({ Contract_id: orderId, transactionHash: txHash, params });
    },
    [callbacks, srcToken, dstToken, typedSrcAmount, destTokenAmountUI, twapSDK, addNewOrder],
  );
  const onError = useCallback(
    (error: any) => {
      callbacks?.createOrder?.onFailed?.((error as any).message);
      twapSDK.analytics.onCreateOrderError(error);
    },
    [callbacks, twapSDK],
  );

  return {
    onRequest,
    onSuccess,
    onError,
  };
};

export const useCreateOrder = () => {
  const { account, updateState, dstToken, walletClient, publicClient } = useTwapContext();
  const submitOrderArgs = useSubmitOrderArgs();
  const callbacks = useCallbacks();

  return useMutation(
    async () => {
      if (!dstToken) throw new Error("dstToken is not defined");
      if (!account) throw new Error("account is not defined");
      if (!submitOrderArgs) throw new Error("submitOrderArgs is not defined");

      callbacks.onRequest(submitOrderArgs.params);

      const hash = await (walletClient as any).writeContract({
        account,
        address: submitOrderArgs.contract,
        abi: submitOrderArgs.abi,
        functionName: submitOrderArgs.method,
        args: [submitOrderArgs.params],
      });
      const receipt = await waitForTransactionReceipt(publicClient as any, {
        hash,
        confirmations: 5,
      });

      updateState({ createOrderTxHash: receipt.transactionHash });
      const decodedEvent = decodeOrderCreatedEvent(receipt.logs[0].topics, receipt.logs[0].data);

      const orderId = Number(decodedEvent.id);
      await callbacks.onSuccess(orderId, hash, submitOrderArgs.params);

      return {
        orderId,
        txHash: hash,
      };
    },
    {
      onError(error) {
        console.log({ error });
        callbacks.onError(error);
      },
    },
  );
};

export const useWrapToken = () => {
  const {
    account,
    walletClient,
    publicClient,
    callbacks,
    state: { typedSrcAmount },
    twapSDK,
  } = useTwapContext();
  const srcAmountWei = useSrcAmount().amountWei;

  const tokenAddress = useNetwork()?.wToken.address;

  return useMutation(
    async () => {
      if (!srcAmountWei) throw new Error("srcAmount is not defined");
      if (!account) throw new Error("account is not defined");
      callbacks?.wrap.onRequest?.(typedSrcAmount || "");
      const hash = await (walletClient as any).writeContract({
        abi: iwethabi,
        functionName: "deposit",
        account: account,
        address: tokenAddress,
        value: BN(srcAmountWei).decimalPlaces(0).toFixed(),
      });

      await waitForTransactionReceipt(publicClient as any, {
        hash,
        confirmations: 5,
      });

      twapSDK.analytics.onWrapSuccess(hash);
      callbacks?.wrap.onSuccess?.({ txHash: hash, amount: typedSrcAmount || "" });
    },
    {
      onError: (error) => {
        callbacks?.wrap?.onFailed?.((error as any).message);
      },
    },
  );
};

export const useWrapOnly = () => {
  const { mutateAsync } = useWrapToken();
  const { reset, actions } = useTwapContext();

  return useMutation(async () => {
    await mutateAsync();
    reset();
    await actions.refetchBalances?.();
  });
};

export const useUnwrapToken = () => {
  const { account, reset, walletClient, publicClient, actions } = useTwapContext();
  const tokenAddress = useNetwork()?.wToken.address;
  const srcAmountWei = useSrcAmount().amountWei;

  return useMutation(async () => {
    if (!tokenAddress) {
      throw new Error("address is not defined");
    }
    if (!account) {
      throw new Error("account is not defined");
    }

    const hash = await (walletClient as any).writeContract({
      abi: iwethabi,
      functionName: "withdraw",
      account: account,
      address: tokenAddress,
      args: [BN(srcAmountWei).decimalPlaces(0).toFixed()],
    });

    await waitForTransactionReceipt(publicClient as any, {
      hash,
      confirmations: 5,
    });

    reset();
    await actions.refetchBalances?.();
  });
};

const getSteps = (shouldWrap?: boolean, shouldApprove?: boolean) => {
  const steps: number[] = [];

  if (shouldWrap) {
    steps.push(SwapSteps.WRAP);
  }
  if (shouldApprove) {
    steps.push(SwapSteps.APPROVE);
  }

  steps.push(SwapSteps.CREATE);
  return steps;
};

const useSubmitOrderCallbacks = () => {
  const {
    callbacks,
    srcToken,
    dstToken,
    state: { typedSrcAmount },
  } = useTwapContext();
  const dstAmount = useDestTokenAmount().amountUI;
  const onRequest = useCallback(() => {
    callbacks?.onSubmitOrderRequest?.({
      srcToken: srcToken!,
      dstToken: dstToken!,
      srcAmount: typedSrcAmount || "",
      dstAmount,
    });
  }, [callbacks, srcToken, dstToken, typedSrcAmount, dstAmount]);
  return { onRequest };
};

export const useSubmitOrderCallback = () => {
  const { state, updateState, srcToken, dstToken, actions } = useTwapContext();
  const { swapStatus, swapStep, createOrderTxHash, approveTxHash, wrapTxHash } = state;
  const { mutateAsync: getHasAllowance } = useHasAllowanceCallback();
  const shouldWrap = useShouldWrap();
  const wToken = useNetwork()?.wToken;
  const approve = useApproveToken().mutateAsync;
  const wrapToken = useWrapToken().mutateAsync;
  const createOrder = useCreateOrder().mutateAsync;
  const { onRequest } = useSubmitOrderCallbacks();
  const wrappedRef = useRef(false);
  const mutate = useMutation(
    async () => {
      wrappedRef.current = false;
      if (!srcToken || !dstToken) throw new Error("Please select a token to swap");
      if (!wToken) throw new Error("Wrapped Token not defined");

      onRequest();
      const haveAllowance = await getHasAllowance();
      const steps = getSteps(shouldWrap, !haveAllowance);
      updateState({ swapStatus: SwapStatus.LOADING, swapSteps: steps });

      if (shouldWrap) {
        updateState({ swapStep: SwapSteps.WRAP });
        await wrapToken();
        updateState({ isWrapped: true });
        wrappedRef.current = true;
      }

      if (!haveAllowance) {
        updateState({ swapStep: SwapSteps.APPROVE });
        await approve();
        // make sure the allowance was set
        if (!(await getHasAllowance())) {
          throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
        }
      }

      updateState({ swapStep: SwapSteps.CREATE });
      const order = await createOrder();
      // we refetch balances only if we wrapped the token
      if (wrappedRef.current) {
        await actions.refetchBalances?.();
      }
      updateState({ swapStatus: SwapStatus.SUCCESS });
      return order;
    },
    {
      onError(error) {
        if (isTxRejected(error) && !wrappedRef.current) {
          updateState({ swapStep: undefined, swapStatus: undefined });
        } else {
          updateState({ swapStatus: SwapStatus.FAILED, swapError: (error as any).message });
        }
      },
    },
  );

  return {
    ...mutate,
    swapStep,
    approveTxHash,
    wrapTxHash,
    createOrderTxHash,
    swapStatus,
  };
};
