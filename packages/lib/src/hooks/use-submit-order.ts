import { SwapStatus } from "@orbs-network/swap-ui";
import { isNativeAddress, submitOrder } from "@orbs-network/twap-sdk";
import { SwapCallbacks, Steps } from "../types";
import { isTxRejected } from "../utils";
import { useApproveToken } from "./use-approve-token";
import { useWrapToken } from "./use-wrap";
import { useSrcAmount } from "./use-src-amount";
import { useEnsureAllowanceCallback } from "./use-allowance";
import BN from "bignumber.js";
import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { analytics, EIP712_TYPES, REPERMIT_PRIMARY_TYPE } from "@orbs-network/twap-sdk";
import { useBuildRePermitOrderDataCallback } from "./use-build-repermit-order-data-callback.ts";
import { useDstAmount } from "./use-dst-amount";
import { TransactionReceipt } from "viem";

const useSignOrder = () => {
  const { account, walletClient, chainId } = useTwapContext();
  const buildRePermitOrderData = useBuildRePermitOrderDataCallback();

  return useMutation(async () => {
    if (!account || !walletClient || !chainId) {
      throw new Error("missing required parameters");
    }

    const { orderData, domain } = buildRePermitOrderData();

    console.log({
      domain,
      types: EIP712_TYPES,
      primaryType: REPERMIT_PRIMARY_TYPE,
      message: orderData as Record<string, any>,
      account: account as `0x${string}`,
    });

    console.log(`Using domain:`, domain);
    console.log(`Using types:`, EIP712_TYPES);
    console.log(`Order data to sign:`, JSON.stringify(orderData, null, 2));
    console.log(`Account address: ${account}`);

    const signature = await walletClient?.signTypedData({
      domain,
      types: EIP712_TYPES,
      primaryType: REPERMIT_PRIMARY_TYPE,
      message: orderData as Record<string, any>,
      account: account as `0x${string}`,
    });

    return {
      signature,
      orderData,
    };
  });
};

const useCreateOrder = () => {
  const { account, walletClient, chainId, dstToken, srcToken } = useTwapContext();
  const signOrder = useSignOrder();
  const srcAmount = useSrcAmount().amountUI;
  const dstAmount = useDstAmount().amountUI;

  return useMutation(async (callbacks?: SwapCallbacks) => {
    try {
      if (!account || !walletClient || !chainId || !dstToken) {
        throw new Error("missing required parameters");
      }
      callbacks?.createOrder?.onRequest?.({
        srcToken: srcToken!,
        dstToken: dstToken!,
        srcAmount: srcAmount!,
        dstAmount: dstAmount!,
      });
      const { signature, orderData } = await signOrder.mutateAsync();

      await submitOrder(orderData, signature || "");
      // analytics.onCreateOrderSuccess(receipt.transactionHash, orderId);

      callbacks?.createOrder?.onSuccess?.({
        srcToken: srcToken!,
        dstToken: dstToken!,
        srcAmount: srcAmount!,
        dstAmount: dstAmount!,
        receipt: {} as TransactionReceipt,
      });

      return {
        orderId: 0,
        receipt: undefined,
      };
    } catch (error) {
      console.error(error);
      callbacks?.createOrder?.onFailed?.((error as any).message);
      analytics.onCreateOrderError(error);
      throw error;
    }
  });
};

export const useSubmitOrder = () => {
  const { srcToken, dstToken, chainId } = useTwapContext();
  const { ensure: ensureAllowance } = useEnsureAllowanceCallback();
  const updateState = useTwapStore((s) => s.updateState);
  const updateSwap = useTwapStore((s) => s.updateSwap);
  const approveCallback = useApproveToken().mutateAsync;
  const wrapCallback = useWrapToken().mutateAsync;
  const createOrderCallback = useCreateOrder().mutateAsync;
  const srcAmount = useSrcAmount().amountWei;

  return useMutation(async (callbacks?: SwapCallbacks) => {
    const wrapRequired = isNativeAddress(srcToken?.address || " ");
    let wrapSuccess = false;
    try {
      if (!srcToken || !dstToken || !chainId) {
        throw new Error("missing required parameters");
      }
      // analytics.onCreateOrderRequest(params, account)

      updateState({ fetchingAllowance: true });
      const allowance = await ensureAllowance();

      const approvalRequired = BN(srcAmount || "0").gt(allowance || "0");

      let stepIndex = 0;
      let totalSteps = 1;
      if (wrapRequired) totalSteps++;
      if (approvalRequired) totalSteps++;
      updateState({ fetchingAllowance: false });
      updateSwap({ status: SwapStatus.LOADING, totalSteps, stepIndex });

      if (wrapRequired) {
        updateSwap({ step: Steps.WRAP });
        await wrapCallback({ amount: srcAmount, callbacks, onHash: (hash) => updateSwap({ wrapTxHash: hash }) });
        stepIndex++;
        updateSwap({ stepIndex });
        wrapSuccess = true;
      }

      if (approvalRequired) {
        updateSwap({ step: Steps.APPROVE });
        await approveCallback({ token: srcToken, amount: srcAmount, callbacks, onHash: (hash) => updateSwap({ approveTxHash: hash }) });
        stepIndex++;
        updateSwap({ stepIndex });
      }
      updateSwap({ step: Steps.CREATE });
      const order = await createOrderCallback(callbacks);

      updateSwap({ status: SwapStatus.SUCCESS });
      return order;
    } catch (error) {
      if (wrapSuccess) {
        updateSwap({ step: Steps.UNWRAP, status: SwapStatus.FAILED, stepIndex: undefined });
      } else if (isTxRejected(error)) {
        updateSwap({ step: undefined, status: undefined, stepIndex: undefined });
      } else {
        updateSwap({ status: SwapStatus.FAILED, error: (error as any).message });
      }
    }
  });
};
