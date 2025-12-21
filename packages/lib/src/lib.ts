import { Chain, createPublicClient, createWalletClient, custom, http } from "viem";
import { Provider, PublicClient, WalletClient } from "./types";
import { chains } from "./chains";

export const REFETCH_ORDER_HISTORY = 40_000;

export const initiateWallet = (chainId?: number, provider?: Provider) => {
  const chain = Object.values(chains).find((it: Chain) => it.id === chainId);

  if (!chain) {
    return {
      walletClient: undefined,
      publicClient: undefined,
    };
  }
  const transport = provider ? custom(provider) : undefined;
  const walletClient = transport ? (createWalletClient({ chain, transport }) as any) : undefined;
  const publicClient = createPublicClient({ chain, transport: transport || http() }) as any;

  return {
    walletClient: walletClient as WalletClient | undefined,
    publicClient: publicClient as PublicClient | undefined,
  };
};
