import { useSubmitOrderFlow } from "../../../hooks/useTransactions";
import { Main } from "./Main";
import React from "react";
import { SwapFlow } from "@orbs-network/swap-ui";
import { useFormatNumber, useNetwork, useOrderType, useSwapModal } from "../../../hooks";
import { useWidgetContext } from "../../..";
import { Failed } from "./Failed";

export const SubmitOrderModal = ({ className = "" }: { className?: string }) => {
  const { mutate: onSubmit, swapStatus, error } = useSubmitOrderFlow();
  const {
    state: { createOrderTxHash, swapData },
    components: { Modal },
  } = useWidgetContext();
  const { isOpen, onClose } = useSwapModal();
  const explorerUrl = useNetwork()?.explorer;
  const srcAmountF = useFormatNumber({ value: swapData?.srcAmount });
  const outAmountF = useFormatNumber({ value: swapData?.outAmount });

  return (
    <Modal isOpen={Boolean(isOpen)} onClose={onClose}>
      <SwapFlow
        className={className}
        inAmount={srcAmountF}
        outAmount={outAmountF}
        mainContent={<Main onSubmit={onSubmit} />}
        swapStatus={swapStatus}
        successContent={<SuccessContent />}
        failedContent={<Failed error={error} />}
        inToken={{
          symbol: swapData?.srcToken?.symbol,
          logo: swapData?.srcToken?.logoUrl,
        }}
        outToken={{
          symbol: swapData?.dstToken?.symbol,
          logo: swapData?.dstToken?.logoUrl,
        }}
      />
    </Modal>
  );
};

const SuccessContent = () => {
  const {
    state: { createOrderTxHash },
  } = useWidgetContext();
  const explorerUrl = useNetwork()?.explorer;

  const orderType = useOrderType();

  return <SwapFlow.Success title={`${orderType} order created`} explorerUrl={`${explorerUrl}/tx/${createOrderTxHash}`} />;
};
