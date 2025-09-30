import { useMemo } from "react";
import BN from "bignumber.js";
import { useTwapContext } from "../context/twap-context";
import { Token } from "../types";
import { useAmountUi } from "./helper-hooks";
import { useFormatNumber } from "./useFormatNumber";

type Props = {
  srcToken?: Token;
  dstToken?: Token;
  limitPrice?: string;
  deadline?: number;
  srcAmount?: string;
  srcAmountPerChunk?: string;
  chunksAmount?: number;
  minDestAmountPerChunk?: string;
  tradeInterval?: number;
  triggerPricePerChunk?: string;
  maker?: string;
};

export const useBaseOrder = (props: Props) => {
  const { translations: t } = useTwapContext();

  const srcAmount = useFormatNumber({ value: useAmountUi(props.srcToken?.decimals, props.srcAmount) });
  const srcAmountPerChunk = useFormatNumber({ value: useAmountUi(props.srcToken?.decimals, props.srcAmountPerChunk) });
  const minDestAmountPerChunk = useFormatNumber({
    value: useAmountUi(props.dstToken?.decimals, props.minDestAmountPerChunk && BN(props.minDestAmountPerChunk).lte(1) ? "" : props.minDestAmountPerChunk),
  });
  const triggerPricePerChunk = useFormatNumber({ value: useAmountUi(props.dstToken?.decimals, props.triggerPricePerChunk) });
  return useMemo(() => {
    return {
      srcToken: props.srcToken,
      dstToken: props.dstToken,
      limitPrice: {
        label: t.limitPrice,
        value: props.limitPrice || "",
      },

      deadline: {
        tooltip: t.deadlineTooltip,
        label: t.deadline,
        value: props.deadline || 0,
      },
      amountIn: {
        label: t.amountOut,
        value: srcAmount || "",
        token: props.srcToken,
      },
      tradeSize: {
        tooltip: t.tradeSizeTooltip,
        label: t.individualTradeSize,
        value: srcAmountPerChunk || "",
        token: props.srcToken,
      },
      tradesAmount: {
        tooltip: t.totalTradesTooltip,
        label: t.numberOfTrades,
        value: props.chunksAmount || 0,
      },
      minDestAmountPerTrade: {
        tooltip: t.minDstAmountTooltip,
        label: props.chunksAmount && props.chunksAmount > 1 ? t.minReceivedPerTrade : t.minReceived,
        value: minDestAmountPerChunk || "",
        token: props.dstToken,
      },
      tradeInterval: {
        tooltip: t.tradeIntervalTootlip,
        label: t.tradeInterval,
        value: props.tradeInterval || 0,
      },
      triggerPricePerTrade: {
        tooltip: "Trigger price",
        label: props.chunksAmount && props.chunksAmount > 1 ? t.triggerPricePerChunk : t.triggerPrice,
        value: triggerPricePerChunk || "",
        token: props.dstToken,
      },
      recipient: {
        label: t.recipient,
        value: props.maker || "",
      },
    };
  }, [props, t, srcAmount, srcAmountPerChunk, minDestAmountPerChunk, triggerPricePerChunk]);
};
