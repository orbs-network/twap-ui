import { SwapStatus } from "@orbs-network/swap-ui";
import BN from "bignumber.js";
import { analytics, isNativeAddress, IWETH_ABI, submitOrder } from "@orbs-network/twap-sdk";
import { SwapCallbacks, Steps, Token } from "../types";
import { ensureWrappedToken, isTxRejected } from "../utils";
import { useSrcAmount } from "./use-src-amount";
import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context/twap-context";
import { useTwapStore } from "../useTwapStore";
import { EIP712_TYPES, REPERMIT_PRIMARY_TYPE } from "@orbs-network/twap-sdk";
import { useBuildRePermitOrderDataCallback } from "./use-build-repermit-order-data-callback.ts";
import { erc20Abi, maxUint256, numberToHex, parseSignature } from "viem";
import { useOptimisticAddOrder, useOrdersQuery } from "./order-hooks";
import { useNetwork } from "./helper-hooks";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";

const useWrapToken = () => {
  const { account, walletClient, overrides, callbacks } = useTwapContext();
  const wToken = useNetwork()?.wToken;
  const getTransactionReceipt = useGetTransactionReceipt();
  const srcAmount = useSrcAmount().amountWei;

  return useMutation(async ({ onHash }: { onHash?: (hash: string) => void }) => {
    if (!account || !walletClient || !srcAmount) {
      throw new Error("missing required parameters");
    }
    if (!wToken) {
      throw new Error("tokenAddress is not defined");
    }

    let hash: `0x${string}` | undefined;
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
    callbacks?.refetchBalances?.();
    analytics.onWrapSuccess(hash);
    return receipt;
  });
};

const useSignAndSend = () => {
  const { account, walletClient, chainId } = useTwapContext();
  const rePermitOrderData = useBuildRePermitOrderDataCallback();

  return useMutation(async () => {
    if (!account || !walletClient || !chainId) {
      throw new Error("missing required parameters");
    }

    if (!rePermitOrderData) {
      throw new Error("rePermitOrderData is not defined");
    }

    const { order, domain } = rePermitOrderData;

    console.log({
      domain,
      types: EIP712_TYPES,
      primaryType: REPERMIT_PRIMARY_TYPE,
      message: order as Record<string, any>,
      account: account as `0x${string}`,
    });

    console.log(`Using domain:`, domain);
    console.log(`Using types:`, EIP712_TYPES);
    console.log(`Order data to sign:`, JSON.stringify(order, null, 2));
    console.log(`Account address: ${account}`);

    const signatureStr = await walletClient?.signTypedData({
      domain: domain as Record<string, any>,
      types: EIP712_TYPES,
      primaryType: REPERMIT_PRIMARY_TYPE,
      message: order as Record<string, any>,
      account: account as `0x${string}`,
    });

    const parsedSignature = parseSignature(signatureStr);
    const signature = {
      v: numberToHex(parsedSignature.v || 0),
      r: parsedSignature.r,
      s: parsedSignature.s,
    };

    // TODO: send sig as string

    return submitOrder(order, signature);
  });
};

const useEnsureUserApprovedToken = () => {
  const { mutateAsync: hasAllowanceCallback } = useHasAllowanceCallback();

  return useMutation(async (token: Token) => {
    let userApprovedSuccessfully = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { approvalRequired } = await hasAllowanceCallback(token.address);

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
    mutationFn: async (tokenAddress: string) => {
      if (!publicClient || !chainId || !account || !config) throw new Error("missing required parameters");
      const allowance = await publicClient
        .readContract({
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "allowance",
          args: [account as `0x${string}`, config.repermit],
        })
        .then((res) => res.toString());

      return { allowance, approvalRequired: !BN(allowance || "0").gte(maxUint256.toString()) };
    },
  });
};

const useApproveToken = () => {
  const { account, walletClient, publicClient, overrides, chainId, config } = useTwapContext();
  const getTransactionReceipt = useGetTransactionReceipt();

  return useMutation(async ({ token, onHash }: { token: Token; onHash: (hash: string) => void }) => {
    if (!account || !walletClient || !publicClient || !chainId || !config) {
      throw new Error("missing required parameters");
    }

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

    return receipt;
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
  const { amountUI: srcAmountUI = "" } = useSrcAmount();
  const addOrder = useOptimisticAddOrder();
  const { refetch: refetchOrders } = useOrdersQuery();

  return useMutation(async (callbacks?: SwapCallbacks) => {
    const wrapRequired = isNativeAddress(srcToken?.address || " ");
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
        const wrapReceipt = await wrapCallback({ onHash: (hash) => updateSwapExecution({ wrapTxHash: hash }) });
        stepIndex++;
        updateSwapExecution({ stepIndex });
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

      if (order) {
        addOrder(order);
      } else {
        await refetchOrders();
      }
      updateSwapExecution({ status: SwapStatus.SUCCESS });

      return order;
    } catch (error) {
      if (isTxRejected(error)) {
        updateSwapExecution({ step: undefined, status: undefined, stepIndex: undefined });
      } else {
        updateSwapExecution({ status: SwapStatus.FAILED, error: (error as any).message });
      }
    }
  });
};
