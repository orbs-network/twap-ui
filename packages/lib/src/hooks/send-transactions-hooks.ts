import { useMutation } from "@tanstack/react-query";
import { Steps, Token } from "../types";
import BN from "bignumber.js";
import { erc20Abi, maxUint256, TransactionReceipt } from "viem";
import { useTwapContext } from "../context";
import {
  useDestTokenAmount,
  useHasAllowanceCallback,
  useNetwork,
  useSrcAmount,
  useDestTokenMinAmount,
  useFillDelay,
  useOrderDeadline,
  useSrcTokenChunkAmount,
} from "./logic-hooks";
import { amountUi, isNativeAddress, iwethabi, Order, TwapAbi } from "@orbs-network/twap-sdk";
import { useCallback, useMemo, useRef, useState } from "react";
import { SwapStatus } from "@orbs-network/swap-ui";
import { useOptimisticAddOrder, useOptimisticCancelOrder, useOrders } from "./order-hooks";
import { useTwapStore } from "../useTwapStore";
import { ensureWrappedToken, getOrderIdFromCreateOrderEvent, isTxRejected } from "../utils";

const useGetTransactionReceipt = () => {
  const { publicClient } = useTwapContext();

  return useMutation(async (txHash: `0x${string}`) => {
    if (!publicClient) throw new Error("publicClient is not defined");

    const maxRetries = 10;
    let attempt = 0;
    let delay = 1000;

    while (attempt < maxRetries) {
      try {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 2,
          retryDelay: delay,
        });
        return receipt;
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          throw new Error(`Failed after ${maxRetries} attempts: ${error}`);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }).mutateAsync;
};
export const useApproveToken = () => {
  const { account, config, walletClient, publicClient, callbacks, twapSDK } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const getTransactionReceipt = useGetTransactionReceipt();
  return useMutation(
    async ({ token, amount }: { token: Token; amount: string }) => {
      if (!account) throw new Error("account is not defined");
      if (!walletClient) throw new Error("walletClient is not defined");
      if (!publicClient) throw new Error("publicClient is not defined");

      callbacks?.approve?.onRequest?.(token, amountUi(token?.decimals, amount));
      const hash = await walletClient.writeContract({
        abi: erc20Abi,
        functionName: "approve",
        account: account as `0x${string}`,
        address: token.address as `0x${string}`,
        args: [config.twapAddress as `0x${string}`, BigInt(BN(amount).decimalPlaces(0).toFixed())],
        chain: walletClient.chain,
      });
      updateState({ approveTxHash: hash });
      const receipt = await getTransactionReceipt(hash);

      if (!receipt) {
        throw new Error("failed to get transaction receipt");
      }

      if (receipt.status === "reverted") {
        throw new Error("failed to approve token");
      }

      twapSDK.analytics.onApproveSuccess(hash);
      callbacks?.approve?.onSuccess?.(receipt, token!, amountUi(token?.decimals, amount));
    },
    {
      onError: (error) => {
        callbacks?.approve?.onFailed?.((error as any).message);
      },
    },
  );
};

