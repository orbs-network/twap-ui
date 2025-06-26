import { useMutation } from "@tanstack/react-query";
import { Callbacks, PublicClient, Steps, Token, WalletClient } from "../types";
import BN from "bignumber.js";
import { erc20Abi, TransactionReceipt } from "viem";
import { amountUi, getNetwork, isNativeAddress, iwethabi, Order, TimeDuration, TwapAbi, TwapSDK } from "@orbs-network/twap-sdk";
import { useCallback, useRef, useState } from "react";
import { SwapStatus } from "@orbs-network/swap-ui";
import { useTwapStore } from "../useTwapStore";
import { ensureWrappedToken, getOrderIdFromCreateOrderEvent, isTxRejected } from "../utils";
import { useOptimisticAddOrder, useOptimisticCancelOrder, useOrdersQuery } from "../lib/hooks";
import { getAllowance } from "../lib/lib";

export const useApproveToken = (sdk: TwapSDK, walletClient?: WalletClient, publicClient?: PublicClient, account?: string, callbacks?: Callbacks) => {
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
    },
    {
      onError: (error) => {
        callbacks?.approve?.onFailed?.((error as any).message);
      },
    }
  );
};

export const useCancelOrder = (sdk: TwapSDK, walletClient: WalletClient, publicClient: PublicClient, account?: string, callbacks?: Callbacks) => {
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [swapStatus, setSwapStatus] = useState<SwapStatus | undefined>(undefined);

  const optimisticCancelOrder = useOptimisticCancelOrder(sdk.config, account);
  const mutation = useMutation(
    async (order: Order) => {
      if (!account) throw new Error("account not defined");
      if (!walletClient) throw new Error("walletClient not defined");
      if (!publicClient) throw new Error("publicClient not defined");
      setTxHash(undefined);
      setSwapStatus(SwapStatus.LOADING);
      sdk.analytics.onCancelOrderRequest(order.id);
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
      optimisticCancelOrder(order.id);
      return hash;
    },
    {
      onSuccess: () => {
        sdk.analytics.onCancelOrderSuccess();
        setSwapStatus(SwapStatus.SUCCESS);
      },
      onError: (error: Error) => {
        console.log(`cancel error order`, error);
        if (isTxRejected(error)) {
          setSwapStatus(undefined);
        } else {
          setSwapStatus(SwapStatus.FAILED);
          sdk.analytics.onCreateOrderError(error);
          callbacks?.cancelOrder?.onFailed?.(error.message);
        }
      },
    }
  );
  const resetSwapStatus = useCallback(() => {
    setSwapStatus(undefined);
    mutation.reset();
  }, [mutation]);

  return { ...mutation, txHash, swapStatus, resetSwapStatus };
};

const useCallbacks = (sdk: TwapSDK, publicClient?: PublicClient, account?: string, srcToken?: Token, dstToken?: Token) => {
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const optimisticAddOrder = useOptimisticAddOrder(sdk.config, account);
  const { refetch: refetchOrders } = useOrdersQuery(sdk, publicClient, account);
  const onRequest = useCallback((params: string[]) => sdk.analytics.onCreateOrderRequest(params, account), [sdk, account]);
  const onSuccess = useCallback(
    async (receipt: TransactionReceipt, params: string[], srcToken: Token, orderId?: number) => {
      sdk.analytics.onCreateOrderSuccess(receipt.transactionHash, orderId);

      if (orderId === undefined || orderId === null) {
        return await refetchOrders();
      }

      optimisticAddOrder(orderId, receipt.transactionHash, params, srcToken, dstToken!);
    },
    [srcToken, dstToken, typedSrcAmount, sdk, optimisticAddOrder, refetchOrders]
  );

  const onError = useCallback(
    (error: any) => {
      sdk.analytics.onCreateOrderError(error);
    },
    [sdk]
  );

  return {
    onRequest,
    onSuccess,
    onError,
  };
};

