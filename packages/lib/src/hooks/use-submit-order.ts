import { SwapStatus } from "@orbs-network/swap-ui";
import { isNativeAddress } from "@orbs-network/twap-sdk";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { maxUint256 } from "viem";
import { useTwapContext } from "../context";
import { Steps } from "../types";
import { useTwapStore } from "../useTwapStore";
import { ensureWrappedToken, isTxRejected } from "../utils";
import { useHasAllowanceCallback, useSrcAmount } from "./logic-hooks";
import { useApproveToken } from "./use-approve-token";
import { useCreateOrder } from "./use-create-order";
import { useWrapToken } from "./use-wrap";

const getTotalSteps = (shouldWrap?: boolean, shouldApprove?: boolean) => {
  let stepsCount = 1;
  if (shouldWrap) stepsCount++;
  if (shouldApprove) stepsCount++;
  return stepsCount;
};

export const useSubmitOrderCallback = () => {
  const { srcToken, dstToken, isExactAppoval, chainId } = useTwapContext();
  const { mutateAsync: getHasAllowance } = useHasAllowanceCallback();
  const updateState = useTwapStore((s) => s.updateState);
  const approve = useApproveToken().mutateAsync;
  const wrapToken = useWrapToken().mutateAsync;
  const createOrder = useCreateOrder().mutateAsync;
  const srcAmount = useSrcAmount().amountWei;
  const approvalAmount = isExactAppoval ? srcAmount : maxUint256.toString();

  const wrappedRef = useRef(false);
  return useMutation(async () => {
    try {
      if (!srcToken) throw new Error("srcToken is not defined");
      if (!dstToken) throw new Error("dstToken is not defined");
      if (!chainId) throw new Error("chainId is not defined");
      const ensureAllowance = () => getHasAllowance({ token: ensureWrappedToken(srcToken, chainId), amount: srcAmount });
      const shouldWrap = isNativeAddress(srcToken.address);

      updateState({ fetchingAllowance: true });
      const haveAllowance = await ensureAllowance();

      let stepIndex = 0;
      updateState({ swapStatus: SwapStatus.LOADING, totalSteps: getTotalSteps(shouldWrap, !haveAllowance), fetchingAllowance: false });

      if (shouldWrap) {
        updateState({ activeStep: Steps.WRAP });
        await wrapToken(srcAmount);
        stepIndex++;
        updateState({ currentStepIndex: stepIndex });
      }

      if (!haveAllowance) {
        updateState({ activeStep: Steps.APPROVE });
        await approve({ token: ensureWrappedToken(srcToken, chainId), amount: approvalAmount });
        // make sure the allowance was set
        if (!(await ensureAllowance())) {
          throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
        }
        stepIndex++;
        updateState({ currentStepIndex: stepIndex });
      }
      updateState({ activeStep: Steps.CREATE });
      const order = await createOrder(ensureWrappedToken(srcToken, chainId));

      updateState({ swapStatus: SwapStatus.SUCCESS });
      return order;
    } catch (error) {
      if (isTxRejected(error) && !wrappedRef.current) {
        updateState({ activeStep: undefined, swapStatus: undefined, currentStepIndex: undefined });
      } else {
        updateState({ swapStatus: SwapStatus.FAILED, swapError: (error as any).message });
      }
    }
  });
};
