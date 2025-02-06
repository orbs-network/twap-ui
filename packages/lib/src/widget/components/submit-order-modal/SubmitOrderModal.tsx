import { Main } from "./Main";
import React from "react";
import { SwapFlow } from "@orbs-network/swap-ui";
import { useWidgetContext } from "../../..";
import { Failed } from "./Failed";
import { useFormatNumber } from "../../../hooks/useFormatNumber";
import { useSwapModal } from "../../../hooks/useSwapModal";
import { useNetwork } from "../../../hooks/useNetwork";
import { useOrderName } from "../../../hooks/useOrderName";

export const SubmitOrderModal = ({ className = "" }: { className?: string }) => {
  const {
    state: { confirmedData, swapStatus, swapError, srcAmount },
    components: { Modal },
    srcToken,
    dstToken,
  } = useWidgetContext();
  const { isOpen, onClose } = useSwapModal();
  const srcAmountF = useFormatNumber({ value: srcAmount });
  const outAmountF = useFormatNumber({ value: confirmedData?.outAmount });

  return (
    <Modal isOpen={Boolean(isOpen)} onClose={onClose}>
      <SwapFlow
        className={className}
        inAmount={srcAmountF}
        outAmount={outAmountF}
        mainContent={<Main />}
        swapStatus={swapStatus}
        successContent={<SuccessContent />}
        failedContent={<Failed error={swapError} />}
        inToken={{
          symbol: srcToken?.symbol,
          logo: srcToken?.logoUrl,
        }}
        outToken={{
          symbol: dstToken?.symbol,
          logo: dstToken?.logoUrl,
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

  const orderType = useOrderName();

  return <SwapFlow.Success title={`${orderType} order created`} explorerUrl={`${explorerUrl}/tx/${createOrderTxHash}`} />;
};
