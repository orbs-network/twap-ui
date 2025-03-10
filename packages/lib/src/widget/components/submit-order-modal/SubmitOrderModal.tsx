import { Main } from "./Main";
import { Step, SwapFlow } from "@orbs-network/swap-ui";
import { Failed } from "./Failed";
import { useFormatNumber } from "../../../hooks/useFormatNumber";
import { ReactNode, useMemo } from "react";
import { useTwapContext } from "../../../context";
import { useNetwork, useTransactionExplorerLink } from "../../../hooks/logic-hooks";
import { isNativeAddress } from "@orbs-network/twap-sdk";
import { useConfirmationModal, useConfirmationModalOrderDetails } from "../../../hooks/ui-hooks";
import { Steps } from "../../../types";

const CustomModal = ({ children }: { children: ReactNode }) => {
  const OrderConfirmationModal = useTwapContext().modals.OrderConfirmationModal;
  const {
    state: { swapStatus, showConfirmation },
  } = useTwapContext();
  const onClose = useConfirmationModal().onClose;

  return (
    <OrderConfirmationModal isOpen={Boolean(showConfirmation)} onClose={onClose} title={!swapStatus ? "Confirm order" : ""}>
      <div className="twap-create-order">{children}</div>
    </OrderConfirmationModal>
  );
};

const useStep = () => {
  const { orderName, createOrderTxHash, approveTxHash, wrapTxHash, activeStep } = useConfirmationModal();
  const { srcToken } = useConfirmationModalOrderDetails();
  const { translations: t } = useTwapContext();
  const network = useNetwork();
  const wrapExplorerUrl = useTransactionExplorerLink(wrapTxHash);
  const approveExplorerUrl = useTransactionExplorerLink(approveTxHash);
  const createOrderExplorerUrl = useTransactionExplorerLink(createOrderTxHash);
  const isNativeIn = isNativeAddress(srcToken?.address || "");
  return useMemo((): Step | undefined => {
    if (!srcToken) return;

    if (activeStep === Steps.WRAP) {
      return {
        title: t.wrapAction.replace("{symbol}", network?.native.symbol || ""),
        explorerUrl: wrapExplorerUrl,
      };
    }
    if (activeStep === Steps.APPROVE) {
      return {
        title: t.approveAction?.replace("{symbol}", isNativeIn ? network?.wToken.symbol || "" : srcToken.symbol),
        explorerUrl: approveExplorerUrl,
      };
    }
    return {
      title: t.createOrderAction.replace("{name}", orderName),
      explorerUrl: createOrderExplorerUrl,
    };
  }, [orderName, srcToken, network, isNativeIn, activeStep, t, wrapExplorerUrl, approveExplorerUrl, createOrderExplorerUrl]);
};

export const SubmitOrderModal = () => {
  const { swapError, swapStatus, totalSteps, currentStepIndex } = useConfirmationModal();
  const { srcToken, srcAmount, dstToken, dstAmount } = useConfirmationModalOrderDetails();
  const { components } = useTwapContext();
  const srcAmountF = useFormatNumber({ value: srcAmount });
  const outAmountF = useFormatNumber({ value: dstAmount });

  return (
    <CustomModal>
      <SwapFlow
        inAmount={srcAmountF}
        outAmount={outAmountF}
        swapStatus={swapStatus}
        totalSteps={totalSteps}
        currentStep={useStep()}
        currentStepIndex={currentStepIndex}
        inToken={{
          symbol: srcToken?.symbol,
          logo: srcToken?.logoUrl,
        }}
        outToken={{
          symbol: dstToken?.symbol,
          logo: dstToken?.logoUrl,
        }}
        components={{
          SrcTokenLogo: components.TokenLogo ? <components.TokenLogo token={srcToken} /> : undefined,
          DstTokenLogo: components.TokenLogo ? <components.TokenLogo token={dstToken} /> : undefined,
          Failed: <Failed error={swapError} />,
          Success: <SuccessContent />,
          Main: <Main />,
        }}
      />
    </CustomModal>
  );
};

const SuccessContent = () => {
  const { createOrderTxHash, orderName } = useConfirmationModal();
  const explorerUrl = useTransactionExplorerLink(createOrderTxHash);
  return <SwapFlow.Success title={`${orderName} order created`} explorerUrl={explorerUrl} />;
};
