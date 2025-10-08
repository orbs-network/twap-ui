import { useMemo } from "react";
import { useTwapContext } from "../context/twap-context";
import { useDeadline } from "./use-deadline";
import { useFillDelay } from "./use-fill-delay";
import { buildRePermitOrderData, getNetwork, isNativeAddress } from "@orbs-network/twap-sdk";
import { useDstMinAmountPerTrade } from "./use-dst-amount";
import { useSrcAmount } from "./use-src-amount";
import { useTriggerPrice } from "./use-trigger-price";
import { useTrades } from "./use-trades";

export const useBuildRePermitOrderDataCallback = () => {
  const { srcToken, dstToken, chainId, account, slippage: _slippage, config } = useTwapContext();
  const srcAmountPerTrade = useTrades().amountPerTradeWei;
  const srcAmount = useSrcAmount().amountWei;
  const deadlineMillis = useDeadline();
  const triggerAmountPerTrade = useTriggerPrice().pricePerChunkWei;
  const dstMinAmountPerTrade = useDstMinAmountPerTrade().amountWei;
  const fillDelay = useFillDelay().fillDelay;
  const totalTrades = useTrades().totalTrades;
  const slippage = _slippage * 100;
  const fillDelayMillis = !totalTrades || totalTrades === 1 ? 0 : fillDelay.unit * fillDelay.value;

  return useMemo(() => {
    const srcTokenAddress = isNativeAddress(srcToken?.address || "") ? getNetwork(chainId)?.wToken.address : srcToken?.address;

    if (!srcTokenAddress || !dstToken || !chainId || !account || !deadlineMillis || !srcAmount || !config) return;
    return buildRePermitOrderData({
      chainId,
      srcToken: srcTokenAddress,
      dstToken: dstToken.address,
      srcAmount,
      deadlineMillis,
      fillDelayMillis,
      slippage,
      account,
      srcAmountPerTrade,
      dstMinAmountPerTrade,
      triggerAmountPerTrade,
      config,
    });
  }, [srcToken, dstToken, chainId, account, srcAmount, deadlineMillis, srcAmountPerTrade, triggerAmountPerTrade, slippage, dstMinAmountPerTrade, fillDelay, totalTrades, config]);
};
