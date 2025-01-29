import { useSubmitOrderFlow } from "../../hooks/useTransactions";
import { Failed } from "./states";
import { Main } from "./states/Main";
import React from "react";
import { SwapFlow } from "@orbs-network/swap-ui";
import { useExplorerUrl, useFormatNumber } from "../../hooks";
import { useWidgetContext } from "../..";

export const CreateOrderModal = ({ className = "" }: { className?: string }) => {
  const { mutate: onSubmit, swapStatus, error } = useSubmitOrderFlow();
  const {
    state: { createOrderTxHash, swapData },
  } = useWidgetContext();
  const explorerUrl = useExplorerUrl();
  const srcAmountF = useFormatNumber({ value: swapData.srcAmount });
  const outAmountF = useFormatNumber({ value: swapData.outAmount });

  return (
    <SwapFlow
      className={className}
      inAmount={srcAmountF}
      outAmount={outAmountF}
      mainContent={<Main onSubmit={onSubmit} />}
      swapStatus={swapStatus}
      successContent={<SwapFlow.Success explorerUrl={`${explorerUrl}/tx/${createOrderTxHash}`} />}
      failedContent={<Failed error={error} />}
      inToken={{
        symbol: swapData.srcToken?.symbol,
        logo: swapData.srcToken?.logoUrl,
      }}
      outToken={{
        symbol: swapData.dstToken?.symbol,
        logo: swapData.dstToken?.logoUrl,
      }}
    />
  );
};