export const useCancelOrder = () => {
  const { account, callbacks, walletClient, publicClient, twapSDK } = useTwapContext();
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [swapStatus, setSwapStatus] = useState<SwapStatus | undefined>(undefined);
  const getTransactionReceipt = useGetTransactionReceipt();

  const optimisticCancelOrder = useOptimisticCancelOrder();
  const mutation = useMutation(
    async (order: Order) => {
      if (!account) throw new Error("account not defined");
      if (!walletClient) throw new Error("walletClient not defined");
      if (!publicClient) throw new Error("publicClient not defined");
      setTxHash(undefined);
      setSwapStatus(SwapStatus.LOADING);
      twapSDK.analytics.onCancelOrderRequest(order.id);
      callbacks?.cancelOrder?.onRequest?.(order.id);
      const hash = await walletClient.writeContract({
        account: account as `0x${string}`,
        address: order.twapAddress as `0x${string}`,
        abi: TwapAbi,
        functionName: "cancel",
        args: [order.id],
        chain: walletClient.chain,
      });
      setTxHash(hash);
      const receipt = await getTransactionReceipt(hash);

      if (!receipt) {
        throw new Error("failed to get transaction receipt");
      }

      if (receipt.status === "reverted") {
        throw new Error("failed to cancel order");
      }

      console.log(`order canceled`);
      callbacks?.cancelOrder?.onSuccess?.(receipt, order.id);
      optimisticCancelOrder(order.id);
      return hash;
    },
    {
      onSuccess: () => {
        twapSDK.analytics.onCancelOrderSuccess();
        setSwapStatus(SwapStatus.SUCCESS);
      },
      onError: (error: Error) => {
        console.log(`cancel error order`, error);
        if (isTxRejected(error)) {
          setSwapStatus(undefined);
        } else {
          setSwapStatus(SwapStatus.FAILED);
          twapSDK.analytics.onCreateOrderError(error);
          callbacks?.cancelOrder?.onFailed?.(error.message);
        }
      },
    },
  );
  const resetSwapStatus = useCallback(() => {
    setSwapStatus(undefined);
    mutation.reset();
  }, [mutation]);

  return { ...mutation, txHash, swapStatus, resetSwapStatus };
};

const useCallbacks = () => {
  const { twapSDK, account, callbacks, srcToken, dstToken } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const optimisticAddOrder = useOptimisticAddOrder();
  const destTokenAmountUI = useDestTokenAmount().amountUI;
  const { refetch: refetchOrders } = useOrders();
  const onRequest = useCallback((params: string[]) => twapSDK.analytics.onCreateOrderRequest(params, account), [twapSDK, account]);
  const onSuccess = useCallback(
    async (receipt: TransactionReceipt, params: string[], srcToken: Token, orderId?: number) => {
      twapSDK.analytics.onCreateOrderSuccess(receipt.transactionHash, orderId);
      callbacks?.createOrder?.onSuccess?.({
        srcToken: srcToken!,
        dstToken: dstToken!,
        orderId,
        srcAmount: typedSrcAmount || "0",
        dstAmount: destTokenAmountUI,
        receipt,
      });

      if (orderId === undefined || orderId === null) {
        return await refetchOrders();
      }

      optimisticAddOrder(orderId, receipt.transactionHash, params, srcToken, dstToken!);
    },
    [callbacks, srcToken, dstToken, typedSrcAmount, destTokenAmountUI, twapSDK, optimisticAddOrder, refetchOrders],
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

export const useOrderSubmissionArgs = () => {
  const { twapSDK: sdk, srcToken: _srcToken, dstToken, chainId, account } = useTwapContext();
  const destTokenMinAmount = useDestTokenMinAmount().amountWei;
  const srcChunkAmount = useSrcTokenChunkAmount().amountWei;
  const deadline = useOrderDeadline();
  const fillDelay = useFillDelay().fillDelay;
  const srcAmount = useSrcAmount().amountWei;

  return useMemo(() => {
    const srcToken = _srcToken && chainId ? ensureWrappedToken(_srcToken, chainId) : undefined;

    if (!srcToken || !dstToken) return;
    return {
      params: sdk.getAskParams({
        destTokenMinAmount,
        srcChunkAmount,
        deadline,
        fillDelay,
        srcAmount,
        srcTokenAddress: srcToken.address,
        destTokenAddress: dstToken.address,
      }),
      abi: TwapAbi,
      functionName: "ask",
      contractAddress: sdk.config.twapAddress,
      account,
    };
  }, [dstToken, destTokenMinAmount, srcChunkAmount, deadline, fillDelay, srcAmount, sdk, _srcToken, chainId, account]);
};

export const useCreateOrder = () => {
  const { account, walletClient, publicClient, chainId, dstToken } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const callbacks = useCallbacks();
  const orderSubmissionArgs = useOrderSubmissionArgs();
  const getTransactionReceipt = useGetTransactionReceipt();

  return useMutation(
    async (srcToken: Token) => {
      if (!account) throw new Error("account is not defined");
      if (!walletClient) throw new Error("walletClient is not defined");
      if (!publicClient) throw new Error("publicClient is not defined");
      if (!chainId) throw new Error("chainId is not defined");
      if (!dstToken) throw new Error("dstToken is not defined");

      if (!orderSubmissionArgs?.params) throw new Error("failed to get params for ask method");

      callbacks.onRequest(orderSubmissionArgs.params);

      const txHash = await walletClient.writeContract({
        account: account.toLowerCase() as `0x${string}`,
        address: orderSubmissionArgs.contractAddress.toLowerCase() as `0x${string}`,
        abi: orderSubmissionArgs.abi,
        functionName: orderSubmissionArgs.functionName,
        args: [orderSubmissionArgs.params],
        chain: walletClient.chain,
      });
      updateState({ createOrderTxHash: txHash });

      const receipt = await getTransactionReceipt(txHash);
      if (!receipt) {
        throw new Error("failed to get transaction receipt");
      }

      if (receipt.status === "reverted") {
        throw new Error("failed to create order");
      }
      const orderId = getOrderIdFromCreateOrderEvent(receipt);

      await callbacks.onSuccess(receipt, orderSubmissionArgs.params, srcToken, orderId);

      return {
        orderId,
        receipt,
      };
    },
    {
      onError(error) {
        console.error(error);
        callbacks.onError(error);
      },
    },
  );
};

export const useWrapToken = () => {
  const { account, walletClient, publicClient, callbacks, twapSDK } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount || "");
  const tokenAddress = useNetwork()?.wToken.address;
  const getTransactionReceipt = useGetTransactionReceipt();

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

      const receipt = await getTransactionReceipt(hash);
      if (!receipt) {
        throw new Error("failed to get transaction receipt");
      }

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
    },
  );
};

