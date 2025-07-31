import { useMemo } from "react";
import { createWalletClient, createPublicClient, custom, http } from "viem";
import * as chains from "viem/chains";
import { Provider } from "../types";

export const useInitiateWallet = (
  chainId?: number,
  provider?: Provider,
): {
  walletClient?: ReturnType<typeof createWalletClient>;
  publicClient?: ReturnType<typeof createPublicClient>;
} => {
  const chain = useMemo(() => Object.values(chains).find((it: any) => it.id === chainId), [chainId]);
  const transport = useMemo(() => (provider ? custom(provider) : undefined), [provider]);
  const walletClient = useMemo(() => {
    return transport ? (createWalletClient({ chain, transport }) as any) : undefined;
  }, [transport]);

  const publicClient = useMemo(() => {
    if (!chain) return;
    return createPublicClient({ chain, transport: transport || http() }) as any;
  }, [transport, chain]);

  return {
    walletClient,
    publicClient,
  };
};
