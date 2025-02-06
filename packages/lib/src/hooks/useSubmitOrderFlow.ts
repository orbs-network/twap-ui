import { useMutation } from "@tanstack/react-query";
import { useWidgetContext } from "..";
import { SwapSteps, Token } from "../types";
import { logger, isTxRejected } from "../utils";
import { useApproveToken } from "./useApproveToken";
import { useCreateOrder } from "./useCreateOrder";
import { useOrderHistoryManager } from "./useOrderHistoryManager";
import { useWrapToken } from "./useWrapToken";
import { SwapStatus } from "@orbs-network/swap-ui";
import { useRefetchBalances } from "./useBalances";
import { useShouldWrap } from "./useShouldWraoOrUnwrap";
import { useHasAllowance } from "./useAllowance";
import { useNetwork } from "./useNetwork";

const getSteps = (shouldWrap?: boolean, shouldApprove?: boolean) => {
  let steps: number[] = [];

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
  const { state, twap, updateState, callbacks, srcToken, dstToken } = useWidgetContext();
  const { swapStatus, swapStep, createOrderTxHash, approveTxHash, wrapTxHash, wrapSuccess } = state;
  const { data: haveAllowance, refetch: refetchAllowance } = useHasAllowance();
  const shouldWrap = useShouldWrap();
  const { waitForNewOrder } = useOrderHistoryManager();
  const wToken = useNetwork()?.wToken;
  const refetchBalances = useRefetchBalances();
  const approve = useApproveToken().mutateAsync;
  const wrapToken = useWrapToken().mutateAsync;
  const createOrder = useCreateOrder().mutateAsync;

  const mutate = useMutation(
    async () => {
      if (!srcToken || !dstToken) {
        throw new Error("Please select a token to swap");
      }

      if (!wToken) {
        throw new Error("WToken not defined");
      }

      const steps = getSteps(shouldWrap, !haveAllowance);
      logger(`Create order request`);
      updateState({ swapStatus: SwapStatus.LOADING, swapSteps: steps });

      let token = srcToken;

      if (shouldWrap) {
        updateState({ swapStep: SwapSteps.WRAP });
        await wrapToken();
        updateState({ wrapSuccess: true });
        token = wToken as Token;
      }

      if (!haveAllowance) {
        updateState({ swapStep: SwapSteps.APPROVE });
        await approve(token);
        const res = await refetchAllowance();
        if (!res) {
          throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
        }
        updateState({ approveSuccess: true });
      }

      updateState({ swapStep: SwapSteps.CREATE });
      const order = await createOrder(token);

      updateState({
        swapStatus: SwapStatus.SUCCESS,
      });
      waitForNewOrder(order.orderId);

      await refetchBalances();
      return order;
    },
    {
      onSuccess(order) {
        callbacks?.onCreateOrderSuccess?.({
          srcToken: srcToken!,
          dstToken: dstToken!,
          orderId: order.orderId,
          srcAmount: state.srcAmount || "0",
          dstAmount: twap.values.destTokenAmountUI || "0",
          txHash: order.txHash,
        });
      },

      onError(error) {
        if (isTxRejected(error) && !wrapSuccess) {
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
