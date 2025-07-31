import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context";
import { getAllowance } from "../lib";
import BN from "bignumber.js";
import { Token } from "../types";

export const useHasAllowanceCallback = () => {
  const { account, config, publicClient } = useTwapContext();

  return useMutation({
    mutationFn: async ({ token, amount }: { token: Token; amount: string }) => {
      if (!publicClient) throw new Error("publicClient is not defined");
      if (!account) throw new Error("account is not defined");
      const allowance = await getAllowance(token.address, account, config.twapAddress, publicClient);

      return BN(allowance).gte(amount);
    },
  });
};
