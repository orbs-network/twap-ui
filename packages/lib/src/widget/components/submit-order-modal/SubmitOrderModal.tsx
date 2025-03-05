import { Main } from "./Main";
import { SwapFlow } from "@orbs-network/swap-ui";
import { Failed } from "./Failed";
import { useFormatNumber } from "../../../hooks/useFormatNumber";
import { ReactNode } from "react";
import { useTwapContext } from "../../../context";
import { useConfirmationModalPanel } from "../../../hooks/ui-hooks";

const CustomModal = ({ children }: { children: ReactNode }) => {
  const OrderConfirmationModal = useTwapContext().modals.OrderConfirmationModal;
  const {
    state: { swapStatus, showConfirmation },
  } = useTwapContext();
  const onClose = useConfirmationModalPanel().onClose;

  return (
    <OrderConfirmationModal isOpen={Boolean(showConfirmation)} onClose={onClose} title={!swapStatus ? "Confirm order" : ""}>
      {children}
    </OrderConfirmationModal>
  );
};

export const SubmitOrderModal = ({ className = "" }: { className?: string }) => {
  const {
    srcToken,
    dstToken,
    state: { swapError, swapStatus, swapData },
  } = useTwapContext();
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
  const { explorerLink, orderName } = useConfirmationModalPanel();
  return <SwapFlow.Success title={`${orderName} order created`} explorerUrl={explorerLink} />;
};
