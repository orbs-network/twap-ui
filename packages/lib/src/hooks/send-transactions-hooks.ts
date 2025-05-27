import { useMutation } from "@tanstack/react-query";
import { ensureWrappedToken, getOrderIdFromCreateOrderEvent, isTxRejected, Steps, Token, TwapOrder } from "..";
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
import { amountUi, isNativeAddress, iwethabi, TwapAbi } from "@orbs-network/twap-sdk";
import { useCallback, useRef, useState } from "react";
import { SwapStatus } from "@orbs-network/swap-ui";
import { useOrders, usePersistedOrdersStore } from "./order-hooks";
import { useTwapStore } from "../useTwapStore";

export const useApproveToken = () => {
  const { account, config, walletClient, publicClient, callbacks, twapSDK } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
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
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 2,
      });

      if (receipt.status === "reverted") {
        throw new Error("failed to approve token");
      }

      twapSDK.analytics.onApproveSuccess(hash);
      callbacks?.approve?.onSuccess?.(receipt, token!, amountUi(token?.decimals, amount));
    },
    {
      onError: (error) => {
        console.log({ error });

        callbacks?.approve?.onFailed?.((error as any).message);
      },
    },
  );
};

export const useCancelOrder = () => {
  const { account, callbacks, walletClient, publicClient, twapSDK } = useTwapContext();
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [swapStatus, setSwapStatus] = useState<SwapStatus | undefined>(undefined);

  const { addCancelledOrderId } = usePersistedOrdersStore(twapSDK.config);
  const mutation = useMutation(
    async (order: TwapOrder) => {
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
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 2,
      });

      if (receipt.status === "reverted") {
        throw new Error("failed to cancel order");
      }

      console.log(`order canceled`);
      callbacks?.cancelOrder?.onSuccess?.(receipt, order.id);
      addCancelledOrderId(order.id);
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
  const { addCreatedOrder } = usePersistedOrdersStore(twapSDK.config);
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

      if (!orderId) {
        return await refetchOrders();
      }

      addCreatedOrder(orderId, receipt.transactionHash, params, srcToken, dstToken!);
    },
    [callbacks, srcToken, dstToken, typedSrcAmount, destTokenAmountUI, twapSDK, addCreatedOrder, refetchOrders],
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
  const { account, walletClient, publicClient, twapSDK, chainId, dstToken } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const callbacks = useCallbacks();
  const srcAmount = useSrcAmount().amountWei;
  const destTokenMinAmount = useDestTokenMinAmount().amountWei;
  const srcChunkAmount = useSrcTokenChunkAmount().amountWei;
  const deadline = useOrderDeadline();
  const fillDelay = useFillDelay().fillDelay;

  return useMutation(
    async (srcToken: Token) => {
      if (!account) throw new Error("account is not defined");
      if (!walletClient) throw new Error("walletClient is not defined");
      if (!publicClient) throw new Error("publicClient is not defined");
      if (!chainId) throw new Error("chainId is not defined");
      if (!dstToken) throw new Error("dstToken is not defined");

      const params = twapSDK.getAskParams({
        destTokenMinAmount,
        srcChunkAmount,
        deadline,
        fillDelay,
        srcAmount,
        // src token cant be native token
        srcTokenAddress: srcToken.address,
        destTokenAddress: dstToken.address,
      });

      if (!params) throw new Error("failed to get params for ask method");

      callbacks.onRequest(params);

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
      await callbacks.onSuccess(receipt, params, srcToken, orderId);

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
  const { account, walletClient, publicClient, callbacks } = useTwapContext();
  const resetState = useTwapStore((s) => s.resetState);
  const updateState = useTwapStore((s) => s.updateState);
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
      onSuccess: resetState,
      onError: (error) => {
        callbacks.unwrap?.onFailed?.((error as any).message);
      },
    },
  );
};

const getTotalSteps = (shouldWrap?: boolean, shouldApprove?: boolean) => {
  let stepsCount = 1;
  if (shouldWrap) stepsCount++;
  if (shouldApprove) stepsCount++;
  return stepsCount;
};

const useSubmitOrderCallbacks = () => {
  const { callbacks, srcToken, dstToken } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount || "");
  const dstAmount = useDestTokenAmount().amountUI;
  const onRequest = useCallback(() => {
    callbacks?.onSubmitOrderRequest?.({
      srcToken: srcToken!,
      dstToken: dstToken!,
      srcAmount: typedSrcAmount,
      dstAmount,
    });
  }, [callbacks, srcToken, dstToken, typedSrcAmount, dstAmount]);
  return { onRequest };
};

export const useSubmitOrderCallback = () => {
  const { srcToken, dstToken, isExactAppoval, chainId } = useTwapContext();
  const { mutateAsync: getHasAllowance } = useHasAllowanceCallback();
  const updateState = useTwapStore((s) => s.updateState);
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
    },
  );

  return {
    ...mutation,
    checkingApproval,
  };
};
