import { sendAndWaitForConfirmations } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import { useGasPrice } from "./useGasPrice";
import BN from "bignumber.js";
import { useRefetchBalances } from "./useBalances";
import { useWidgetContext } from "../widget/widget-context";
import { useIWETHContract } from "./useContracts";

export const useUnwrapToken = () => {
  const { account, twap, resetState } = useWidgetContext();
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();
  const onSuccess = useRefetchBalances();
  const srcAmount = twap.values.srcAmount;
  const contract = useIWETHContract();

  return useMutation(async () => {
    if (!contract) {
      throw new Error("contract is not defined");
    }
    if (!account) {
      throw new Error("account is not defined");
    }
    await sendAndWaitForConfirmations(
      contract.methods.withdraw(BN(srcAmount).toFixed(0)),
      { from: account, maxPriorityFeePerGas: priorityFeePerGas, maxFeePerGas },
      undefined,
      undefined,
    );
    resetState();
    await onSuccess();
  });
};
