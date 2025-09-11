import { Main } from "./Main";
import { Step, SwapFlow } from "@orbs-network/swap-ui";
import { Failed } from "./Failed";
import { ReactNode, useMemo } from "react";
import { useTwapContext } from "../../context";
import {
  useChunks,
  useDestTokenAmount,
  useNetwork,
  useOnCloseConfirmationModal,
  useOrderName,
  useOrderType,
  useSrcAmount,
  useTransactionExplorerLink,
} from "../../hooks/logic-hooks";
import { isNativeAddress } from "@orbs-network/twap-sdk";
import { Steps } from "../../types";
import { useTwapStore } from "../../useTwapStore";
import { useSubmitOrderPanel } from "../twap";
import { SwapFlowComponent } from "../swap-flow";

const Modal = ({ children }: { children: ReactNode }) => {
  const context = useTwapContext();
  const { isOpen, onClose } = useSubmitOrderPanel();

  if (!context.SubmitOrderPanel) {
    return null;
  }

  return (
    <context.SubmitOrderPanel isOpen={Boolean(isOpen)} onClose={onClose} title="Create order">
      <div className="twap-create-order">{children}</div>
    </context.SubmitOrderPanel>
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

export const SubmitOrderPanel = () => {
  const swapError = useTwapStore((s) => s.state.swapError);
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const totalSteps = useTwapStore((s) => s.state.totalSteps);
  const currentStepIndex = useTwapStore((s) => s.state.currentStepIndex);
  const srcAmount = useSrcAmount().amountUI || "";
  const { srcToken, dstToken, TransactionModal } = useTwapContext();
  const acceptedDstAmount = useTwapStore((s) => s.state.acceptedDstAmount);

  return (
    <Modal>
      <SwapFlowComponent
        swapStatus={swapStatus}
        totalSteps={totalSteps}
        currentStep={useStep()}
        currentStepIndex={currentStepIndex}
        failedContent={<Failed error={swapError} />}
        successContent={<SuccessContent />}
        mainContent={<Main />}
        loadingViewContent={TransactionModal?.CreateOrder?.LoadingView && srcToken && dstToken ? <LoadingView /> : null}
        srcAmount={srcAmount}
        dstAmount={acceptedDstAmount}
        inToken={srcToken}
        outToken={dstToken}
      />
    </Modal>
  );
};

const LoadingView = () => {
  const { TransactionModal } = useTwapContext();
  const dstAmount = useDestTokenAmount().amountUI;
  const srcAmount = useSrcAmount().amountUI || "";
  const orderType = useOrderType();
  const step = useTwapStore((s) => s.state.activeStep);
  const { srcToken, dstToken } = useTwapContext();
  const fetchingAllowance = useTwapStore((s) => s.state.fetchingAllowance);

  if (TransactionModal?.CreateOrder?.LoadingView && srcToken && dstToken) {
    return (
      <TransactionModal.CreateOrder.LoadingView
        fetchingAllowance={fetchingAllowance}
        srcToken={srcToken}
        dstToken={dstToken}
        orderType={orderType}
        srcAmount={srcAmount}
        dstAmount={dstAmount}
        step={step!}
      />
    );
  }
  return null;
};

const SuccessContent = () => {
  const createOrderTxHash = useTwapStore((s) => s.state.createOrderTxHash);
  const explorerUrl = useTransactionExplorerLink(createOrderTxHash);
  const { TransactionModal, srcToken, dstToken } = useTwapContext();
  const successTitle = useTitle();
  const orderType = useOrderType();
  const srcAmount = useSrcAmount().amountUI || "";
  const dstAmount = useDestTokenAmount().amountUI;
  const onClose = useOnCloseConfirmationModal();

  if (TransactionModal?.CreateOrder?.SuccessContent && srcToken && dstToken) {
    return (
      <TransactionModal.CreateOrder.SuccessContent
        srcToken={srcToken}
        dstToken={dstToken}
        srcAmount={srcAmount}
        dstAmount={dstAmount}
        orderType={orderType}
        explorerUrl={explorerUrl || ""}
        txHash={createOrderTxHash}
        onClose={onClose}
      />
    );
  }
  return <SwapFlow.Success title={successTitle} explorerUrl={explorerUrl} />;
};
