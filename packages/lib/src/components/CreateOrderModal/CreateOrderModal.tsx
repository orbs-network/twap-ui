import { useSubmitOrderFlow } from "../../hooks/useTransactions";
import { Failed } from "./states";
import { Main } from "./states/Main";
import React from "react";
import { SwapFlow } from "@orbs-network/swap-ui";
import { useExplorerUrl, useFormatNumberV2, useSwapData } from "../../hooks";
import { useTwapContext } from "../../context/context";

export const CreateOrderModal = ({ className = "" }: { className?: string }) => {
  const { mutate: onSubmit, swapStatus, error } = useSubmitOrderFlow();
  const { srcAmount, outAmount, srcToken, dstToken } = useSwapData();
  const { createOrderTxHash } = useTwapContext().state;
  const explorerUrl = useExplorerUrl();

  const srcAmountF = useFormatNumberV2({ value: srcAmount.amountUi });
  const outAmountF = useFormatNumberV2({ value: outAmount.amountUi });
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
        symbol: srcToken?.symbol,
        logo: srcToken?.logoUrl,
      }}
      outToken={{
        symbol: dstToken?.symbol,
        logo: dstToken?.logoUrl,
      }}
    />
  );
};
