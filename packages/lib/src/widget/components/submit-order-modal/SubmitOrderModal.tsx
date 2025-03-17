import { Main } from "./Main";
import { Step, SwapFlow } from "@orbs-network/swap-ui";
import { Failed } from "./Failed";
import { useFormatNumber } from "../../../hooks/useFormatNumber";
import { ReactNode, useMemo } from "react";
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

const Modal = ({ children }: { children: ReactNode }) => {
  const { modals, state, translations: t, srcUsd1Token, dstUsd1Token } = useTwapContext();
  const onClose = useOnCloseConfirmationModal();
  const deadline = useOrderDeadline();
  const srcChunkAmount = useSrcTokenChunkAmount().amountUI;
  const chunks = useChunks().chunks;
  const fillDelayMillis = useFillDelay().milliseconds;
  const dstMinAmountOut = useDestTokenMinAmount().amountUI;
  const fee = useFee();
  const { mutateAsync: onConfirm } = useSubmitOrderCallback();
  const srcUsd = useUsdAmount(state.trade?.srcAmount, srcUsd1Token);
  const dstUsd = useUsdAmount(state.trade?.dstAmount, dstUsd1Token);

  return (
    <modals.OrderConfirmationModal
      activeStep={state.activeStep}
      swapError={state.swapError}
      swapStatus={state.swapStatus}
      totalSteps={state.totalSteps}
      currentStepIndex={state.currentStepIndex || 0}
      isOpen={Boolean(state.showConfirmation)}
      onClose={onClose}
      title={!state.swapStatus ? t.orderModalConfirmOrder : ""}
      feeAmount={fee.amountUI}
      feePercent={fee.percent}
      deadline={deadline}
      srcChunkAmount={srcChunkAmount}
      trades={chunks}
      fillDelayMillis={fillDelayMillis}
      dstMinAmountOut={dstMinAmountOut}
      unwrapTxHash={state.unwrapTxHash}
      wrapTxHash={state.wrapTxHash}
      approveTxHash={state.approveTxHash}
      createOrderTxHash={state.createOrderTxHash}
      orderType={getOrderType(Boolean(state.isMarketOrder), chunks)}
      srcToken={state.trade?.srcToken}
      dstToken={state.trade?.dstToken}
      srcAmount={state.trade?.srcAmount}
      dstAmount={state.trade?.dstAmount}
      srcAmountusd={srcUsd}
      dstAmountusd={dstUsd}
      onConfirm={onConfirm}
    >
      <div className="twap-create-order">{children}</div>
    </modals.OrderConfirmationModal>
  );
};

const useStep = () => {
  const { translations: t, state } = useTwapContext();
  const network = useNetwork();
  const wrapExplorerUrl = useTransactionExplorerLink(state.wrapTxHash);
  const approveExplorerUrl = useTransactionExplorerLink(state.approveTxHash);
  const createOrderExplorerUrl = useTransactionExplorerLink(state.createOrderTxHash);
  const srcToken = state.trade?.srcToken;
  const isNativeIn = isNativeAddress(srcToken?.address || "");
  const symbol = isNativeIn ? network?.native.symbol || "" : srcToken?.symbol || "";
  const orderName = state.trade?.title || "";

  return useMemo((): Step | undefined => {
    if (state.activeStep === Steps.WRAP) {
      return {
        title: t.wrapAction.replace("{symbol}", symbol),
        explorerUrl: wrapExplorerUrl,
      };
    }
    if (state.activeStep === Steps.APPROVE) {
      return {
        title: t.approveAction?.replace("{symbol}", symbol),
        explorerUrl: approveExplorerUrl,
      };
    }
    return {
      title: t.createOrderAction.replace("{name}", orderName),
      explorerUrl: createOrderExplorerUrl,
    };
  }, [state.activeStep, approveExplorerUrl, createOrderExplorerUrl, symbol, orderName, t, wrapExplorerUrl]);
};

export const SubmitOrderModal = () => {
  const {
    components,
    state: { swapError, swapStatus, totalSteps, currentStepIndex, trade },
  } = useTwapContext();
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
          Loader: components.CreateOrderLoader,
          SuccessIcon: components.CreateOrderSuccessIcon,
          FailedIcon: components.CreateOrderErrorIcon,
        }}
      />
    </Modal>
  );
};

const SuccessContent = () => {
  const {
    state: { createOrderTxHash, trade },
    translations: t,
  } = useTwapContext();
  const explorerUrl = useTransactionExplorerLink(createOrderTxHash);
  return <SwapFlow.Success title={t.CreateOrderModalOrderCreated.replace("{name}", trade?.title || "")} explorerUrl={explorerUrl} />;
};
