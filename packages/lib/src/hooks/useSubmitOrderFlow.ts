import { useMutation } from "@tanstack/react-query";
import { useWidgetContext } from "..";
import { SwapSteps } from "../types";
import { isTxRejected } from "../utils";
import { useApproveToken } from "./useApproveToken";
import { useCreateOrder } from "./useCreateOrder";
import { useOrderHistoryManager } from "./useOrderHistoryManager";
import { useWrapToken } from "./useWrapToken";
import { SwapStatus } from "@orbs-network/swap-ui";
import { useShouldWrap } from "./useShouldWrapOrUnwrap";
import { useHasAllowance } from "./useAllowance";
import { useNetwork } from "./useNetwork";
import { useRef } from "react";

const getSteps = (shouldWrap?: boolean, shouldApprove?: boolean) => {
  const steps: number[] = [];

  if (shouldWrap) {
    steps.push(SwapSteps.WRAP);
  }
  if (shouldApprove) {
    steps.push(SwapSteps.APPROVE);
  }

  steps.push(SwapSteps.CREATE);
  return steps;
};

export const useSubmitOrderFlow = () => {
  const { state, updateState, srcToken, dstToken, actions, callbacks, twap } = useWidgetContext();
  const { swapStatus, swapStep, createOrderTxHash, approveTxHash, wrapTxHash } = state;
  const { data: haveAllowance, refetch: refetchAllowance } = useHasAllowance();
  const shouldWrap = useShouldWrap();
  const { addNewOrder } = useOrderHistoryManager();
  const wToken = useNetwork()?.wToken;
  const approve = useApproveToken().mutateAsync;
  const wrapToken = useWrapToken().mutateAsync;
  const createOrder = useCreateOrder().mutateAsync;
  const wrappedRef = useRef(false);
  const mutate = useMutation(
    async () => {
      wrappedRef.current = false;
      if (!srcToken || !dstToken) {
        throw new Error("Please select a token to swap");
      }

      if (!wToken) {
        throw new Error("WToken not defined");
      }

      const steps = getSteps(shouldWrap, !haveAllowance);
      updateState({ swapStatus: SwapStatus.LOADING, swapSteps: steps });

      if (shouldWrap) {
        updateState({ swapStep: SwapSteps.WRAP });
        await wrapToken();
        updateState({ isWrapped: true });
        wrappedRef.current = true;
      }

      if (!haveAllowance) {
        updateState({ swapStep: SwapSteps.APPROVE });
        await approve();
        const res = await refetchAllowance();
        if (!res) {
          throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
        }
      }

      updateState({ swapStep: SwapSteps.CREATE });
      const order = await createOrder();
      updateState({ swapStatus: SwapStatus.SUCCESS });

      // we refetch balances only if we wrapped the token
      if (wrappedRef.current) {
        await actions.refetchBalances?.();
      }
      await addNewOrder({ Contract_id: order.orderId, transactionHash: order.txHash! });
      return order;
    },
    {
      onMutate() {
        callbacks?.onSubmitOrderRequest?.({ srcToken: srcToken!, dstToken: dstToken!, srcAmount: twap.values.srcAmountUI, dstAmount: twap.values.destTokenAmountUI });
      },

      onError(error) {
        if (isTxRejected(error) && !wrappedRef.current) {
          updateState({ swapStep: undefined, swapStatus: undefined });
        } else {
          updateState({ swapStatus: SwapStatus.FAILED, swapError: (error as any).message });
        }
      },

      onSettled() {
        refetchAllowance();
      },
    },
  );

  const error = !mutate.error ? undefined : (mutate.error as any).message || "Failed to create order";

  return {
    ...mutate,
    error,
    swapStep,
    approveTxHash,
    wrapTxHash,
    createOrderTxHash,
    swapStatus,
  };
};
