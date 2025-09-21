import { Step, SwapFlow } from "@orbs-network/swap-ui";
import { useMemo } from "react";
import { useTwapContext } from "../../context";
import { isNativeAddress } from "@orbs-network/twap-sdk";
import { Steps, SubmitOrderPanelProps } from "../../types";
import { useTwapStore } from "../../useTwapStore";
import { SwapFlowComponent } from "../swap-flow";
import { useOrderName } from "../../hooks/order-hooks";
import { useExplorerLink, useNetwork } from "../../hooks/helper-hooks";
import { SubmitOrderContextProvider, useSubmitOrderPanelContext } from "./context";
import { Failed } from "./Failed";
import { Main } from "./Main";
import { useTrades } from "../../hooks/use-trades";
import { useDerivedSwap } from "../../hooks/use-derived-swap";

const useTitle = () => {
  const { translations: t } = useTwapContext();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const { trades } = useTrades();
  const orderName = useOrderName(isMarketOrder, trades);
  return t.createOrderAction.replace("{name}", orderName);
};

const useStep = () => {
  const { translations: t, srcToken } = useTwapContext();
  const { step, wrapTxHash, approveTxHash } = useTwapStore((s) => s.state.swapExecution);
  const network = useNetwork();
  const wrapExplorerUrl = useExplorerLink(wrapTxHash);
  const unwrapExplorerUrl = useExplorerLink(wrapTxHash);

  const approveExplorerUrl = useExplorerLink(approveTxHash);
  const isNativeIn = isNativeAddress(srcToken?.address || "");
  const symbol = isNativeIn ? network?.native.symbol || "" : srcToken?.symbol || "";
  const wSymbol = network?.wToken.symbol;
  const swapTitle = useTitle();

  return useMemo((): Step | undefined => {
    if (step === Steps.UNWRAP) {
      return {
        title: t.unwrapAction.replace("{symbol}", wSymbol || ""),
        explorerUrl: unwrapExplorerUrl,
        hideTokens: true,
      };
    }
    if (step === Steps.WRAP) {
      return {
        title: t.wrapAction.replace("{symbol}", symbol),
        explorerUrl: wrapExplorerUrl,
      };
    }
    if (step === Steps.APPROVE) {
      return {
        title: t.approveAction?.replace("{symbol}", symbol),
        explorerUrl: approveExplorerUrl,
      };
    }
    return {
      title: swapTitle,
    };
  }, [step, approveExplorerUrl, symbol, swapTitle, t, wrapExplorerUrl, unwrapExplorerUrl, wSymbol]);
};

const SubmitOrderPanel = (props: SubmitOrderPanelProps) => {
  const { status, stepIndex, totalSteps } = useTwapStore((s) => s.state.swapExecution);
  const { LoadingView, Spinner, SuccessIcon, ErrorIcon, Link } = props;

  const { srcAmount, dstAmount, srcToken, dstToken } = useDerivedSwap();

  return (
    <SubmitOrderContextProvider {...props}>
      <SwapFlowComponent
        swapStatus={status}
        totalSteps={totalSteps}
        currentStep={useStep()}
        currentStepIndex={stepIndex}
        failedContent={<Failed />}
        successContent={<SuccessContent />}
        mainContent={<Main />}
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
