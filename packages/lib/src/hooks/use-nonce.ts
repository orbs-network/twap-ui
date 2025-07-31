import { useQuery } from "@tanstack/react-query";
import { useTwapContext } from "../context";

export const useNonce = () => {
  const { account, publicClient } = useTwapContext();
  return useQuery({
    queryKey: ["nonce", account],
    queryFn: () => publicClient!.getTransactionCount({ address: account as `0x${string}` }),
    enabled: !!account && !!publicClient,
  });
};