export const useWrapOnly = () => {
  const { mutateAsync } = useWrapToken();
  const srcAmount = useSrcAmount().amountWei;
  const resetState = useTwapStore((s) => s.resetState);
  return useMutation(async () => {
    await mutateAsync(srcAmount);
    resetState();
  });
};

export const useUnwrapToken = () => {
  const { account, walletClient, publicClient } = useTwapContext();
  const resetState = useTwapStore((s) => s.resetState);
  const updateState = useTwapStore((s) => s.updateState);
  const wTokenAddress = useNetwork()?.wToken.address;
  const { amountWei } = useSrcAmount();
  const getTransactionReceipt = useGetTransactionReceipt();

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
      const receipt = await getTransactionReceipt(hash);
      if (!receipt) {
        throw new Error("failed to get transaction receipt");
      }

      return receipt;
    },
    {
      onSuccess: resetState,
    },
  );
};

const getTotalSteps = (shouldWrap?: boolean, shouldApprove?: boolean) => {
  let stepsCount = 1;
  if (shouldWrap) stepsCount++;
  if (shouldApprove) stepsCount++;
  return stepsCount;
};

export const useSubmitOrderCallback = () => {
  const { srcToken, dstToken, isExactAppoval, chainId } = useTwapContext();
  const { mutateAsync: getHasAllowance } = useHasAllowanceCallback();
  const updateState = useTwapStore((s) => s.updateState);
  const approve = useApproveToken().mutateAsync;
  const wrapToken = useWrapToken().mutateAsync;
  const createOrder = useCreateOrder().mutateAsync;
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

      updateState({ swapStatus: SwapStatus.SUCCESS });
      return order;
    },
    {
      onError(error) {
        if (isTxRejected(error) && !wrappedRef.current) {
          updateState({ activeStep: undefined, swapStatus: undefined, currentStepIndex: undefined });
        } else {
          updateState({ swapStatus: SwapStatus.FAILED, swapError: (error as any).message });
        }
      },
    },
  );

  return {
    ...mutation,
    checkingApproval,
  };
};
