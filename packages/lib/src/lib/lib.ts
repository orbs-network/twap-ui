import BN from "bignumber.js";
import { amountBN, TimeDuration, TwapSDK } from "@orbs-network/twap-sdk";
import { State, Token, Provider, PublicClient, WalletClient } from "../types";
import { createPublicClient, createWalletClient, custom, erc20Abi, http } from "viem";
import * as chains from "viem/chains";
import { Order, TwapAbi } from "@orbs-network/twap-sdk";

export enum InputErrors {
  EMPTY_LIMIT_PRICE,
  MIN_CHUNKS_ERROR,
  MAX_CHUNKS_ERROR,
  MIN_TRADE_SIZE_ERROR,
  MAX_FILL_DELAY_ERROR,
  MIN_FILL_DELAY_ERROR,
  MAX_DURATION_ERROR,
  EMPTY_AMOUNT_ERROR,
}
export const getLimitPrice = (state: State, dstToken?: Token, marketPrice = "") => {
  const { typedPrice, isMarketOrder, isInvertedPrice } = state;
  if (typedPrice === undefined || isMarketOrder || !marketPrice) {
    return marketPrice;
  }
  const result = isInvertedPrice ? BN(1).div(typedPrice).toFixed() : typedPrice;
  const amountWei = amountBN(dstToken?.decimals, result);

  return amountWei;
};

export const getMaxChunks = (sdk: TwapSDK, state: State, srcUsd1Token = "", minChunkSizeUsd: number) => {
  const typedSrcAmount = state.typedSrcAmount || "";

  return sdk.getMaxChunks(typedSrcAmount, srcUsd1Token, minChunkSizeUsd);
};

export const getChunks = (sdk: TwapSDK, state: State, maxChunks: number, isLimitPanel: boolean) => {
  const { typedChunks } = state;
  return sdk.getChunks(maxChunks, Boolean(isLimitPanel), typedChunks);
};

export const getSrcTokenChunkSize = (sdk: TwapSDK, state: State, chunks: number, srcToken?: Token) => {
  const { typedSrcAmount } = state;
  const srcAmountWei = amountBN(srcToken?.decimals, typedSrcAmount);
  return sdk.getSrcTokenChunkAmount(srcAmountWei || "", chunks);
};

export const getDestTokenAmount = (sdk: TwapSDK, state: State, limitPrice = "", srcToken?: Token) => {
  const { typedSrcAmount } = state;
  const srcAmountWei = amountBN(srcToken?.decimals, typedSrcAmount);
  const amountWei = sdk.getDestTokenAmount(srcAmountWei || "", limitPrice || "", srcToken?.decimals || 0);
  return amountWei;
};

export const getDestTokenMinAmount = (sdk: TwapSDK, state: State, limitPrice = "", srcTokenChunkSize = "", srcToken?: Token) => {
  const { isMarketOrder } = state;
  return sdk.getDestTokenMinAmount(srcTokenChunkSize, limitPrice || "", Boolean(isMarketOrder), srcToken?.decimals || 0);
};

export const getSrcChunkAmountUSD = (srcUsd1Token = "", srcChunksAmountUI = "") => {
  if (!srcUsd1Token) return "0";
  return BN(srcChunksAmountUI || "0")
    .times(srcUsd1Token || 0)
    .toString();
};

export const getOrderDeadline = (sdk: TwapSDK, state: State, orderDuration: TimeDuration) => {
  const { currentTime } = state;
  return sdk.getOrderDeadline(currentTime, orderDuration);
};

export const getFillDelay = (sdk: TwapSDK, state: State, chunks: number, isLimitPanel: boolean) => {
  const { typedFillDelay } = state;
  return sdk.getFillDelay(Boolean(isLimitPanel), typedFillDelay);
};

export const getOrderDuration = (sdk: TwapSDK, state: State, chunks: number, fillDelay: TimeDuration) => {
  const { typedDuration } = state;

  return sdk.getOrderDuration(chunks, fillDelay, typedDuration);
};

const getChunksError = (sdk: TwapSDK, chunks: number, maxChunks: number, isLimitPanel: boolean) => {
  if (!chunks) {
    return {
      type: InputErrors.MIN_CHUNKS_ERROR,
      value: 1,
    };
  }
  const { isError } = sdk.getMaxChunksError(chunks, maxChunks, Boolean(isLimitPanel));
  if (!isError) return undefined;
  return {
    type: InputErrors.MAX_CHUNKS_ERROR,
    value: maxChunks,
  };
};

const getTradeSizeError = (sdk: TwapSDK, state: State, srcUsd1Token = "", minChunkSizeUsd = 0) => {
  const { typedSrcAmount } = state;
  const { isError, value } = sdk.getMinTradeSizeError(typedSrcAmount || "", srcUsd1Token || "", minChunkSizeUsd || 0);
  if (typedSrcAmount && isError) {
    return {
      type: InputErrors.MIN_TRADE_SIZE_ERROR,
      value,
    };
  }
};

const getLimitPriceError = (state: State) => {
  const { typedPrice } = state;
  return typedPrice !== undefined && BN(typedPrice || 0).isZero() ? InputErrors.EMPTY_LIMIT_PRICE : undefined;
};

const getFillDelayError = (sdk: TwapSDK, fillDelay: TimeDuration, chunks: number) => {
  const maxError = sdk.getMaxFillDelayError(fillDelay, chunks);
  if (maxError.isError) {
    return {
      type: InputErrors.MAX_FILL_DELAY_ERROR,
      value: maxError.value,
    };
  }
  const minError = sdk.getMinFillDelayError(fillDelay);
  if (minError.isError) {
    return {
      type: InputErrors.MIN_FILL_DELAY_ERROR,
      value: minError.value,
    };
  }
};

const getOrderDurationError = (sdk: TwapSDK, orderDuration: TimeDuration) => {
  const { isError, value } = sdk.getOrderDurationError(orderDuration);
  if (isError) {
    return {
      type: InputErrors.MAX_DURATION_ERROR,
      value: value,
    };
  }
};

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

const initiateWallet = (chainId?: number, provider?: Provider) => {
  const chain = Object.values(chains).find((it: any) => it.id === chainId);
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

const getPublicFallbackClient = (chainId: number) => {
  const chain = Object.values(chains).find((it: any) => it.id === chainId);
  if (!chain) return;
  return createPublicClient({ chain, transport: http(`https://rpcman.orbs.network/rpc?chainId=${chainId}&appId=twap-ui`) }) as ReturnType<typeof createPublicClient>;
};

const getOrderStatuses = async (publicClient: PublicClient, orders: Order[]) => {
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

const lib = {
  getLimitPrice,
  getMaxChunks,
  getChunks,
  getSrcTokenChunkSize,
  getDestTokenAmount,
  getDestTokenMinAmount,
  getSrcChunkAmountUSD,
  getOrderDeadline,
  getFillDelay,
  getOrderDuration,
  getChunksError,
  getTradeSizeError,
  getLimitPriceError,
  getFillDelayError,
  getOrderDurationError,
  initiateWallet,
  getPublicFallbackClient,
  getOrderStatuses,
};

export default lib;
