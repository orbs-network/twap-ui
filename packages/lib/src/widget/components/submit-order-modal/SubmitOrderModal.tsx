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
  const onClose = useConfirmationModalPanel().callbacks.onClose;

  return (
    <OrderConfirmationModal isOpen={Boolean(showConfirmation)} onClose={onClose} title={!swapStatus ? "Confirm order" : ""}>
      <div className="twap-create-order">{children}</div>
    </OrderConfirmationModal>
  );
};

export const SubmitOrderModal = ({ className = "" }: { className?: string }) => {
  const { swapError, swapStatus, srcAmount, dstAmount, srcToken, dstToken } = useConfirmationModalPanel();
  const { components } = useTwapContext();
  const srcAmountF = useFormatNumber({ value: srcAmount });
  const outAmountF = useFormatNumber({ value: dstAmount });

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
        components={{
          srcTokenLogo: components.TokenLogo ? <components.TokenLogo token={srcToken} /> : undefined,
          dstTokenLogo: components.TokenLogo ? <components.TokenLogo token={dstToken} /> : undefined,
        }}
      />
    </CustomModal>
  );
};

const SuccessContent = () => {
  const { explorerLink, orderName } = useConfirmationModalPanel();
  return <SwapFlow.Success title={`${orderName} order created`} explorerUrl={explorerLink} />;
};
