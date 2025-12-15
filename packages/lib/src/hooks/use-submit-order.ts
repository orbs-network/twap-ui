import { SwapStatus } from "@orbs-network/swap-ui";
import BN from "bignumber.js";
import { analytics, isNativeAddress, IWETH_ABI, submitOrder } from "@orbs-network/twap-sdk";
import { ParsedError, Steps, Token } from "../types";
import { ensureWrappedToken, getExplorerUrl, isTxRejected } from "../utils";
import { useSrcAmount } from "./use-src-amount";
import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context/twap-context";
import { useTwapStore } from "../useTwapStore";
import { useBuildRePermitOrderDataCallback } from "./use-build-repermit-order-data-callback.ts";
import { erc20Abi, maxUint256, numberToHex, parseSignature } from "viem";
import { useOptimisticAddOrder, useOrdersQuery } from "./order-hooks";
import { useNetwork } from "./helper-hooks";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";
import { useTriggerPrice } from "./use-trigger-price";
import { useTrades } from "./use-trades";
import { useDeadline } from "./use-deadline";
import { useFillDelay } from "./use-fill-delay";
import { useDstMinAmountPerTrade } from "./use-dst-amount";

const useWrapToken = () => {
  const { account, walletClient, overrides } = useTwapContext();
  const wToken = useNetwork()?.wToken;
  const getTransactionReceipt = useGetTransactionReceipt();
  const srcAmount = useSrcAmount().amountWei;

  return useMutation(
    async ({ onHash }: { onHash?: (hash: string) => void }) => {
      if (!account || !walletClient || !srcAmount) {
        throw new Error("missing required parameters");
      }
      if (!wToken) {
        throw new Error("tokenAddress is not defined");
      }

      let hash: `0x${string}` | undefined;
      analytics.onWrapRequest();
      if (overrides?.wrap) {
        hash = await overrides.wrap(BigInt(srcAmount));
      } else {
        hash = await walletClient.writeContract({
          abi: IWETH_ABI,
          functionName: "deposit",
          account,
          address: wToken.address as `0x${string}`,
          value: BigInt(srcAmount),
          chain: walletClient.chain,
        });
      }
      onHash?.(hash);
      const receipt = await getTransactionReceipt(hash);
      if (!receipt) {
        throw new Error("failed to get transaction receipt");
      }

      if (receipt.status === "reverted") {
        throw new Error("failed to wrap token");
      }
      analytics.onWrapSuccess(hash);
      return receipt;
    },
    {
      onError: (error) => {
        analytics.onWrapError(error);
      },
    },
  );
};

const useSignAndSend = () => {
  const { account, walletClient, chainId, srcToken, dstToken, module, callbacks } = useTwapContext();
  const rePermitOrderData = useBuildRePermitOrderDataCallback();

  return useMutation(async () => {
    if (!account || !walletClient || !chainId || !srcToken || !dstToken || !module) {
      throw new Error("missing required parameters");
    }

    if (!rePermitOrderData) {
      throw new Error("rePermitOrderData is not defined");
    }

    const { order, domain, types, primaryType } = rePermitOrderData;

    analytics.onSignOrderRequest(order);
    callbacks?.onSignOrderRequest?.();
    console.log({
      domain,
      types,
      primaryType,
      message: order,
      account: account as `0x${string}`,
    });

    console.log(`Using domain:`, domain);
    console.log(`Using types:`, types);
    console.log(`Order data to sign:`, JSON.stringify(order, null, 2));
    console.log(`Account address: ${account}`);
    let signatureStr: `0x${string}`;
    try {
      signatureStr = await walletClient?.signTypedData({
        domain: domain as Record<string, any>,
        types,
        primaryType,
        message: order as Record<string, any>,
        account: account as `0x${string}`,
      });
    } catch (error) {
      callbacks?.onSignOrderError?.((error as Error).message);
      analytics.onSignOrderError(error);
      throw error;
    }

    analytics.onSignOrderSuccess(signatureStr);
    callbacks?.onSignOrderSuccess?.(signatureStr);
    const parsedSignature = parseSignature(signatureStr);
    const signature = {
      v: numberToHex(parsedSignature.v || 0),
      r: parsedSignature.r,
      s: parsedSignature.s,
    };

    return submitOrder(order, signature);
  });
};

