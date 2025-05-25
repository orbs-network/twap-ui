import { erc20Abi } from "viem";
import { PublicClient } from "./types";

export const getAllowance = async (token: string, account: string, twapAddress: string, publicClient: PublicClient) => {
  try {
    const result = await publicClient
      .readContract({
        address: token as `0x${string}`,
        abi: erc20Abi,
        functionName: "allowance",
        args: [account as `0x${string}`, twapAddress as `0x${string}`],
      })
      .then((res) => res.toString());
    return result;
  } catch (error) {
    return "0";
  }
};
