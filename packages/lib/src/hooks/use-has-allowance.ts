import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context";
import { getAllowance } from "../lib";
import BN from "bignumber.js";
import { Token } from "../types";
import { REPERMIT_ADDRESS } from "@orbs-network/twap-sdk";

export const useHasAllowanceCallback = () => {
  const { account, publicClient } = useTwapContext();

  return useMutation({
    mutationFn: async ({ token, amount }: { token: Token; amount: string }) => {
      if (!publicClient) throw new Error("publicClient is not defined");
      if (!account) throw new Error("account is not defined");
      const allowance = await getAllowance(token.address, account, REPERMIT_ADDRESS, publicClient);

      return BN(allowance).gte(amount);
    },
  });
};
