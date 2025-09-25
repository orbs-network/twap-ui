import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context";
import { useGetTransactionReceipt } from "./use-get-transaction-receipt";
import { Token } from "../types";
import { erc20Abi, maxUint256 } from "viem";
import BN from "bignumber.js";

export const useHasAllowanceCallback = () => {
  const { account, publicClient, chainId, spotConfig } = useTwapContext();

  return useMutation({
    mutationFn: async (tokenAddress: string) => {
      if (!publicClient || !chainId || !account || !spotConfig) throw new Error("missing required parameters");
      const allowance = await publicClient
        .readContract({
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "allowance",
          args: [account as `0x${string}`, spotConfig.repermit],
        })
        .then((res) => res.toString());

        return { allowance, approvalRequired: !BN(allowance || "0").gte(maxUint256.toString()) };
    },
  });
};

export const useApproveToken = () => {
  const { account, walletClient, publicClient, overrides, chainId, spotConfig } = useTwapContext();
  const getTransactionReceipt = useGetTransactionReceipt();

  return useMutation(async ({ token, onHash }: { token: Token; onHash: (hash: string) => void }) => {
    if (!account || !walletClient || !publicClient || !chainId || !spotConfig) {
      throw new Error("missing required parameters");
    }



    let hash: `0x${string}` | undefined;
    if (overrides?.approveOrder) {
      hash = await overrides.approveOrder({ tokenAddress: token.address, spenderAddress: spotConfig.repermit, amount: maxUint256 });
    } else {
      hash = await walletClient.writeContract({
        abi: erc20Abi,
        functionName: "approve",
        account: account as `0x${string}`,
        address: token.address as `0x${string}`,
        args: [spotConfig.repermit, maxUint256],
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
