import { sendAndWaitForConfirmations, erc20, iwethabi } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import { useWidgetContext } from "..";
import { logger } from "../utils";
import { useRefetchBalances } from "./useBalances";
import { useIWETHContract } from "./useContracts";
import { useGasPrice } from "./useGasPrice";

export const useWrapToken = () => {
  const { account, twap, srcToken, callbacks } = useWidgetContext();
  const { srcAmount, srcAmountUI } = twap.values;
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();

  const contract = useIWETHContract();

  return useMutation(
    async () => {
      let txHash: string = "";
      if (!srcAmount) throw new Error("srcAmount is not defined");
      if (!account) throw new Error("account is not defined");
      if (!contract) throw new Error("contract is not defined");

      await sendAndWaitForConfirmations(
        contract.methods.deposit(),
        {
          from: account,
          maxPriorityFeePerGas: priorityFeePerGas,
          maxFeePerGas,
          value: srcAmount,
        },
        undefined,
        undefined,
        {
          onTxHash: (hash) => {
            txHash = hash;
          },
        },
      );
      logger("token wrap success:", txHash);
      twap.analytics.onWrapSuccess(txHash);
      callbacks?.onWrapSuccess?.({ token: srcToken!, txHash: txHash!, amount: srcAmountUI });
    },
    {
      onError: (error) => {
        callbacks?.onWrapFailed?.((error as any).message);
      },
    },
  );
};

export const useWrapOnly = () => {
  const { mutateAsync } = useWrapToken();
  const { resetState } = useWidgetContext();

  const onSuccess = useRefetchBalances();

  return useMutation(async () => {
    await mutateAsync();
    resetState();
    await onSuccess();
  });
};
