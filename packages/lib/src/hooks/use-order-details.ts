import { useMemo } from "react";
import BN from "bignumber.js";
import { useTwapContext } from "../context";
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

export const useOrderDetails = (props: Props) => {
  const { translations: t } = useTwapContext();

  const srcAmount = useFormatNumber({ value: useAmountUi(props.srcToken?.decimals, props.srcAmount) });
  const srcAmountPerChunk = useFormatNumber({ value: useAmountUi(props.srcToken?.decimals, props.srcAmountPerChunk) });
  const minDestAmountPerChunk = useFormatNumber({
    value: useAmountUi(props.dstToken?.decimals, props.minDestAmountPerChunk && BN(props.minDestAmountPerChunk).lte(1) ? "" : props.minDestAmountPerChunk),
  });
  const triggerPricePerChunk = useFormatNumber({ value: useAmountUi(props.dstToken?.decimals, props.triggerPricePerChunk) });
  return useMemo(() => {
    return {
      limitPrice: {
        label: t.limitPrice,
        value: props.limitPrice,
      },

      deadline: {
        tooltip: t.deadlineTooltip,
        label: t.deadline,
        value: props.deadline,
      },
      amountIn: {
        label: t.amountOut,
        value: srcAmount,
      },
      chunkSize: {
        tooltip: t.tradeSizeTooltip,
        label: t.individualTradeSize,
        value: srcAmountPerChunk,
      },
      chunksAmount: {
        tooltip: t.totalTradesTooltip,
        label: t.numberOfTrades,
        value: props.chunksAmount,
      },
      minDestAmountPerChunk: {
        tooltip: t.minDstAmountTooltip,
        label: t.minReceivedPerTrade,
        value: minDestAmountPerChunk,
      },
      tradeInterval: {
        tooltip: t.tradeIntervalTootlip,
        label: t.tradeInterval,
        value: props.tradeInterval,
      },
      triggerPricePerChunk: {
        tooltip: t.triggerPriceTooltip,
        label: t.triggerPricePerChunk,
        value: triggerPricePerChunk,
      },
      recipient: {
        label: t.recipient,
        value: props.maker,
      },
    };
  }, [props, t, srcAmount, srcAmountPerChunk, minDestAmountPerChunk, triggerPricePerChunk]);
};
