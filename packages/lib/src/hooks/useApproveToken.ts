import { maxUint256, hasWeb3Instance, setWeb3Instance, erc20, sendAndWaitForConfirmations } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";
import { Token, useWidgetContext } from "..";
import { logger } from "../utils";
import { useGasPrice } from "./useGasPrice";
import BN from "bignumber.js";

export const useApproveToken = () => {
  const { account, isExactAppoval, web3, config, twap, callbacks } = useWidgetContext();
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();
  const { srcAmount, srcAmountUI } = twap.values;
  const approvalAmount = isExactAppoval ? srcAmount : maxUint256;

  return useMutation(
    async (token: Token) => {
      if (!account) {
        throw new Error("account is not defined");
      }

      logger("approving token...");

      let txHash: string = "";
      if (!hasWeb3Instance()) {
        setWeb3Instance(web3);
      }
      const contract = erc20(token.symbol, token.address, token.decimals);

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
      callbacks?.onApproveSuccess?.({ token: token!, txHash, amount: isExactAppoval ? srcAmountUI : undefined });
    },
    {
      onError: (error) => {
        callbacks?.onApproveFailed?.((error as any).message);
      },
    },
  );
};
