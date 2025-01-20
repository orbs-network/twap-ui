import { useSubmitOrderFlow } from "../../hooks/useTransactions";
import { Failed } from "./states";
import { Main } from "./states/Main";
import React from "react";
import { SwapFlow } from "@orbs-network/swap-ui";
import { useExplorerUrl, useFormatNumberV2 } from "../../hooks";
import { useTwapContext } from "../../context/context";

export const CreateOrderModal = ({ className = "" }: { className?: string }) => {
  const { mutate: onSubmit, swapStatus, error } = useSubmitOrderFlow();
  const {
    state: { createOrderTxHash, swapData },
  } = useTwapContext();
  const explorerUrl = useExplorerUrl();
  const srcAmountF = useFormatNumberV2({ value: swapData.srcAmount });
  const outAmountF = useFormatNumberV2({ value: swapData.outAmount });

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
