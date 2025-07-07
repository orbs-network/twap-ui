import { createPublicClient, createWalletClient, custom, defineChain, erc20Abi, http } from "viem";
import { Provider, PublicClient, WalletClient } from "./types";
import * as chains from "viem/chains";
import { Order, TwapAbi } from "@orbs-network/twap-sdk";

export const REFETCH_ORDER_HISTORY = 40_000;
const katana: chains.Chain = defineChain({
  id: 747474,
  name: "Katana",
  network: "katana",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.katana.network"],
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 7654707,
    },
  },
});

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
  const chain = [katana, ...Object.values(chains)].find((it: any) => it.id === chainId);
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
