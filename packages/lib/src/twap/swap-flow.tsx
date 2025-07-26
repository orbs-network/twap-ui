import React from "react";
import { Step, SwapFlow, SwapStatus } from "@orbs-network/swap-ui";
import { useTwapContext } from "../context";
import { Token } from "../types";
import { useFormatNumber } from "../hooks/useFormatNumber";

export function SwapFlowComponent({
  failedContent,
  successContent,
  mainContent,
  loadingViewContent,
  totalSteps,
  currentStep,
  currentStepIndex,
  swapStatus,
  className = "",
  inToken,
  outToken,
  srcAmount,
  dstAmount,
}: {
  failedContent: React.ReactNode;
  successContent?: React.ReactNode;
  mainContent?: React.ReactNode;
  loadingViewContent?: React.ReactNode;
  totalSteps?: number;
  currentStep?: Step;
  currentStepIndex?: number;
  swapStatus?: SwapStatus;
  className?: string;
  inToken?: Token;
  outToken?: Token;
  srcAmount?: string;
  dstAmount?: string;
}) {
  const { components, TransactionModal } = useTwapContext();
  const srcAmountF = useFormatNumber({ value: srcAmount, decimalScale: 2 });
  const outAmountF = useFormatNumber({ value: dstAmount, decimalScale: 2 });
  return (
    <SwapFlow
      className={className}
      inAmount={srcAmountF}
      outAmount={outAmountF}
      swapStatus={swapStatus}
      totalSteps={totalSteps}
      currentStep={currentStep}
      currentStepIndex={currentStepIndex}
      inToken={inToken}
      outToken={outToken}
      components={{
        SrcTokenLogo: components.TokenLogo && <components.TokenLogo token={inToken} />,
        DstTokenLogo: components.TokenLogo && <components.TokenLogo token={outToken} />,
        Failed: failedContent,
        Success: successContent,
        Main: mainContent,
        Loader: TransactionModal?.Spinner,
        SuccessIcon: TransactionModal?.SuccessIcon,
        FailedIcon: TransactionModal?.ErrorIcon,
        Link: TransactionModal?.Link,
        LoadingView: loadingViewContent,
      }}
    />
  );
}