const useEnsureUserApprovedToken = () => {
  const { mutateAsync: hasAllowanceCallback } = useHasAllowanceCallback();

  return useMutation(async ({ token, srcAmount }: { token: Token; srcAmount: string }) => {
    let userApprovedSuccessfully = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { approvalRequired } = await hasAllowanceCallback({ tokenAddress: token.address, srcAmount });

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

const useHasAllowanceCallback = () => {
  const { account, publicClient, chainId, config } = useTwapContext();

  return useMutation({
    mutationFn: async ({ tokenAddress, srcAmount }: { tokenAddress: string; srcAmount: string }) => {
      if (!publicClient || !chainId || !account || !config) throw new Error("missing required parameters");
      const allowance = await publicClient
        .readContract({
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "allowance",
          args: [account as `0x${string}`, config.repermit],
        })
        .then((res) => res.toString());
      const approvalRequired = BN(allowance || "0").lt(BN(srcAmount).toString());

      return { allowance, approvalRequired };
    },
  });
};

const useApproveToken = () => {
  const { account, walletClient, publicClient, overrides, chainId, config } = useTwapContext();
  const getTransactionReceipt = useGetTransactionReceipt();

  return useMutation(
    async ({ token, onHash }: { token: Token; onHash: (hash: string) => void }) => {
      if (!account || !walletClient || !publicClient || !chainId || !config) {
        throw new Error("missing required parameters");
      }
      analytics.onApproveRequest();
      let hash: `0x${string}` | undefined;
      if (overrides?.approveOrder) {
        hash = await overrides.approveOrder({ tokenAddress: token.address, spenderAddress: config.repermit, amount: maxUint256 });
      } else {
        hash = await walletClient.writeContract({
          abi: erc20Abi,
          functionName: "approve",
          account: account as `0x${string}`,
          address: token.address as `0x${string}`,
          args: [config.repermit, maxUint256],
          chain: walletClient.chain,
        });
      }
      onHash(hash);
      const receipt = await getTransactionReceipt(hash);

      if (!receipt) {
        throw new Error("failed to get transaction receipt");
      }

      if (receipt.status === "reverted") {
        throw new Error("failed to approve token");
      }

      console.log("approve token success", receipt);
      analytics.onApproveSuccess(hash);
      return receipt;
    },
    {
      onError: (error) => {
        analytics.onApproveError(error);
      },
    },
  );
};

const useInitOrderRequest = () => {
  const { account, chainId, srcToken, dstToken, module, slippage } = useTwapContext();
  const triggerPrice = useTriggerPrice();
  const srcAmount = useSrcAmount().amountWei;
  const srcChunkAmount = useTrades().amountPerTradeWei;
  const deadlineMillis = useDeadline();
  const fillDelay = useFillDelay().fillDelay;
  const dstMinAmountPerTrade = useDstMinAmountPerTrade().amountWei;
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);

  return useMutation(async () => {
    analytics.onRequestOrder({
      account: account as `0x${string}`,
      chainId: chainId as number,
      module,
      srcToken: srcToken as Token,
      dstToken: dstToken as Token,
      fromTokenAmount: srcAmount as string,
      srcChunkAmount: srcChunkAmount as string,
      triggerPricePerTrade: triggerPrice.pricePerChunkWei as string,
      deadline: deadlineMillis as number,
      fillDelay: fillDelay.unit * fillDelay.value,
      minDstAmountOutPerTrade: dstMinAmountPerTrade as string,
      slippage,
      isMarketOrder: isMarketOrder || false,
    });
  });
};

function parseError(input: string): ParsedError {
  const codeMatch = input.match(/,\s*code\s*:\s*(\d+)/i);

  const error = input
    .replace(/^error\s*:/i, "")
    .replace(/,\s*code\s*:\s*\d+/i, "")
    .trim();

  return {
    message: error || "",
    code: codeMatch ? Number(codeMatch[1]) : 0,
  };
}

export const useSubmitOrderMutation = () => {
  const { srcToken, dstToken, chainId, callbacks, refetchBalances } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const approveCallback = useApproveToken().mutateAsync;
  const wrapCallback = useWrapToken().mutateAsync;
  const createOrderCallback = useSignAndSend().mutateAsync;
  const { mutateAsync: ensureUserApprovedToken } = useEnsureUserApprovedToken();
  const { mutateAsync: hasAllowanceCallback } = useHasAllowanceCallback();
  const updateSwapExecution = useTwapStore((s) => s.updateSwapExecution);
  const { amountUI: srcAmountUI = "", amountWei: srcAmountWei } = useSrcAmount();
  const addOrder = useOptimisticAddOrder();
  const { refetch: refetchOrders } = useOrdersQuery();
  const initOrderRequest = useInitOrderRequest().mutate;

  return useMutation(async () => {
    const wrapRequired = isNativeAddress(srcToken?.address || " ");
    let isWrapSuccess = false;

    try {
      if (!srcToken || !dstToken || !chainId) {
        throw new Error("missing required parameters");
      }
      const srcWrappedToken = ensureWrappedToken(srcToken, chainId);
      updateState({ fetchingAllowance: true });
      const { approvalRequired } = await hasAllowanceCallback({ tokenAddress: srcWrappedToken.address, srcAmount: srcAmountWei });
      let stepIndex = 0;
      let totalSteps = 1;
      if (wrapRequired) totalSteps++;
      if (approvalRequired) totalSteps++;
      updateState({ fetchingAllowance: false });
      updateSwapExecution({ status: SwapStatus.LOADING, totalSteps, stepIndex });
      initOrderRequest();

      if (wrapRequired) {
        updateSwapExecution({ step: Steps.WRAP });
        callbacks?.onWrapRequest?.();
        const wrapReceipt = await wrapCallback({ onHash: (hash) => updateSwapExecution({ wrapTxHash: hash }) });
        stepIndex++;
        updateSwapExecution({ stepIndex });
        callbacks?.onWrapSuccess?.({ txHash: wrapReceipt.transactionHash, explorerUrl: getExplorerUrl(wrapReceipt.transactionHash, chainId), amount: srcAmountUI });
        isWrapSuccess = true;
      }

      if (approvalRequired) {
        callbacks?.onApproveRequest?.();
        updateSwapExecution({ step: Steps.APPROVE });

        const approveReceipt = await approveCallback({ token: srcWrappedToken, onHash: (hash) => updateSwapExecution({ approveTxHash: hash }) });
        await ensureUserApprovedToken({ token: srcWrappedToken, srcAmount: srcAmountWei });
        callbacks?.onApproveSuccess?.({
          txHash: approveReceipt.transactionHash,
          explorerUrl: getExplorerUrl(approveReceipt.transactionHash, chainId),
          token: srcWrappedToken,
          amount: srcAmountUI,
        });
        stepIndex++;
        updateSwapExecution({ stepIndex });
      }
      updateSwapExecution({ step: Steps.CREATE });
      const order = await createOrderCallback();

      if (order) {
        callbacks?.onOrderCreated?.(order);

        addOrder(order);
      } else {
        await refetchOrders();
      }
      updateSwapExecution({ status: SwapStatus.SUCCESS });
      updateState({ newOrderId: order?.id });
      return order;
    } catch (error) {
      if (isTxRejected(error)) {
        callbacks?.onSubmitOrderRejected?.();
        updateSwapExecution({ step: undefined, status: undefined, stepIndex: undefined });
      } else {
        const errorMsg = parseError((error as Error).message);
        callbacks?.onSubmitOrderFailed?.({ message: errorMsg.message || "", code: errorMsg.code || 0 });
        updateSwapExecution({ status: SwapStatus.FAILED, error: { message: errorMsg.message || "", code: errorMsg.code || 0 } });
      }
    } finally {
      if (isWrapSuccess) {
        refetchBalances?.();
      }
    }
  });
};
