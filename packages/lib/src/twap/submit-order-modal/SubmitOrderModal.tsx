import { Main } from "./Main";
import { Step, SwapFlow } from "@orbs-network/swap-ui";
import { Failed } from "./Failed";
import { ReactNode, useMemo } from "react";
import { useTwapContext } from "../../context";

import { isNativeAddress } from "@orbs-network/twap-sdk";
import { Steps } from "../../types";
import { useTwapStore } from "../../useTwapStore";
import { SwapFlowComponent } from "../swap-flow";
import { useChunks } from "../../hooks/use-chunks";
import { useOrderName } from "../../hooks/order-hooks";
import { useExplorerLink, useNetwork } from "../../hooks/helper-hooks";
import { useOrderExecutionFlow } from "../../hooks/use-confirmation";

const Modal = ({ children }: { children: ReactNode }) => {
  const context = useTwapContext();
  const { onClose, isFlowOpen } = useOrderExecutionFlow();

  return (
    <context.SubmitOrderPanel isOpen={Boolean(isFlowOpen)} onClose={onClose} title="Create order">
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
  const wrapExplorerUrl = useExplorerLink(wrapTxHash);
  const unwrapExplorerUrl = useExplorerLink(wrapTxHash);

  const approveExplorerUrl = useExplorerLink(approveTxHash);
  const createOrderExplorerUrl = useExplorerLink(createOrderTxHash);
  const isNativeIn = isNativeAddress(srcToken?.address || "");
  const symbol = isNativeIn ? network?.native.symbol || "" : srcToken?.symbol || "";
  const wSymbol = network?.wToken.symbol;
  const swapTitle = useTitle();

  return useMemo((): Step | undefined => {
    if (activeStep === Steps.UNWRAP) {
      return {
        title: t.unwrapAction.replace("{symbol}", wSymbol || ""),
        explorerUrl: unwrapExplorerUrl,
        hideTokens: true,
      };
    }
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
      title: swapTitle,
      explorerUrl: createOrderExplorerUrl,
    };
  }, [activeStep, approveExplorerUrl, createOrderExplorerUrl, symbol, swapTitle, t, wrapExplorerUrl, unwrapExplorerUrl, wSymbol]);
};

export const SubmitOrderPanel = () => {
  const swapError = useTwapStore((s) => s.state.swapError);
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const totalSteps = useTwapStore((s) => s.state.totalSteps);
  const currentStepIndex = useTwapStore((s) => s.state.currentStepIndex);
  const { TransactionModal } = useTwapContext();

  const {
    orderDetails: { srcAmount, dstAmount, srcToken, dstToken },
  } = useOrderExecutionFlow();

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
        dstAmount={dstAmount}
        inToken={srcToken}
        outToken={dstToken}
      />
    </Modal>
  );
};

const LoadingView = () => {
  const { TransactionModal } = useTwapContext();
  const {
    orderDetails: { srcAmount, dstAmount, orderType, srcToken, dstToken },
  } = useOrderExecutionFlow();
  const step = useTwapStore((s) => s.state.activeStep);
  const fetchingAllowance = useTwapStore((s) => s.state.fetchingAllowance);

  if (TransactionModal?.CreateOrder?.LoadingView && srcToken && dstToken) {
    return (
      <TransactionModal.CreateOrder.LoadingView
        fetchingAllowance={fetchingAllowance}
        srcToken={srcToken}
        dstToken={dstToken}
        orderType={orderType}
        srcAmount={srcAmount || ""}
        dstAmount={dstAmount || ""}
        step={step!}
      />
    );
  }
  return null;
};

const SuccessContent = () => {
  const { TransactionModal, srcToken, dstToken } = useTwapContext();
  const successTitle = useTitle();
  const {
    onClose,
    explorerUrl,
    createOrderTxHash,
    orderDetails: { srcAmount, dstAmount, orderType },
  } = useOrderExecutionFlow();

  if (TransactionModal?.CreateOrder?.SuccessContent && srcToken && dstToken) {
    return (
      <TransactionModal.CreateOrder.SuccessContent
        srcToken={srcToken}
        dstToken={dstToken}
        srcAmount={srcAmount || ""}
        dstAmount={dstAmount || ""}
        orderType={orderType}
        explorerUrl={explorerUrl || ""}
        txHash={createOrderTxHash}
        onClose={onClose}
      />
    );
  }
  return <SwapFlow.Success title={successTitle} explorerUrl={explorerUrl} />;
};
