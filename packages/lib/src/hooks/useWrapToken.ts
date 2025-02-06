import { sendAndWaitForConfirmations, erc20, iwethabi } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import { useWidgetContext } from "..";
import { logger } from "../utils";
import { useRefetchBalances } from "./useBalances";
import { useGasPrice } from "./useGasPrice";
import { useNetwork } from "./useNetwork";

export const useWrapToken = () => {
  const { account, twap, srcToken, callbacks } = useWidgetContext();
  const { srcAmount, srcAmountUI } = twap.values;

  const network = useNetwork();
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();

  return useMutation(
    async () => {
      let txHash: string = "";
      if (!network) {
        throw new Error("network is not defined");
      }
      if (!account) {
        throw new Error("account is not defined");
      }

      await sendAndWaitForConfirmations(
        erc20<any>(network.wToken.symbol, network.wToken.address, network.wToken.decimals, iwethabi).methods.deposit(),
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

  const onSuccess = useRefetchBalances();

  return useMutation(async () => {
    await mutateAsync();
    await onSuccess();
  });
};
