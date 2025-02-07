import { maxUint256, hasWeb3Instance, setWeb3Instance, sendAndWaitForConfirmations } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import { useWidgetContext } from "..";
import { logger } from "../utils";
import { useGasPrice } from "./useGasPrice";
import BN from "bignumber.js";
import { useERC20Contract } from "./useContracts";

export const useApproveToken = () => {
  const { account, isExactAppoval, web3, config, twap, callbacks, srcToken } = useWidgetContext();
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();
  const { srcAmount, srcAmountUI } = twap.values;
  const approvalAmount = isExactAppoval ? srcAmount : maxUint256;
  const contract = useERC20Contract(srcToken?.address);

  return useMutation(
    async () => {
      if (!account) throw new Error("account is not defined");
      if (!contract) throw new Error("contract is not defined");
      if (!approvalAmount) throw new Error("approvalAmount is not defined");

      let txHash: string = "";
      if (!hasWeb3Instance()) {
        setWeb3Instance(web3);
      }

      await sendAndWaitForConfirmations(
        contract.methods.approve(config.twapAddress, BN(approvalAmount).decimalPlaces(0).toFixed(0)),
        {
          from: account,
          maxPriorityFeePerGas: priorityFeePerGas,
          maxFeePerGas,
        },
        undefined,
        undefined,
        {
          onTxHash: (value) => {
            txHash = value;
          },
        },
      );
      logger("token approve success:", txHash);
      twap.analytics.onApproveSuccess(txHash);
      callbacks?.onApproveSuccess?.({ token: srcToken!, txHash, amount: isExactAppoval ? srcAmountUI : undefined });
    },
    {
      onError: (error) => {
        callbacks?.onApproveFailed?.((error as any).message);
      },
    },
  );
};
