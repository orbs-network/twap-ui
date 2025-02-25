import { Main } from "./Main";
import { SwapFlow } from "@orbs-network/swap-ui";
import { useWidgetContext } from "../../..";
import { Failed } from "./Failed";
import { useFormatNumber } from "../../../hooks/useFormatNumber";
import { useConfirmationModal } from "../../../hooks/useConfirmationModal";
import { useNetwork } from "../../../hooks/useNetwork";
import { useOrderName } from "../../../hooks/useOrderName";
import { Portal } from "../../../components/base";
import { ReactNode } from "react";

const CustomModal = ({ children }: { children: ReactNode }) => {
  const Modal = useWidgetContext().components.Modal;
  const { isOpen, onClose, swapStatus } = useConfirmationModal();

  if (!Modal) {
    return null;
  }

  return (
    <Modal isOpen={Boolean(isOpen)} onClose={onClose} title={!swapStatus ? "Confirm order" : ""}>
      {children}
    </Modal>
  );
};

export const SubmitOrderModal = ({ className = "" }: { className?: string }) => {
  const { srcToken, dstToken } = useWidgetContext();
  const { swapData, swapStatus, swapError } = useConfirmationModal();
  const srcAmountF = useFormatNumber({ value: swapData?.srcAmount });
  const outAmountF = useFormatNumber({ value: swapData?.outAmount });

  return (
    <CustomModal>
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
    </CustomModal>
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

export const SubmitOrderModalWithPortal = () => {
  return (
    <Portal containerId="twap-submit-order-portal">
      <SubmitOrderModal />
    </Portal>
  );
};

export const SubmitOrderModalPortal = () => {
  <div id="twap-submit-order-portal" />;
};
