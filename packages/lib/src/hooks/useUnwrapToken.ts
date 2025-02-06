import { sendAndWaitForConfirmations, erc20, iwethabi } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";

import { useGasPrice } from "./useGasPrice";
import BN from "bignumber.js";
import { useRefetchBalances } from "./useBalances";
import { useNetwork } from "./useNetwork";
import { useWidgetContext } from "../widget/widget-context";

export const useUnwrapToken = () => {
  const { account, twap } = useWidgetContext();
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();
  const onSuccess = useRefetchBalances();
  const srcAmount = twap.values.srcAmount;
  const network = useNetwork();

  return useMutation(
    async () => {
      if (!network) {
        throw new Error("network is not defined");
      }
      if (!account) {
        throw new Error("account is not defined");
      }
      await sendAndWaitForConfirmations(
        erc20<any>(network.wToken.symbol, network.wToken.address, network.wToken.decimals, iwethabi).methods.withdraw(BN(srcAmount).toFixed(0)),
        { from: account, maxPriorityFeePerGas: priorityFeePerGas, maxFeePerGas },
        undefined,
        undefined,
      );
      await onSuccess();
    },
    {
      onError: (error) => {},
    },
  );
};
