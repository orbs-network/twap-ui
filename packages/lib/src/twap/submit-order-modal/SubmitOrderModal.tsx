import { Main } from "./Main";
import { Step, SwapFlow } from "@orbs-network/swap-ui";
import { Failed } from "./Failed";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { ReactNode, useMemo } from "react";
import { useTwapContext } from "../../context";
import { useChunks, useNetwork, useOrderName, useTransactionExplorerLink } from "../../hooks/logic-hooks";
import { isNativeAddress } from "@orbs-network/twap-sdk";
import { Steps } from "../../types";
import { useTwapStore } from "../../useTwapStore";
import { useSubmitOrderPanel } from "../twap";

const Modal = ({ children }: { children: ReactNode }) => {
  const context = useTwapContext();
  const {
    modal: { isOpen, onClose },
  } = useSubmitOrderPanel();

  if (!context.OrderConfirmationModal) return null;

  return (
    <context.OrderConfirmationModal isOpen={Boolean(isOpen)} onClose={onClose} title="Create order">
      <div className="twap-create-order">{children}</div>
    </context.OrderConfirmationModal>
  );
};

const useTitle = () => {
  const { translations: t } = useTwapContext();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const { chunks } = useChunks();
  const orderName = useOrderName(isMarketOrder, chunks);
  return t.createOrderAction.replace("{name}", orderName);
};

const useStep = () => {
  const { translations: t, srcToken } = useTwapContext();
  const activeStep = useTwapStore((s) => s.state.activeStep);
  const wrapTxHash = useTwapStore((s) => s.state.wrapTxHash);
  const approveTxHash = useTwapStore((s) => s.state.approveTxHash);
  const createOrderTxHash = useTwapStore((s) => s.state.createOrderTxHash);
  const network = useNetwork();
  const wrapExplorerUrl = useTransactionExplorerLink(wrapTxHash);
  const approveExplorerUrl = useTransactionExplorerLink(approveTxHash);
  const createOrderExplorerUrl = useTransactionExplorerLink(createOrderTxHash);
  const isNativeIn = isNativeAddress(srcToken?.address || "");
  const symbol = isNativeIn ? network?.native.symbol || "" : srcToken?.symbol || "";
  const successTitle = useTitle();

  return useMemo((): Step | undefined => {
    if (activeStep === Steps.WRAP) {
      return {
        title: t.wrapAction.replace("{symbol}", symbol),
        explorerUrl: wrapExplorerUrl,
      };
    }
    if (activeStep === Steps.APPROVE) {
      return {
        title: t.approveAction?.replace("{symbol}", symbol),
        explorerUrl: approveExplorerUrl,
      };
    }
    return {
      title: successTitle,
      explorerUrl: createOrderExplorerUrl,
    };
  }, [activeStep, approveExplorerUrl, createOrderExplorerUrl, symbol, successTitle, t, wrapExplorerUrl]);
};

export const SubmitOrderModal = () => {
  const { components, srcToken, dstToken } = useTwapContext();
  const swapError = useTwapStore((s) => s.state.swapError);
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const totalSteps = useTwapStore((s) => s.state.totalSteps);
  const currentStepIndex = useTwapStore((s) => s.state.currentStepIndex);
  const srcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const acceptedDstAmount = useTwapStore((s) => s.state.acceptedDstAmount);
  const srcAmountF = useFormatNumber({ value: srcAmount });
  const outAmountF = useFormatNumber({ value: acceptedDstAmount });

  return (
    <Modal>
      <SwapFlow
        inAmount={srcAmountF}
        outAmount={outAmountF}
        swapStatus={swapStatus}
        totalSteps={totalSteps}
        currentStep={useStep()}
        currentStepIndex={currentStepIndex}
        inToken={srcToken}
        outToken={dstToken}
        components={{
          SrcTokenLogo: components.TokenLogo && <components.TokenLogo token={srcToken} />,
          DstTokenLogo: components.TokenLogo && <components.TokenLogo token={dstToken} />,
          Failed: <Failed error={swapError} />,
          Success: <SuccessContent />,
          Main: <Main />,
          Loader: components.TransactionModal?.Spinner,
          SuccessIcon: components.TransactionModal?.SuccessIcon,
          FailedIcon: components.TransactionModal?.ErrorIcon,
          Link: components.TransactionModal?.Link,
        }}
      />
    </Modal>
  );
};

const SuccessContent = () => {
  const createOrderTxHash = useTwapStore((s) => s.state.createOrderTxHash);
  const explorerUrl = useTransactionExplorerLink(createOrderTxHash);
  const successTitle = useTitle();
  return <SwapFlow.Success title={successTitle} explorerUrl={explorerUrl} />;
};
