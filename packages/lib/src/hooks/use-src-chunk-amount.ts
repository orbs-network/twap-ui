import { useMemo } from "react";
import { useTwapContext } from "../context";

import { useAmountUi } from "./helper-hooks";
import { useSrcAmount } from "./use-src-amount";
import { useChunks } from "./use-chunks";
import { useMinChunkSizeUsd } from "./use-min-chunk-size-usd";
import { useTwapStore } from "../useTwapStore";
import { InputError, InputErrors } from "../types";
import BN from "bignumber.js";
import { getMinTradeSizeError, getSrcTokenChunkAmount } from "@orbs-network/twap-sdk";

export const useSrcChunkAmountError = () => {
  const { translations: t } = useTwapContext();
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const srcUsd1Token = useTwapContext().srcUsd1Token;
  const minChunkSizeUsd = useMinChunkSizeUsd();

  return useMemo((): InputError | undefined => {
    const { isError, value } = getMinTradeSizeError(typedSrcAmount || "", srcUsd1Token || "", minChunkSizeUsd || 0);

    if (isError) {
      return {
        type: InputErrors.MIN_TRADE_SIZE,
        value: value,
        message: t.minTradeSizeError.replace("{minTradeSize}", `${value} USD`),
      };
    }
  }, [typedSrcAmount, srcUsd1Token, minChunkSizeUsd]);
};

export const useSrcChunkAmount = () => {
  const { srcToken, srcUsd1Token } = useTwapContext();
  const { chunks } = useChunks();
  const srcAmountWei = useSrcAmount().amountWei;
  const amountWei = useMemo(() => getSrcTokenChunkAmount(srcAmountWei || "", chunks), [srcAmountWei, chunks]);
  const amountUI = useAmountUi(srcToken?.decimals, amountWei);

  const usd = useMemo(() => {
    if (!srcUsd1Token) return "0";
    return BN(amountUI || "0")
      .times(srcUsd1Token || 0)
      .toString();
  }, [amountUI, srcUsd1Token]);

  return {
    amountWei,
    amountUI,
    usd,
  };
};