export const useCreateOrder = (sdk: TwapSDK, walletClient?: WalletClient, publicClient?: PublicClient, account?: string, srcToken?: Token, dstToken?: Token) => {
  const updateState = useTwapStore((s) => s.updateState);
  const callbacks = useCallbacks(sdk, publicClient, account, srcToken, dstToken);

  return useMutation(
    async ({
      srcToken,
      srcAmount,
      fillDelay,
      deadline,
      srcChunkAmount,
      destTokenMinAmount,
    }: {
      srcToken: Token;
      srcAmount: string;
      fillDelay: TimeDuration;
      deadline: number;
      srcChunkAmount: string;
      destTokenMinAmount: string;
    }) => {
      if (!account) throw new Error("account is not defined");
      if (!walletClient) throw new Error("walletClient is not defined");
      if (!publicClient) throw new Error("publicClient is not defined");
      if (!dstToken) throw new Error("dstToken is not defined");

      const params = sdk.getAskParams({
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
        address: sdk.config.twapAddress.toLowerCase() as `0x${string}`,
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
    }
  );
};

export const useWrapToken = (sdk: TwapSDK, walletClient?: WalletClient, publicClient?: PublicClient, account?: string) => {
  const updateState = useTwapStore((s) => s.updateState);
  const tokenAddress = getNetwork(sdk.config.chainId)?.wToken.address;

  return useMutation(
    async (amount: string) => {
      if (!account) throw new Error("account is not defined");
      if (!tokenAddress) throw new Error("tokenAddress is not defined");
      if (!walletClient) throw new Error("walletClient is not defined");
      if (!publicClient) throw new Error("publicClient is not defined");
      sdk.analytics.onWrapRequest();
      const hash = await walletClient.writeContract({
        abi: iwethabi,
        functionName: "deposit",
        account: account as `0x${string}`,
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

      sdk.analytics.onWrapSuccess(hash);
      return receipt;
    },
    {
      onError: (error) => {
        sdk.analytics.onWrapError(error);
      },
    }
  );
};

export const useWrapOnly = (sdk: TwapSDK, walletClient?: WalletClient, publicClient?: PublicClient, account?: string) => {
  const { mutateAsync } = useWrapToken(sdk, walletClient, publicClient, account);
  const resetState = useTwapStore((s) => s.resetState);
  return useMutation(async (srcAmount: string) => {
    await mutateAsync(srcAmount);
    resetState();
  });
};

export const useUnwrapToken = (walletClient?: WalletClient, publicClient?: PublicClient, account?: string) => {
  const resetState = useTwapStore((s) => s.resetState);
  const updateState = useTwapStore((s) => s.updateState);
  const wTokenAddress = getNetwork()?.wToken.address;

  return useMutation(
    async (srcAmount: string) => {
      if (!wTokenAddress) throw new Error("wTokenAddress is not defined");
      if (!account) throw new Error("account is not defined");
      if (!walletClient) throw new Error("walletClient is not defined");
      if (!publicClient) throw new Error("publicClient is not defined");

      const hash = await walletClient.writeContract({
        abi: iwethabi,
        functionName: "withdraw",
        account: account as `0x${string}`,
        address: wTokenAddress as `0x${string}`,
        args: [BigInt(BN(srcAmount).decimalPlaces(0).toFixed())],
        chain: walletClient.chain,
      });
      updateState({ unwrapTxHash: hash });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 2,
      });

      return receipt;
    },
    {
      onSuccess: resetState,
    }
  );
};

const getTotalSteps = (shouldWrap?: boolean, shouldApprove?: boolean) => {
  let stepsCount = 1;
  if (shouldWrap) stepsCount++;
  if (shouldApprove) stepsCount++;
  return stepsCount;
};

const useHasAllowanceCallback = (sdk: TwapSDK, publicClient?: PublicClient, account?: string) => {
  return useMutation({
    mutationFn: async ({ token, amount }: { token: Token; amount: string }) => {
      if (!publicClient) throw new Error("publicClient is not defined");
      if (!account) throw new Error("account is not defined");
      const allowance = await getAllowance(token.address, account, sdk.config.twapAddress, publicClient);

      return BN(allowance).gte(amount);
    },
  });
};

export const useSubmitOrderCallback = (
  sdk: TwapSDK,
  walletClient?: WalletClient,
  publicClient?: PublicClient,
  account?: string,
  srcToken?: Token,
  dstToken?: Token
) => {
  const { mutateAsync: getHasAllowance } = useHasAllowanceCallback(sdk, publicClient, account);
  const updateState = useTwapStore((s) => s.updateState);
  const approve = useApproveToken(sdk, walletClient, publicClient, account).mutateAsync;
  const wrapToken = useWrapToken(sdk, walletClient, publicClient, account).mutateAsync;
  const createOrder = useCreateOrder(sdk, walletClient, publicClient, account, srcToken, dstToken).mutateAsync;
  const [checkingApproval, setCheckingApproval] = useState(false);

  const wrappedRef = useRef(false);
  const mutation = useMutation(
    async ({
      srcAmount,
      fillDelay,
      deadline,
      srcChunkAmount,
      destTokenMinAmount,
    }: {
      srcAmount: string;
      fillDelay: TimeDuration;
      deadline: number;
      srcChunkAmount: string;
      destTokenMinAmount: string;
    }) => {
      if (!srcToken) throw new Error("srcToken is not defined");
      if (!dstToken) throw new Error("dstToken is not defined");
      const ensureAllowance = () => getHasAllowance({ token: ensureWrappedToken(srcToken, sdk.config.chainId), amount: srcAmount });
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
        await approve({ token: ensureWrappedToken(srcToken, sdk.config.chainId), amount: srcAmount });
        // make sure the allowance was set
        if (!(await ensureAllowance())) {
          throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
        }
        stepIndex++;
        updateState({ currentStepIndex: stepIndex });
      }
      updateState({ activeStep: Steps.CREATE });
      const order = await createOrder({
        srcToken: ensureWrappedToken(srcToken, sdk.config.chainId),
        srcAmount,
        fillDelay,
        deadline,
        srcChunkAmount,
        destTokenMinAmount,
      });

      // we refetch balances only if we wrapped the token
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
    }
  );

  return {
    ...mutation,
    checkingApproval,
  };
};
