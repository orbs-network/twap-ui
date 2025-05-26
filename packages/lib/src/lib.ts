import { createPublicClient, createWalletClient, custom, erc20Abi, http } from "viem";
import { Provider, PublicClient, WalletClient } from "./types";
import * as chains from "viem/chains";
import { Order, TwapAbi } from "@orbs-network/twap-sdk";

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

export const initiateWallet = (chainId?: number, provider?: Provider) => {
  const chain = Object.values(chains).find((it: any) => it.id === chainId);
  const transport = provider ? custom(provider) : undefined;
  const walletClient = transport ? (createWalletClient({ chain, transport }) as any) : undefined;
  const publicClient = createPublicClient({ chain, transport: transport || http() }) as any;

  return {
    walletClient: walletClient as WalletClient | undefined,
    publicClient: publicClient as PublicClient,
  };
};

export const getPublicFallbackClient = (chainId: number) => {
  const chain = Object.values(chains).find((it: any) => it.id === chainId);
  return createPublicClient({ chain, transport: http(`https://rpcman.orbs.network/rpc?chainId=${chainId}&appId=twap-ui`) }) as ReturnType<typeof createPublicClient>;
};

export const getOrderStatuses = async (publicClient: PublicClient, orders: Order[]) => {
  const multicallResponse = await publicClient.multicall({
    contracts: orders.map((order) => {
      return {
        abi: TwapAbi as any,
        address: order.twapAddress as `0x${string}`,
        functionName: "status",
        args: [order.id],
      };
    }),
  });

  return multicallResponse
    .map((it) => {
      return it.result as number;
    })
    .filter((it) => it !== undefined);
};
