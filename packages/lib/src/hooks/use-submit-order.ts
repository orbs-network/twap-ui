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

const useSignOrder = () => {
  const { account, walletClient, chainId } = useTwapContext();
  const buildRePermitOrderData = useBuildRePermitOrderDataCallback();

  return useMutation(async () => {
    if (!account || !walletClient || !chainId) {
      throw new Error("missing required parameters");
    }

    const repermitOrderData = buildRePermitOrderData();

    if (!repermitOrderData) {
      throw new Error("repermitOrderData is not defined");
    }

    const { orderData, domain } = repermitOrderData;

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
      domain: domain as Record<string, any>,
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
  const { account, walletClient, chainId, dstToken } = useTwapContext();
  const signOrder = useSignOrder();

  return useMutation(async () => {
    try {
      if (!account || !walletClient || !chainId || !dstToken) {
        throw new Error("missing required parameters");
      }

      const { signature, orderData } = await signOrder.mutateAsync();

      await submitOrder(orderData, signature);

      return {
        orderId: 0,
        receipt: undefined,
      };
    } catch (error) {
      console.error(error);
      analytics.onCreateOrderError(error);
      throw error;
    }
  });
};

export const useSubmitOrderMutation = () => {
  const { srcToken, dstToken, chainId } = useTwapContext();
  const { ensure: ensureAllowance } = useEnsureAllowanceCallback();
  const updateState = useTwapStore((s) => s.updateState);
  const approveCallback = useApproveToken().mutateAsync;
  const wrapCallback = useWrapToken().mutateAsync;
  const createOrderCallback = useCreateOrder().mutateAsync;
  const updateSwapExecution = useTwapStore((s) => s.updateSwapExecution);
  const { amountWei: srcAmount, amountUI: srcAmountUI = "" } = useSrcAmount();

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
      updateSwapExecution({ status: SwapStatus.LOADING, totalSteps, stepIndex });

      if (wrapRequired) {
        updateSwapExecution({ step: Steps.WRAP });
        callbacks?.wrap?.onRequest?.(srcAmountUI);
        const wrapReceipt = await wrapCallback({ amount: srcAmount, onHash: (hash) => updateSwapExecution({ wrapTxHash: hash }) });
        stepIndex++;
        updateSwapExecution({ stepIndex });
        wrapSuccess = true;
        callbacks?.wrap?.onSuccess?.(wrapReceipt, srcAmountUI);
      }

      if (approvalRequired) {
        callbacks?.approve?.onRequest?.(srcToken, srcAmountUI);
        updateSwapExecution({ step: Steps.APPROVE });
        const approveReceipt = await approveCallback({ token: srcToken, onHash: (hash) => updateSwapExecution({ approveTxHash: hash }) });
        callbacks?.approve?.onSuccess?.(approveReceipt, srcToken, srcAmountUI);
        stepIndex++;
        updateSwapExecution({ stepIndex });
      }
      updateSwapExecution({ step: Steps.CREATE });
      const order = await createOrderCallback();

      updateSwapExecution({ status: SwapStatus.SUCCESS });
      return order;
    } catch (error) {
      if (wrapSuccess) {
        updateSwapExecution({ step: Steps.UNWRAP, status: SwapStatus.FAILED, stepIndex: undefined });
      } else if (isTxRejected(error)) {
        updateSwapExecution({ step: undefined, status: undefined, stepIndex: undefined });
      } else {
        updateSwapExecution({ status: SwapStatus.FAILED, error: (error as any).message });
      }
    }
  });
};
