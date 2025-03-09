import { useMutation } from "@tanstack/react-query";
import { ensureWrappedToken, getOrderIdFromCreateOrderEvent, isTxRejected, SwapSteps, Token } from "..";
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
import { useCallback, useRef } from "react";
import { SwapStatus } from "@orbs-network/swap-ui";
import { useAddCancelledOrder, useAddNewOrder } from "./order-hooks";

export const useApproveToken = () => {
  const { account, config, walletClient, publicClient, callbacks, twapSDK } = useTwapContext();

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

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 5,
      });

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
  const { account, config, callbacks, walletClient, publicClient, twapSDK } = useTwapContext();

  const addCancelledOrder = useAddCancelledOrder();
  return useMutation(
    async (orderId: number) => {
      if (!account) throw new Error("account not defined");
      if (!walletClient) throw new Error("walletClient not defined");
      if (!publicClient) throw new Error("publicClient not defined");

      twapSDK.analytics.onCancelOrderRequest(orderId);
      callbacks?.cancelOrder?.onRequest?.(orderId);
      const hash = await walletClient.writeContract({
        account: account as `0x${string}`,
        address: config.twapAddress as `0x${string}`,
        abi: TwapAbi,
        functionName: "cancel",
        args: [orderId],
        chain: walletClient.chain,
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 5,
      });

      console.log(`order canceled`);
      callbacks?.cancelOrder?.onSuccess?.(receipt, orderId);
      await addCancelledOrder(orderId);
    },
    {
      onSuccess: () => {
        twapSDK.analytics.onCancelOrderSuccess();
      },
      onError: (error: Error) => {
        console.log(`cancel error order`, error);
        twapSDK.analytics.onCreateOrderError(error);
        callbacks?.cancelOrder?.onFailed?.(error.message);
      },
    },
  );
};

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
    async (orderId: number, receipt: TransactionReceipt, params: string[], srcToken: Token) => {
      twapSDK.analytics.onCreateOrderSuccess(receipt.transactionHash, orderId);
      callbacks?.createOrder?.onSuccess?.({
        srcToken: srcToken!,
        dstToken: dstToken!,
        orderId,
        srcAmount: typedSrcAmount || "0",
        dstAmount: destTokenAmountUI,
        receipt,
      });
      await addNewOrder({ Contract_id: orderId, transactionHash: receipt.transactionHash, params, srcToken, dstToken: dstToken! });
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
  const { account, updateState, walletClient, publicClient, twapSDK, chainId, dstToken } = useTwapContext();
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
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 5,
      });

      updateState({ createOrderTxHash: receipt.transactionHash });
      const orderId = getOrderIdFromCreateOrderEvent(receipt);
      await callbacks.onSuccess(orderId, receipt, params, srcToken);

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
  const {
    account,
    walletClient,
    publicClient,
    callbacks,
    state: { typedSrcAmount = "" },
    twapSDK,
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

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 5,
      });

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
  const { reset } = useTwapContext();
  const srcAmount = useSrcAmount().amountWei;
  return useMutation(async () => {
    await mutateAsync(srcAmount);
    reset();
  });
};

export const useUnwrapToken = () => {
  const { account, reset, walletClient, publicClient, callbacks } = useTwapContext();
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

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 5,
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
    },
  );
};

const getSteps = (shouldWrap?: boolean, shouldApprove?: boolean) => {
  const steps: number[] = [];

  if (shouldWrap) steps.push(SwapSteps.WRAP);
  if (shouldApprove) steps.push(SwapSteps.APPROVE);
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
  const { updateState, srcToken, dstToken, isExactAppoval, chainId } = useTwapContext();
  const { mutateAsync: getHasAllowance } = useHasAllowanceCallback();
  const approve = useApproveToken().mutateAsync;
  const wrapToken = useWrapToken().mutateAsync;
  const createOrder = useCreateOrder().mutateAsync;
  const { onRequest } = useSubmitOrderCallbacks();
  const srcAmount = useSrcAmount().amountWei;
  const approvalAmount = isExactAppoval ? srcAmount : maxUint256.toString();

  const wrappedRef = useRef(false);
  return useMutation(
    async () => {
      if (!srcToken) throw new Error("srcToken is not defined");
      if (!dstToken) throw new Error("dstToken is not defined");
      if (!chainId) throw new Error("chainId is not defined");
      const ensureAllowance = () => getHasAllowance({ token: ensureWrappedToken(srcToken, chainId), amount: srcAmount });
      const shouldWrap = isNativeAddress(srcToken.address);
      const haveAllowance = await ensureAllowance();
      updateState({ swapStatus: SwapStatus.LOADING, swapSteps: getSteps(shouldWrap, !haveAllowance) });

      if (shouldWrap) {
        updateState({ swapStep: SwapSteps.WRAP });
        await wrapToken(srcAmount);
      }

      if (!haveAllowance) {
        updateState({ swapStep: SwapSteps.APPROVE });
        await approve({ token: ensureWrappedToken(srcToken, chainId), amount: approvalAmount });
        // make sure the allowance was set
        if (!(await ensureAllowance())) {
          throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
        }
      }

      updateState({ swapStep: SwapSteps.CREATE });
      const order = await createOrder(ensureWrappedToken(srcToken, chainId));
      // we refetch balances only if we wrapped the token
      updateState({ swapStatus: SwapStatus.SUCCESS });
      return order;
    },
    {
      onMutate: onRequest,
      onError(error) {
        if (isTxRejected(error) && !wrappedRef.current) {
          updateState({ swapStep: undefined, swapStatus: undefined });
        } else {
          updateState({ swapStatus: SwapStatus.FAILED, swapError: (error as any).message });
        }
      },
    },
  );
};
