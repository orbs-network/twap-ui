import { Step, SwapFlow } from "@orbs-network/swap-ui";
import { FC, ReactNode, useMemo } from "react";
import { useTwapContext } from "../../context";
import { isNativeAddress } from "@orbs-network/twap-sdk";
import { Steps, SubmitOrderPanelProps, USDProps } from "../../types";
import { useTwapStore } from "../../useTwapStore";
import { SwapFlowComponent } from "../swap-flow";
import { useChunks } from "../../hooks/use-chunks";
import { useOrderName } from "../../hooks/order-hooks";
import { useExplorerLink, useNetwork } from "../../hooks/helper-hooks";
import { useOrderExecutionFlow } from "../../hooks/use-confirmation";
import { SubmitOrderContextProvider, useSubmitOrderPanelContext } from "./context";
import { Failed } from "./failed";
import { Main } from "./main";

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

const SubmitOrderPanel = (props: SubmitOrderPanelProps) => {
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const totalSteps = useTwapStore((s) => s.state.totalSteps);
  const currentStepIndex = useTwapStore((s) => s.state.currentStepIndex);
  const { LoadingView, Spinner, SuccessIcon, ErrorIcon, Link } = props;

  const {
    orderDetails: { srcAmount, dstAmount, srcToken, dstToken },
    onSubmitOrder,
    isLoading,
    explorerUrl,
  } = useOrderExecutionFlow();

  return (
    <SubmitOrderContextProvider {...props}>
      <SwapFlowComponent
        swapStatus={swapStatus}
        totalSteps={totalSteps}
        currentStep={useStep()}
        currentStepIndex={currentStepIndex}
        failedContent={<Failed />}
        successContent={<SuccessContent explorerUrl={explorerUrl} />}
        mainContent={<Main isLoading={Boolean(isLoading)} onSubmitOrder={onSubmitOrder} />}
        LoadingView={LoadingView}
        srcAmount={srcAmount}
        dstAmount={dstAmount}
        inToken={srcToken}
        outToken={dstToken}
        Spinner={Spinner}
        SuccessIcon={SuccessIcon}
        FailedIcon={ErrorIcon}
        Link={Link}
      />
    </SubmitOrderContextProvider>
  );
};

const SuccessContent = ({ explorerUrl }: { explorerUrl?: string }) => {
  const successTitle = useTitle();

  const { SuccessView } = useSubmitOrderPanelContext();

  if (SuccessView) {
    return SuccessView;
  }
  return <SwapFlow.Success title={successTitle} explorerUrl={explorerUrl} />;
};

export { SubmitOrderPanel };
