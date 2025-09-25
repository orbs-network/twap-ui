import { SwapStatus } from "@orbs-network/swap-ui";
import { isNativeAddress, submitOrder } from "@orbs-network/twap-sdk";
import { SwapCallbacks, Steps, Token } from "../types";
import { ensureWrappedToken, isTxRejected } from "../utils";
import { useApproveToken, useHasAllowanceCallback } from "./use-approve-token";
import { useWrapToken } from "./use-wrap";
import { useSrcAmount } from "./use-src-amount";
import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { EIP712_TYPES, REPERMIT_PRIMARY_TYPE } from "@orbs-network/twap-sdk";
import { useBuildRePermitOrderDataCallback } from "./use-build-repermit-order-data-callback.ts";
import { numberToHex, parseSignature } from "viem";

const useSignAndSend = () => {
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

    const signatureStr = await walletClient?.signTypedData({
      domain: domain as Record<string, any>,
      types: EIP712_TYPES,
      primaryType: REPERMIT_PRIMARY_TYPE,
      message: orderData as Record<string, any>,
      account: account as `0x${string}`,
    });

    const parsedSignature = parseSignature(signatureStr);
    const signature = {
      v: numberToHex(parsedSignature.v || 0),
      r: parsedSignature.r,
      s: parsedSignature.s,
    };

    await submitOrder(orderData, signature);
    return {
      orderId: 0,
      receipt: undefined,
    };
  });
};

const useEnsureUserApprovedToken = () => {
  const { mutateAsync: hasAllowanceCallback } = useHasAllowanceCallback();

  return useMutation(async (token: Token) => {
    let userApprovedSuccessfully = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { approvalRequired, allowance } = await hasAllowanceCallback(token.address);
      console.log("approvalRequired", approvalRequired);
      console.log("allowance", allowance);
      console.log("token", token);

      if (!approvalRequired) {
        userApprovedSuccessfully = true;
        break;
      }
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 3000)); // 3s delay
      }
    }

    if (!userApprovedSuccessfully) {
      throw new Error(`Insufficient ${token.symbol} allowance to perform the swap. Please approve the token first.`);
    }
  });
};

export const useSubmitOrderMutation = () => {
  const { srcToken, dstToken, chainId } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const approveCallback = useApproveToken().mutateAsync;
  const wrapCallback = useWrapToken().mutateAsync;
  const createOrderCallback = useSignAndSend().mutateAsync;
  const { mutateAsync: ensureUserApprovedToken } = useEnsureUserApprovedToken();
  const { mutateAsync: hasAllowanceCallback } = useHasAllowanceCallback();
  const updateSwapExecution = useTwapStore((s) => s.updateSwapExecution);
  const { amountWei: srcAmount, amountUI: srcAmountUI = "" } = useSrcAmount();

  return useMutation(async (callbacks?: SwapCallbacks) => {
    const wrapRequired = isNativeAddress(srcToken?.address || " ");
    let wrapSuccess = false;
    try {
      if (!srcToken || !dstToken || !chainId) {
        throw new Error("missing required parameters");
      }
      const srcWrappedToken = ensureWrappedToken(srcToken, chainId);
      // analytics.onCreateOrderRequest(params, account)

      updateState({ fetchingAllowance: true });
      const { approvalRequired } = await hasAllowanceCallback(srcToken.address);

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
        callbacks?.approve?.onRequest?.(srcWrappedToken, srcAmountUI);
        updateSwapExecution({ step: Steps.APPROVE });

        const approveReceipt = await approveCallback({ token: srcWrappedToken, onHash: (hash) => updateSwapExecution({ approveTxHash: hash }) });
        await ensureUserApprovedToken(srcWrappedToken);
        callbacks?.approve?.onSuccess?.(approveReceipt, srcWrappedToken, srcAmountUI);
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
