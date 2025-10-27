import { useMemo } from "react";
import BN from "bignumber.js";
import { Token } from "../types";
import { useAmountBN, useAmountUi } from "./helper-hooks";
import { useFormatNumber } from "./useFormatNumber";
import { useTranslations } from "./use-translations";

type Props = {
  srcToken?: Token;
  dstToken?: Token;
  limitPrice?: string;
  deadline?: number;
  srcAmount?: string;
  srcAmountPerTrade?: string;
  totalTrades?: number;
  minDestAmountPerTrade?: string;
  triggerPricePerTrade?: string;
  tradeInterval?: number;
  maker?: string;
};

export const useBaseOrder = (props: Props) => {
  const t = useTranslations();
  const srcAmount = useFormatNumber({ value: useAmountUi(props.srcToken?.decimals, props.srcAmount) });
  const srcAmountPerTrade = useFormatNumber({ value: useAmountUi(props.srcToken?.decimals, props.srcAmountPerTrade) });
  const minDestAmountPerTrade = useFormatNumber({
    value: useAmountUi(props.dstToken?.decimals, props.minDestAmountPerTrade && BN(props.minDestAmountPerTrade).lte(1) ? "" : props.minDestAmountPerTrade),
  });
  const triggerPricePerTrade = useFormatNumber({ value: useAmountUi(props.dstToken?.decimals, props.triggerPricePerTrade) });
  const limitPriceWei = useAmountBN(props.dstToken?.decimals, props.limitPrice);
  const limitPrice = useFormatNumber({ value: props.limitPrice });
  return useMemo(() => {
    return {
      data: {
        srcToken: props.srcToken,
        dstToken: props.dstToken,
        limitPrice: limitPriceWei,
        deadline: props.deadline,
        srcAmount: props.srcAmount,
        srcAmountPerTrade: props.srcAmountPerTrade,
        totalTrades: props.totalTrades,
        minDestAmountPerTrade: props.minDestAmountPerTrade,
        tradeInterval: props.tradeInterval,
        triggerPricePerTrade: props.triggerPricePerTrade,
        maker: props.maker,
      },
      display: {
        limitPrice: {
          label: t("limitPrice"),
          value: limitPrice || "",
        },

        deadline: {
          tooltip: t("deadlineTooltip"),
          label: t("deadline"),
          value: props.deadline || 0,
        },
        srcAmount: {
          label: t("amountSent"),
          value: srcAmount || "",
          token: props.srcToken,
        },
        tradeSize: {
          tooltip: t("tradeSizeTooltip"),
          label: t("individualTradeSize"),
          value: srcAmountPerTrade || "",
          token: props.srcToken,
        },
        totalTrades: {
          tooltip: t("totalTradesTooltip"),
          label: t("numberOfTrades"),
          value: props.totalTrades || 0,
        },
        minDestAmountPerTrade: {
          tooltip: t("minDstAmountTooltip"),
          label: props.totalTrades && props.totalTrades > 1 ? t("minReceivedPerTrade") : t("minReceived"),
          value: minDestAmountPerTrade || "",
          token: props.dstToken,
        },
        tradeInterval: {
          tooltip: t("tradeIntervalTootlip"),
          label: t("tradeInterval"),
          value: props.tradeInterval || 0,
        },
        triggerPricePerTrade: {
          tooltip: "Trigger price",
          label: props.totalTrades && props.totalTrades > 1 ? t("triggerPricePerChunk") : t("triggerPrice"),
          value: triggerPricePerTrade || "",
          token: props.dstToken,
        },
        recipient: {
          label: t("recipient"),
          value: props.maker || "",
        },
      },
    };
  }, [props, t, srcAmount, srcAmountPerTrade, minDestAmountPerTrade, triggerPricePerTrade, limitPrice]);
};
