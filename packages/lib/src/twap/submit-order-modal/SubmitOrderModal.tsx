import { Main } from "./Main";
import { Step, SwapFlow } from "@orbs-network/swap-ui";
import { Failed } from "./Failed";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { ReactNode, useMemo } from "react";
import { useTwapContext } from "../../context";
import { useNetwork, useTransactionExplorerLink } from "../../hooks/logic-hooks";
import { isNativeAddress } from "@orbs-network/twap-sdk";
import { useSubmitOrderPanel } from "../../hooks/ui-hooks";
import { Steps } from "../../types";
import { useTwapStore } from "../../useTwapStore";

const Modal = ({ children }: { children: ReactNode }) => {
  const context = useTwapContext();
  const { isOpen, onClose, title } = useSubmitOrderPanel();

  if (!context.OrderConfirmationModal) return null;

  return (
    <context.OrderConfirmationModal isOpen={Boolean(isOpen)} onClose={onClose} title={title}>
      <div className="twap-create-order">{children}</div>
    </context.OrderConfirmationModal>
  );
};

const useStep = () => {
  const { translations: t } = useTwapContext();
  const activeStep = useTwapStore((s) => s.state.activeStep);
  const wrapTxHash = useTwapStore((s) => s.state.wrapTxHash);
  const approveTxHash = useTwapStore((s) => s.state.approveTxHash);
  const createOrderTxHash = useTwapStore((s) => s.state.createOrderTxHash);
  const trade = useTwapStore((s) => s.state.trade);
  const network = useNetwork();
  const wrapExplorerUrl = useTransactionExplorerLink(wrapTxHash);
  const approveExplorerUrl = useTransactionExplorerLink(approveTxHash);
  const createOrderExplorerUrl = useTransactionExplorerLink(createOrderTxHash);
  const srcToken = trade?.srcToken;
  const isNativeIn = isNativeAddress(srcToken?.address || "");
  const symbol = isNativeIn ? network?.native.symbol || "" : srcToken?.symbol || "";
  const orderName = trade?.title || "";

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
      title: t.createOrderAction.replace("{name}", orderName),
      explorerUrl: createOrderExplorerUrl,
    };
  }, [activeStep, approveExplorerUrl, createOrderExplorerUrl, symbol, orderName, t, wrapExplorerUrl]);
};

export const SubmitOrderModal = () => {
  const { components } = useTwapContext();
  const swapError = useTwapStore((s) => s.state.swapError);
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const totalSteps = useTwapStore((s) => s.state.totalSteps);
  const currentStepIndex = useTwapStore((s) => s.state.currentStepIndex);
  const trade = useTwapStore((s) => s.state.trade);
  const srcAmountF = useFormatNumber({ value: trade?.srcAmount });
  const outAmountF = useFormatNumber({ value: trade?.dstAmount });

  return (
    <Modal>
      <SwapFlow
        inAmount={srcAmountF}
        outAmount={outAmountF}
        swapStatus={swapStatus}
        totalSteps={totalSteps}
        currentStep={useStep()}
        currentStepIndex={currentStepIndex}
        inToken={trade?.srcToken}
        outToken={trade?.dstToken}
        components={{
          SrcTokenLogo: components.TokenLogo && <components.TokenLogo token={trade?.srcToken} />,
          DstTokenLogo: components.TokenLogo && <components.TokenLogo token={trade?.dstToken} />,
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
  const { translations: t } = useTwapContext();
  const createOrderTxHash = useTwapStore((s) => s.state.createOrderTxHash);
  const trade = useTwapStore((s) => s.state.trade);
  const explorerUrl = useTransactionExplorerLink(createOrderTxHash);
  return <SwapFlow.Success title={t.CreateOrderModalOrderCreated.replace("{name}", trade?.title || "")} explorerUrl={explorerUrl} />;
};
