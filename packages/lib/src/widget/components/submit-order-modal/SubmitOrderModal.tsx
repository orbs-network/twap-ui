import { Main } from "./Main";
import { Step, SwapFlow } from "@orbs-network/swap-ui";
import { Failed } from "./Failed";
import { useFormatNumber } from "../../../hooks/useFormatNumber";
import { ReactNode, useCallback, useMemo } from "react";
import { useTwapContext } from "../../../context";
import {
  useChunks,
  useDestTokenMinAmount,
  useFillDelay,
  useNetwork,
  useOnCloseConfirmationModal,
  useOrderDeadline,
  useSrcTokenChunkAmount,
  useTransactionExplorerLink,
  useUsdAmount,
} from "../../../hooks/logic-hooks";
import { isNativeAddress } from "@orbs-network/twap-sdk";
import { useFee } from "../../../hooks/ui-hooks";
import { Steps } from "../../../types";
import { getOrderType } from "../../../utils";
import { useSubmitOrderCallback } from "../../../hooks/send-transactions-hooks";
import { useTwapStore } from "../../../useTwapStore";

const Modal = ({ children }: { children: ReactNode }) => {
  const { components, translations: t, srcUsd1Token, dstUsd1Token } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);
  const trade = useTwapStore((s) => s.state.trade);
  const onClose = useOnCloseConfirmationModal();
  const deadline = useOrderDeadline();
  const srcChunkAmount = useSrcTokenChunkAmount().amountUI;
  const chunks = useChunks().chunks;
  const fillDelayMillis = useFillDelay().milliseconds;
  const dstMinAmountOut = useDestTokenMinAmount().amountUI;
  const fee = useFee();
  const { mutateAsync: onConfirm, checkingApproval } = useSubmitOrderCallback();
  const srcUsd = useUsdAmount(trade?.srcAmount, srcUsd1Token);
  const dstUsd = useUsdAmount(trade?.dstAmount, dstUsd1Token);
  const activeStep = useTwapStore((s) => s.state.activeStep);
  const swapError = useTwapStore((s) => s.state.swapError);
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const totalSteps = useTwapStore((s) => s.state.totalSteps);
  const currentStepIndex = useTwapStore((s) => s.state.currentStepIndex);
  const disclaimerAccepted = useTwapStore((s) => s.state.disclaimerAccepted);
  const showConfirmation = useTwapStore((s) => s.state.showConfirmation);
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const unwrapTxHash = useTwapStore((s) => s.state.unwrapTxHash);
  const wrapTxHash = useTwapStore((s) => s.state.wrapTxHash);
  const approveTxHash = useTwapStore((s) => s.state.approveTxHash);
  const createOrderTxHash = useTwapStore((s) => s.state.createOrderTxHash);

  const setDisclaimerAccepted = useCallback(
    (accepted: boolean) => {
      updateState({ disclaimerAccepted: accepted });
    },
    [updateState],
  );

  return (
    <components.OrderConfirmationModal
      activeStep={activeStep}
      swapError={swapError}
      swapStatus={swapStatus}
      totalSteps={totalSteps}
      currentStepIndex={currentStepIndex || 0}
      isOpen={Boolean(showConfirmation)}
      onClose={onClose}
      title={!swapStatus ? t.orderModalConfirmOrder : ""}
      feeAmount={fee.amountUI}
      feePercent={fee.percent}
      deadline={deadline}
      srcChunkAmount={srcChunkAmount}
      trades={chunks}
      fillDelayMillis={fillDelayMillis}
      dstMinAmountOut={dstMinAmountOut}
      unwrapTxHash={unwrapTxHash}
      wrapTxHash={wrapTxHash}
      approveTxHash={approveTxHash}
      createOrderTxHash={createOrderTxHash}
      orderType={getOrderType(Boolean(isMarketOrder), chunks)}
      srcToken={trade?.srcToken}
      dstToken={trade?.dstToken}
      srcAmount={trade?.srcAmount}
      dstAmount={trade?.dstAmount}
      srcAmountusd={srcUsd}
      dstAmountusd={dstUsd}
      onConfirm={onConfirm}
      disclaimerAccepted={disclaimerAccepted}
      setDisclaimerAccepted={setDisclaimerAccepted}
      buttonDisabled={checkingApproval}
    >
      <div className="twap-create-order">{children}</div>
    </components.OrderConfirmationModal>
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
          Loader: components.CreateOrderPanelSpinner,
          SuccessIcon: components.CreateOrderPanelSuccessIcon,
          FailedIcon: components.CreateOrderPanelErrorIcon,
          Link: components.Link,
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
