import { useCallback, useMemo } from "react";
import { BaseTwapProps, TwapOrder } from "../types";
import { constructSDK, getOrderFillDelay, parseOrderStatus, TimeDuration, TwapSDK } from "@orbs-network/twap-sdk";
import { getAllowance, getOrderStatuses, getPublicFallbackClient } from "../lib";
import { useAmountUi } from "./logic-hooks";

const useGetOrderCallback = (sdk: TwapSDK) => {
  return useCallback(
    async (account: string, signal?: AbortSignal) => {
      const publicClient = getPublicFallbackClient(sdk.config.chainId);
      const orders = await sdk.getOrders(account!, signal);
      const statuses = await getOrderStatuses(publicClient, orders);
      return orders.map((order, index): TwapOrder => {
        const status = parseOrderStatus(order.progress, statuses?.[index]);

        return { ...order, status, fillDelayMillis: getOrderFillDelay(order.fillDelay, sdk.config) };
      });
    },
    [sdk],
  );
};

const useGetAllowance = (sdk: TwapSDK) => {
  return useCallback(
    async (token: string, account: string) => {
      const publicClient = getPublicFallbackClient(sdk.config.chainId);
      return getAllowance(token, account, sdk.config.twapAddress, publicClient);
    },
    [sdk],
  );
};

interface UseTwapProps extends BaseTwapProps {
  srcAmount?: string;
  srcTokenDecimals?: number;
  srcUsd1Token?: number;
  minChunkSizeUsd?: number;
  typedChunks?: number;
  typedFillDelay?: TimeDuration;
  limitPrice?: string;
}

export function useTwap(props: UseTwapProps) {
  const { srcAmount, srcUsd1Token, minChunkSizeUsd, isLimitPanel, typedChunks, srcTokenDecimals, limitPrice, typedFillDelay } = props;
  const sdk = useMemo(() => constructSDK({ config: props.config }), [props.config]);
  const getOrder = useGetOrderCallback(sdk);
  const getAllowance = useGetAllowance(sdk);
  const typedSrcAmount = useAmountUi(srcTokenDecimals, srcAmount);
  const maxChunks = useMemo(() => sdk.getMaxChunks(typedSrcAmount || "", srcUsd1Token || 0, minChunkSizeUsd || 0), [typedSrcAmount, srcUsd1Token, minChunkSizeUsd, sdk]);
  const chunks = useMemo(() => sdk.getChunks(maxChunks, Boolean(isLimitPanel), typedChunks), [maxChunks, typedChunks, isLimitPanel, sdk]);
  const srcTokenChunkSize = useMemo(() => sdk.getSrcTokenChunkAmount(typedSrcAmount || "", chunks), [sdk, typedSrcAmount, chunks]);
  const destTokenAmount = useMemo(() => sdk.getDestTokenAmount(srcAmount || "", limitPrice || "", srcTokenDecimals || 0), [sdk, srcAmount, limitPrice, srcTokenDecimals]);
  const destTokenMinAmount = useMemo(
    () => sdk.getDestTokenMinAmount(srcTokenChunkSize, limitPrice || "", Boolean(isLimitPanel), srcTokenDecimals || 0),
    [sdk, srcTokenChunkSize, limitPrice, isLimitPanel, srcTokenDecimals],
  );
  const fillDelay = useMemo(() => sdk.getFillDelay(Boolean(isLimitPanel), typedFillDelay), [isLimitPanel, typedFillDelay, sdk]);

  return {
    getOrder,
    getAllowance,
    chunks,
    srcTokenChunkSize,
    destTokenAmount,
    destTokenMinAmount,
    fillDelay,
    spenderAddress: props.config.twapAddress,
  };
}
