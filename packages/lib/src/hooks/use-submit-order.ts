import { SwapStatus } from "@orbs-network/swap-ui";
import { isNativeAddress, submitOrder } from "@orbs-network/twap-sdk";
import { Steps } from "../types";
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

    const { orderData, domain } = buildRePermitOrderData();

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
  const { account, walletClient, chainId, dstToken } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const signOrder = useSignOrder();

  return useMutation(async () => {
    try {
      if (!account || !walletClient || !chainId || !dstToken) {
        throw new Error("missing required parameters");
      }

      const { signature, orderData } = await signOrder.mutateAsync();
      console.log({ signature, orderData });

      const response = await submitOrder(orderData, signature || "");
      // analytics.onCreateOrderSuccess(receipt.transactionHash, orderId);

      updateState({ createOrderTxHash: "" });

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

export const useSubmitOrder = () => {
  const { srcToken, dstToken, chainId } = useTwapContext();
  const { ensure: ensureAllowance } = useEnsureAllowanceCallback();
  const updateState = useTwapStore((s) => s.updateState);
  const approveCallback = useApproveToken().mutateAsync;
  const wrapCallback = useWrapToken().mutateAsync;
  const createOrderCallback = useCreateOrder().mutateAsync;
  const srcAmount = useSrcAmount().amountWei;

  return useMutation(async () => {
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

      updateState({ swapStatus: SwapStatus.LOADING, totalSteps, fetchingAllowance: false });

      if (wrapRequired) {
        updateState({ activeStep: Steps.WRAP });
        await wrapCallback(srcAmount);
        stepIndex++;
        updateState({ currentStepIndex: stepIndex });
        wrapSuccess = true;
      }

      if (approvalRequired) {
        updateState({ activeStep: Steps.APPROVE });
        await approveCallback({ token: srcToken, amount: srcAmount });
        stepIndex++;
        updateState({ currentStepIndex: stepIndex });
      }
      updateState({ activeStep: Steps.CREATE });
      const order = await createOrderCallback();

      updateState({ swapStatus: SwapStatus.SUCCESS });
      return order;
    } catch (error) {
      if (wrapSuccess) {
        updateState({ activeStep: Steps.UNWRAP, swapStatus: SwapStatus.FAILED, currentStepIndex: undefined });
      } else if (isTxRejected(error)) {
        updateState({ activeStep: undefined, swapStatus: undefined, currentStepIndex: undefined });
      } else {
        updateState({ swapStatus: SwapStatus.FAILED, swapError: (error as any).message });
      }
    }
  });
};
