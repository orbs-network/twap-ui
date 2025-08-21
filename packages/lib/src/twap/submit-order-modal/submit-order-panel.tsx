import { Main } from "./Main";
import { Step, SwapFlow } from "@orbs-network/swap-ui";
import { Failed } from "./Failed";
import { FC, ReactNode, useMemo } from "react";
import { useTwapContext } from "../../context";
import { isNativeAddress } from "@orbs-network/twap-sdk";
import { LabelProps, LinkProps, Steps, USDProps } from "../../types";
import { useTwapStore } from "../../useTwapStore";
import { SwapFlowComponent } from "../swap-flow";
import { useChunks } from "../../hooks/use-chunks";
import { useOrderName } from "../../hooks/order-hooks";
import { useExplorerLink, useNetwork } from "../../hooks/helper-hooks";
import { useOrderExecutionFlow } from "../../hooks/use-confirmation";

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

type Props = {
  SuccessView?: ReactNode;
  ErrorView?: ReactNode;
  MainView?: ReactNode;
  LoadingView?: ReactNode;
  Spinner?: ReactNode;
  SuccessIcon?: ReactNode;
  FailedIcon?: ReactNode;
  Link?: FC<LinkProps>;
  USD?: FC<USDProps>;
  reviewDetails?: ReactNode;
  Label: FC<LabelProps>;
};

const SubmitOrderPanel = ({ SuccessView, ErrorView, MainView, LoadingView, Spinner, SuccessIcon, FailedIcon, Link, USD, reviewDetails, Label }: Props) => {
  const swapStatus = useTwapStore((s) => s.state.swapStatus);
  const totalSteps = useTwapStore((s) => s.state.totalSteps);
  const currentStepIndex = useTwapStore((s) => s.state.currentStepIndex);

  const {
    orderDetails: { srcAmount, dstAmount, srcToken, dstToken },
    onSubmitOrder,
    isLoading,
    explorerUrl,
  } = useOrderExecutionFlow();

  return (
    <SwapFlowComponent
      swapStatus={swapStatus}
      totalSteps={totalSteps}
      currentStep={useStep()}
      currentStepIndex={currentStepIndex}
      failedContent={<Failed component={ErrorView} />}
      successContent={<SuccessContent explorerUrl={explorerUrl} component={SuccessView} />}
      mainContent={<Main Label={Label} isLoading={Boolean(isLoading)} onSubmitOrder={onSubmitOrder} component={MainView} USD={USD} reviewDetails={reviewDetails} />}
      LoadingView={LoadingView}
      srcAmount={srcAmount}
      dstAmount={dstAmount}
      inToken={srcToken}
      outToken={dstToken}
      Spinner={Spinner}
      SuccessIcon={SuccessIcon}
      FailedIcon={FailedIcon}
      Link={Link}
    />
  );
};

const SuccessContent = ({ component, explorerUrl }: { component?: ReactNode; explorerUrl?: string }) => {
  const successTitle = useTitle();

  if (component) {
    return component;
  }
  return <SwapFlow.Success title={successTitle} explorerUrl={explorerUrl} />;
};

export { SubmitOrderPanel };
